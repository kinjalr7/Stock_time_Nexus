from fastapi import APIRouter, HTTPException
from .models import stocks, orders, Order, Stock
from .utils import get_stock_price
import uuid

router = APIRouter()

@router.get("/stocks", response_model=list[Stock])
def get_stocks():
    for s in stocks:
        live_price = get_stock_price(s.symbol)
        if live_price:
            s.price = live_price
    return stocks

@router.get("/orders", response_model=list[Order])
def get_orders():
    return orders

@router.post("/orders", response_model=Order)
def place_order(order: Order):
    order.id = str(uuid.uuid4())
    orders.append(order)
    return order

@router.delete("/orders/{order_id}")
def cancel_order(order_id: str):
    for o in orders:
        if o.id == order_id:
            o.status = "cancelled"
            return {"success": True}
    raise HTTPException(status_code=404, detail="Order not found") 