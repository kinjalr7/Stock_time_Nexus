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
from typing import List, Dict, Any

import yfinance as yf
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from statsmodels.tsa.arima.model import ARIMA
import joblib

# Directory to store trained models – git‑ignored
MODEL_DIR = os.path.join(os.path.dirname(__file__), "trained_models")
os.makedirs(MODEL_DIR, exist_ok=True)

DEFAULT_HISTORY_DAYS = 90
DEFAULT_FORECAST_STEPS = 30


def _model_file_path(symbol: str, model_type: str) -> str:
    """Return the filepath for a cached model.
    ``symbol`` is upper‑cased; ``model_type`` should be ``arima`` or ``rf``.
    """
    filename = f"{symbol.upper()}_{model_type.lower()}.joblib"
    return os.path.join(MODEL_DIR, filename)


def fetch_history(symbol: str, days: int = DEFAULT_HISTORY_DAYS) -> pd.DataFrame:
    """Download ``days`` of daily OHLCV data for ``symbol``.
    Returns a DataFrame with a DatetimeIndex and a ``Close`` column.
    """
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
    """Train (or re‑train) ``model_type`` for ``symbol``.
    Supported ``model_type`` values: ``"arima"`` or ``"rf"`` (random forest).
    Returns a dict with basic metrics and the path to the cached model.
    """
    hist = fetch_history(symbol)
    df = _prepare_features(hist)
    X = df[["lag_1", "rolling_3", "rolling_7"]].values
    y = df["Close"].values

    if model_type.lower() == "arima":
        # ARIMA on the raw close series (order (5,1,0) works reasonably for short series)
        model = ARIMA(hist["Close"], order=(5, 1, 0))
        model_fit = model.fit()
        # Forecast next ``steps`` points directly via the ARIMA model
        # (metrics are computed on the training split below)
    elif model_type.lower() in {"rf", "randomforest"}:
        rf = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
        rf.fit(X, y)
        model_fit = rf
    else:
        raise ValueError(f"Unsupported model_type: {model_type}")

    # Compute simple training metrics for reporting
    preds = model_fit.predict(X) if model_type.lower() != "arima" else model_fit.fittedvalues
    mae = mean_absolute_error(y, preds)
    rmse = mean_squared_error(y, preds, squared=False)
    r2 = r2_score(y, preds)

    # Persist the model
    model_path = _model_file_path(symbol, model_type)
    joblib.dump(model_fit, model_path)

    return {
        "model_path": model_path,
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "trained_at": datetime.datetime.utcnow().isoformat(),
    }


def load_model(symbol: str, model_type: str):
    """Load a cached model; raise if not found."""
    path = _model_file_path(symbol, model_type)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found: {path}")
    return joblib.load(path)


def forecast(symbol: str, model_type: str = "arima", steps: int = DEFAULT_FORECAST_STEPS) -> List[Dict[str, Any]]:
    """Generate ``steps``‑day forward forecasts for ``symbol`` using the cached model.
    If the model is missing, it will be trained on‑the‑fly.
    Returns a list of dicts ``{'date': 'YYYY‑MM‑DD', 'predicted': float, 'confidence': float}``.
    """
    try:
        model = load_model(symbol, model_type)
    except FileNotFoundError:
        # Auto‑train on first request (on‑demand)
        train_model(symbol, model_type)
        model = load_model(symbol, model_type)

    # Obtain the most recent historical dataframe for feature generation
    hist = fetch_history(symbol)
    last_close = hist["Close"].iloc[-1]
    # Simple feature base for future steps – we will iteratively predict using the model
    forecasts = []
    # Prepare initial feature vector (using last known values)
    recent = hist.tail(7)["Close"].tolist()
    for i in range(steps):
        # Build features for the next step
        lag_1 = recent[-1]
        rolling_3 = np.mean(recent[-3:]) if len(recent) >= 3 else lag_1
        rolling_7 = np.mean(recent[-7:]) if len(recent) >= 7 else lag_1
        X_next = np.array([[lag_1, rolling_3, rolling_7]])
        if model_type.lower() == "arima":
            # ARIMA forecasting via built‑in ``forecast`` method
            # We ask the model to forecast one step ahead from the original series
            pred = model.forecast(steps=1)[0]
        else:
            pred = model.predict(X_next)[0]
        # Confidence proxy – inverse of recent MAE (clamped between 0.6 and 0.95)
        # For demo purposes we compute a simple heuristic
        confidence = max(0.6, min(0.95, 1 - (abs(pred - lag_1) / lag_1)))
        # Record prediction
        pred_date = (datetime.datetime.utcnow().date() + datetime.timedelta(days=i + 1)).isoformat()
        forecasts.append({"date": pred_date, "predicted": float(pred), "confidence": float(confidence)})
        # Append prediction to recent list for next iteration
        recent.append(pred)
        recent = recent[-7:]
    return forecasts

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
