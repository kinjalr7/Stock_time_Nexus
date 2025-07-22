from fastapi import APIRouter, HTTPException
from .models import stocks, orders, Order, Stock
import uuid

router = APIRouter()

@router.get("/stocks", response_model=list[Stock])
def get_stocks():
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