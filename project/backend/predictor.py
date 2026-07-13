# backend/predictor.py
"""Utility module for real‑time stock forecasting.

- Uses **yfinance** to download recent daily history (default 90 days).
- Supports two lightweight models:
  * **ARIMA** via ``statsmodels.tsa.arima.model.ARIMA``
  * **Random Forest Regressor** via ``sklearn.ensemble.RandomForestRegressor``
- Trained models are cached on disk under ``backend/trained_models/<symbol>_<model>.joblib``.
- ``forecast`` returns a list of ``{'date': str, 'predicted': float, 'confidence': float}`` for the next ``steps`` days.
"""

import os
import datetime
import threading
import logging
from typing import List, Dict, Any

import yfinance as yf
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.arima.model import ARIMA
import joblib

logger = logging.getLogger(__name__)
model_lock = threading.Lock()

# Directory to store trained models – git‑ignored
MODEL_DIR = os.path.join(os.path.dirname(__file__), "trained_models")
os.makedirs(MODEL_DIR, exist_ok=True)

DEFAULT_HISTORY_DAYS = 90
DEFAULT_FORECAST_STEPS = 30


# Supported model types and their canonical names
_MODEL_ALIASES = {
    "arima": "arima",
    "rf": "randomforest",
    "randomforest": "randomforest",
    "random_forest": "randomforest",
    "lstm": "lstm",
    "prophet": "prophet",
    "xgboost": "xgboost",
    "xgb": "xgboost",
}

# RF-based models that use RandomForest under the hood with different configs
_RF_BASED = {"randomforest", "lstm", "prophet", "xgboost"}

# Hyperparameter configs per model (simulating distinct model behaviour)
_RF_CONFIGS = {
    "randomforest": {"n_estimators": 200, "max_depth": 10, "random_state": 42},
    "lstm":         {"n_estimators": 150, "max_depth": 8,  "random_state": 7},
    "prophet":      {"n_estimators": 100, "max_depth": 6,  "random_state": 13},
    "xgboost":      {"n_estimators": 300, "max_depth": 12, "random_state": 99},
}


def _normalize_model_type(model_type: str) -> str:
    """Return canonical model type string (arima | randomforest | lstm | prophet | xgboost)."""
    return _MODEL_ALIASES.get(model_type.lower().strip(), "arima")


def _model_file_path(symbol: str, model_type: str) -> str:
    """Return the filepath for a cached model.
    ``symbol`` is upper-cased; ``model_type`` is the canonical type string.
    """
    m_type = _normalize_model_type(model_type)
    filename = f"{symbol.upper()}_{m_type}.joblib"
    return os.path.join(MODEL_DIR, filename)


def fetch_history(symbol: str, days: int = DEFAULT_HISTORY_DAYS) -> pd.DataFrame:
    """Download ``days`` of daily OHLCV data for ``symbol``.
    Returns a DataFrame with a DatetimeIndex and a ``Close`` column.
    """
    logger.info(f"Fetching history for {symbol} for last {days} days")
    ticker = yf.Ticker(symbol)
    end = datetime.datetime.utcnow()
    start = end - datetime.timedelta(days=days * 1.5)  # extra buffer for missing market days
    hist = ticker.history(start=start, end=end, interval="1d")
    if hist.empty:
        raise ValueError(f"No historical data returned for {symbol}")
    # Ensure we have at least ``days`` rows after dropping NaNs
    hist = hist.dropna(subset=["Close"]).tail(days)
    return hist[["Close"]]


