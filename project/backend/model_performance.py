from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .predictor import forecast, train_model, save_metrics_to_db
from .database import db_cursor

router = APIRouter()

class ForecastOut(BaseModel):
    date: str
    predicted: float
    confidence: float

class MetricOut(BaseModel):
    model_type: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    trained_at: Optional[str] = None

class TrainRequest(BaseModel):
    model_type: str

class TrainResponse(BaseModel):
    symbol: str
    model_type: str
    mae: float
    rmse: float
    r2: float
    trained_at: str
    model_path: str


@router.post("/train/{symbol}", response_model=TrainResponse)
def train_model_endpoint(symbol: str, request: TrainRequest):
    """Train the model for a given symbol on-demand."""
    try:
        model_type = request.model_type.lower().strip()
        result = train_model(symbol, model_type)
        return {
            "symbol": symbol.upper(),
            "model_type": model_type,
            "mae": result["mae"],
            "rmse": result["rmse"],
            "r2": result["r2"],
            "trained_at": result["trained_at"],
            "model_path": result["model_path"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.get("/forecast/{symbol}", response_model=List[ForecastOut])
def get_forecast(symbol: str, model_type: str = "arima"):
    """Get 30-day forecast predictions for the symbol."""
    try:
        m_type = model_type.lower().strip()
        predictions = forecast(symbol, m_type)
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting failed: {str(e)}")


@router.get("/metrics/{symbol}", response_model=List[MetricOut])
def get_model_metrics(symbol: str):
    """Return stored model metrics for the given symbol."""
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT model_type, mae, rmse, r2, trained_at
            FROM model_metrics
            WHERE symbol = ?
            """,
            (symbol.upper(),),
        )
        rows = cur.fetchall()
        # If no metrics exist, return empty list instead of 404 to be UI friendly
        if not rows:
            return []
        return [
            {
                "model_type": row["model_type"],
                "mae": row["mae"],
                "rmse": row["rmse"],
                "r2": row["r2"],
                "trained_at": row["trained_at"],
            }
            for row in rows
        ]