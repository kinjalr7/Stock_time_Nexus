from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from .predictor import forecast, train_model, save_metrics_to_db
from .database import db_cursor

router = APIRouter()
from .models import model_metrics, ModelMetric

router = APIRouter()

@router.get("/metrics/{symbol}", response_model=List[Dict[str, Any]])
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
        if not rows:
            raise HTTPException(status_code=404, detail="No metrics found for symbol")
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