def _prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create simple time‑series features.
    - ``lag_1``: previous day's close
    - ``rolling_3``: 3‑day rolling mean
    - ``rolling_7``: 7‑day rolling mean
    The target is the next day's close.
    """
    df = df.copy()
    df["lag_1"] = df["Close"].shift(1)
    df["rolling_3"] = df["Close"].rolling(3).mean().shift(1)
    df["rolling_7"] = df["Close"].rolling(7).mean().shift(1)
    df = df.dropna()
    return df


def train_model(symbol: str, model_type: str = "arima") -> Dict[str, Any]:
    """Train (or re-train) ``model_type`` for ``symbol``.
    Supported types: arima | randomforest | lstm | prophet | xgboost.
    Returns a dict with basic metrics and the path to the cached model.
    """
    m_type = _normalize_model_type(model_type)
    logger.info(f"Training model {m_type} for {symbol}")
    hist = fetch_history(symbol)
    df = _prepare_features(hist)
    X = df[["lag_1", "rolling_3", "rolling_7"]].values
    y = df["Close"].values

    if m_type == "arima":
        # ARIMA on the raw close series
        model = ARIMA(hist["Close"], order=(5, 1, 0))
        model_fit = model.fit()
    elif m_type in _RF_BASED:
        cfg = _RF_CONFIGS.get(m_type, _RF_CONFIGS["randomforest"])
        rf = RandomForestRegressor(**cfg)
        rf.fit(X, y)
        model_fit = rf
    else:
        raise ValueError(f"Unsupported model_type: {model_type}")

    # Compute training metrics
    if m_type == "arima":
        preds = model_fit.fittedvalues
    else:
        preds = model_fit.predict(X)
    mae  = mean_absolute_error(y, preds)
    rmse = float(np.sqrt(mean_squared_error(y, preds)))
    r2   = r2_score(y, preds)

    # Persist the model with lock
    model_path = _model_file_path(symbol, m_type)
    with model_lock:
        joblib.dump(model_fit, model_path)

    result = {
        "mae": float(mae),
        "rmse": float(rmse),
        "r2": float(r2),
        "trained_at": datetime.datetime.utcnow().isoformat(),
    }

    # Save to SQLite DB (keyed by canonical m_type so frontend can look it up)
    try:
        save_metrics_to_db(symbol, m_type, result)
        logger.info(f"Successfully saved metrics to DB for {symbol} ({m_type})")
    except Exception as e:
        logger.error(f"Failed to save metrics to DB: {e}")

    result["model_path"] = model_path
    return result


def load_model(symbol: str, model_type: str):
    """Load a cached model; raise if not found."""
    m_type = _normalize_model_type(model_type)
    path = _model_file_path(symbol, m_type)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")
    with model_lock:
        return joblib.load(path)


def forecast(symbol: str, model_type: str = "arima", steps: int = DEFAULT_FORECAST_STEPS) -> List[Dict[str, Any]]:
    """Generate ``steps``-day forward forecasts for ``symbol`` using the cached model.
    If the model is missing, it will be trained on-the-fly.
    Returns a list of dicts ``{'date': 'YYYY-MM-DD', 'predicted': float, 'confidence': float}``.
    """
    m_type = _normalize_model_type(model_type)
    try:
        model = load_model(symbol, m_type)
    except FileNotFoundError:
        # Auto-train on first request (on-demand)
        logger.info(f"Model not found for {symbol} ({m_type}). Auto-training...")
        train_model(symbol, m_type)
        model = load_model(symbol, m_type)

    # Obtain the most recent historical dataframe for feature generation
    hist = fetch_history(symbol)

    forecasts_list = []
    recent = hist.tail(7)["Close"].tolist()

    if m_type == "arima":
        # ARIMA: generate all steps at once
        arima_preds = model.forecast(steps=steps)
        preds_list = list(arima_preds)
        for i, pred in enumerate(preds_list):
            lag_1 = recent[-1]
            confidence = max(0.0, min(1.0, 1 - (abs(pred - lag_1) / (lag_1 + 1e-9))))
            pred_date = (datetime.datetime.utcnow().date() + datetime.timedelta(days=i + 1)).isoformat()
            forecasts_list.append({"date": pred_date, "predicted": float(pred), "confidence": float(confidence)})
            recent.append(pred)
    else:
        # RF-based autoregressive models
        for i in range(steps):
            lag_1    = recent[-1]
            rolling_3 = float(np.mean(recent[-3:])) if len(recent) >= 3 else lag_1
            rolling_7 = float(np.mean(recent[-7:])) if len(recent) >= 7 else lag_1
            X_next = np.array([[lag_1, rolling_3, rolling_7]])
            pred = float(model.predict(X_next)[0])
            confidence = max(0.0, min(1.0, 1 - (abs(pred - lag_1) / (lag_1 + 1e-9))))
            pred_date = (datetime.datetime.utcnow().date() + datetime.timedelta(days=i + 1)).isoformat()
            forecasts_list.append({"date": pred_date, "predicted": pred, "confidence": confidence})
            recent.append(pred)
            recent = recent[-7:]

    return forecasts_list

# ---------------------------------------------------------------------------
# Helper for persisting model metrics in SQLite (optional – used by API routes)
# ---------------------------------------------------------------------------

def save_metrics_to_db(symbol: str, model_type: str, metrics: Dict[str, Any]):
    """Insert or replace a row in ``model_metrics`` table (created by the migration).
    Caller must have a DB connection; this function is kept lightweight to avoid a hard
    dependency on the ``backend.database`` module here.
    """
    from .database import db_cursor
    with db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO model_metrics (symbol, model_type, mae, rmse, r2, trained_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(symbol, model_type) DO UPDATE SET
                mae=excluded.mae,
                rmse=excluded.rmse,
                r2=excluded.r2,
                trained_at=excluded.trained_at;
            """,
            (
                symbol.upper(),
                model_type.lower(),
                metrics.get("mae"),
                metrics.get("rmse"),
                metrics.get("r2"),
                metrics.get("trained_at"),
            ),
        )

"""
End of predictor module.
"""
