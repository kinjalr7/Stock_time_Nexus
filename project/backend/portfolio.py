from fastapi import APIRouter, HTTPException
from .models import portfolio, PortfolioHolding

router = APIRouter()

@router.get("/", response_model=list[PortfolioHolding])
def get_portfolio():
    return portfolio

@router.get("/analytics")
def get_portfolio_analytics():
    total_value = sum(h.value for h in portfolio)
    total_pnl = sum(h.pnl for h in portfolio)
    return {"total_value": total_value, "total_pnl": total_pnl}

@router.post("/buy")
def buy_stock(symbol: str, quantity: int, price: float):
    for h in portfolio:
        if h.symbol == symbol:
            h.quantity += quantity
            h.value = h.quantity * price
            h.current_price = price
            h.pnl = h.value - h.avg_price * h.quantity
            return h
    new_h = PortfolioHolding(symbol=symbol, quantity=quantity, avg_price=price, current_price=price, value=quantity*price, pnl=0)
    portfolio.append(new_h)
    return new_h

@router.post("/sell")
def sell_stock(symbol: str, quantity: int, price: float):
    for h in portfolio:
        if h.symbol == symbol:
            if h.quantity < quantity:
                raise HTTPException(status_code=400, detail="Not enough shares")
            h.quantity -= quantity
            h.value = h.quantity * price
            h.current_price = price
            h.pnl = h.value - h.avg_price * h.quantity
            return h
    raise HTTPException(status_code=404, detail="Stock not found") 