from pydantic import BaseModel
from typing import List, Optional
import time

class Stock(BaseModel):
    symbol: str
    price: float

class Order(BaseModel):
    id: str
    symbol: str
    start_price: float
    end_price: float
    quantity: int
    strategy: str
    status: str = "active"
    created_at: float = time.time()

class PortfolioHolding(BaseModel):
    symbol: str
    quantity: int
    avg_price: float
    current_price: float
    value: float
    pnl: float

class ModelMetric(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape: float
    r2: float

# In-memory demo data
stocks: List[Stock] = [
    Stock(symbol="AAPL", price=185.20),
    Stock(symbol="TSLA", price=245.80),
    Stock(symbol="MSFT", price=375.40),
    Stock(symbol="GOOGL", price=144.20),
]

orders: List[Order] = []

portfolio: List[PortfolioHolding] = [
    PortfolioHolding(symbol="AAPL", quantity=10, avg_price=180.0, current_price=185.2, value=1852.0, pnl=52.0),
    PortfolioHolding(symbol="TSLA", quantity=5, avg_price=250.0, current_price=245.8, value=1229.0, pnl=-21.0),
]

model_metrics: List[ModelMetric] = [
    ModelMetric(model_name="LSTM", mae=1.2, rmse=2.1, mape=3.5, r2=0.92),
    ModelMetric(model_name="ARIMA", mae=1.5, rmse=2.4, mape=4.1, r2=0.89),
    ModelMetric(model_name="Prophet", mae=1.3, rmse=2.2, mape=3.8, r2=0.91),
] 