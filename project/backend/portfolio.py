"""
Phase 1 + 2: Portfolio API with SQLite persistence + live yfinance prices.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import yfinance as yf
import datetime
from .database import db_cursor
from .utils import get_stock_price

router = APIRouter()


class PortfolioHolding(BaseModel):
    symbol: str
    quantity: int
    avg_price: float
    current_price: float
    value: float
    pnl: float


class BuyRequest(BaseModel):
    symbol: str
    quantity: int
    price: float


class SellRequest(BaseModel):
    symbol: str
    quantity: int
    price: float


def _get_holdings(username: str = "demo") -> list[PortfolioHolding]:
    """Fetch holdings from DB and enrich with live prices."""
    with db_cursor() as cur:
        cur.execute(
            "SELECT symbol, quantity, avg_price FROM portfolio_holdings WHERE username = ?",
            (username,),
        )
        rows = cur.fetchall()

    holdings = []
    for row in rows:
        symbol, quantity, avg_price = row["symbol"], row["quantity"], row["avg_price"]
        live_price = get_stock_price(symbol) or avg_price
        value = quantity * live_price
        pnl = value - (avg_price * quantity)
        holdings.append(
            PortfolioHolding(
                symbol=symbol,
                quantity=quantity,
                avg_price=avg_price,
                current_price=round(live_price, 2),
                value=round(value, 2),
                pnl=round(pnl, 2),
            )
        )
    return holdings


@router.get("/", response_model=list[PortfolioHolding])
def get_portfolio(username: str = "demo"):
    return _get_holdings(username)


@router.get("/analytics")
def get_portfolio_analytics(username: str = "demo"):
    holdings = _get_holdings(username)
    total_value = sum(h.value for h in holdings)
    total_pnl = sum(h.pnl for h in holdings)
    return {
        "total_value": round(total_value, 2),
        "total_pnl": round(total_pnl, 2),
        "positions": len(holdings),
    }


@router.post("/buy", response_model=PortfolioHolding)
def buy_stock(req: BuyRequest, username: str = "demo"):
    with db_cursor() as cur:
        cur.execute(
            "SELECT quantity, avg_price FROM portfolio_holdings WHERE username = ? AND symbol = ?",
            (username, req.symbol),
        )
        existing = cur.fetchone()

        if existing:
            old_qty = existing["quantity"]
            old_avg = existing["avg_price"]
            new_qty = old_qty + req.quantity
            new_avg = ((old_avg * old_qty) + (req.price * req.quantity)) / new_qty
            cur.execute(
                "UPDATE portfolio_holdings SET quantity = ?, avg_price = ? WHERE username = ? AND symbol = ?",
                (new_qty, new_avg, username, req.symbol),
            )
        else:
            cur.execute(
                "INSERT INTO portfolio_holdings (username, symbol, quantity, avg_price) VALUES (?, ?, ?, ?)",
                (username, req.symbol, req.quantity, req.price),
            )

    live_price = get_stock_price(req.symbol) or req.price
    # re-fetch to return accurate data
    with db_cursor() as cur:
        cur.execute(
            "SELECT quantity, avg_price FROM portfolio_holdings WHERE username = ? AND symbol = ?",
            (username, req.symbol),
        )
        row = cur.fetchone()

    qty = row["quantity"]
    avg = row["avg_price"]
    value = qty * live_price
    return PortfolioHolding(
        symbol=req.symbol,
        quantity=qty,
        avg_price=round(avg, 2),
        current_price=round(live_price, 2),
        value=round(value, 2),
        pnl=round(value - avg * qty, 2),
    )


@router.post("/sell", response_model=PortfolioHolding)
def sell_stock(req: SellRequest, username: str = "demo"):
    with db_cursor() as cur:
        cur.execute(
            "SELECT quantity, avg_price FROM portfolio_holdings WHERE username = ? AND symbol = ?",
            (username, req.symbol),
        )
        existing = cur.fetchone()

    if not existing:
        raise HTTPException(status_code=404, detail="Stock not found in portfolio")
    if existing["quantity"] < req.quantity:
        raise HTTPException(status_code=400, detail="Not enough shares")

    new_qty = existing["quantity"] - req.quantity
    with db_cursor() as cur:
        if new_qty == 0:
            cur.execute(
                "DELETE FROM portfolio_holdings WHERE username = ? AND symbol = ?",
                (username, req.symbol),
            )
        else:
            cur.execute(
                "UPDATE portfolio_holdings SET quantity = ? WHERE username = ? AND symbol = ?",
                (new_qty, username, req.symbol),
            )

    live_price = get_stock_price(req.symbol) or req.price
    avg = existing["avg_price"]
    value = new_qty * live_price
    return PortfolioHolding(
        symbol=req.symbol,
        quantity=new_qty,
        avg_price=round(avg, 2),
        current_price=round(live_price, 2),
        value=round(value, 2),
        pnl=round(value - avg * new_qty, 2),
    )


@router.get("/history")
def get_portfolio_history(username: str = "demo", timeframe: str = "1M"):
    # Map timeframe to yfinance period
    tf_map = {
        "1W": "7d",
        "1M": "1mo",
        "3M": "3mo",
        "6M": "6mo",
        "1Y": "1y"
    }
    period = tf_map.get(timeframe, "1mo")
    
    holdings = _get_holdings(username)
    
    # Define fallback if there are no holdings
    if not holdings:
        tf_days = {
            "1W": 7,
            "1M": 30,
            "3M": 90,
            "6M": 180,
            "1Y": 365
        }
        days = tf_days.get(timeframe, 30)
        today = datetime.date.today()
        history_points = []
        for i in range(days):
            date_str = (today - datetime.timedelta(days=days - 1 - i)).strftime('%Y-%m-%d')
            history_points.append({
                "date": date_str,
                "value": 50000.0,
                "benchmark": 50000.0
            })
        return history_points
        
    benchmark_symbol = "^GSPC"
    
    # Fetch history for benchmark
    try:
        bench_ticker = yf.Ticker(benchmark_symbol)
        bench_hist = bench_ticker.history(period=period)
    except Exception as e:
        print(f"Error fetching benchmark history: {e}")
        bench_hist = None
        
    # Fetch history for each holding stock
    holdings_hist = {}
    for h in holdings:
        try:
            ticker = yf.Ticker(h.symbol)
            df = ticker.history(period=period)
            if not df.empty:
                holdings_hist[h.symbol] = {
                    dt.strftime('%Y-%m-%d'): close_val 
                    for dt, close_val in zip(df.index, df['Close'])
                }
        except Exception as e:
            print(f"Error fetching history for {h.symbol}: {e}")

    # Build date dictionary for benchmark
    bench_data = {}
    if bench_hist is not None and not bench_hist.empty:
        bench_data = {
            dt.strftime('%Y-%m-%d'): close_val 
            for dt, close_val in zip(bench_hist.index, bench_hist['Close'])
        }

    # Identify date list to align on
    if bench_data:
        dates = sorted(list(bench_data.keys()))
    elif holdings_hist:
        dates = sorted(list(next(iter(holdings_hist.values())).keys()))
    else:
        # Fallback dummy dates if all downloads failed
        tf_days = {
            "1W": 7,
            "1M": 30,
            "3M": 90,
            "6M": 180,
            "1Y": 365
        }
        days = tf_days.get(timeframe, 30)
        today = datetime.date.today()
        dates = [(today - datetime.timedelta(days=days - 1 - i)).strftime('%Y-%m-%d') for i in range(days)]

    if not dates:
        return []

    # First day portfolio value calculation
    first_date = dates[0]
    first_portfolio_val = 50000.0
    for symbol, price_dict in holdings_hist.items():
        qty = next(h.quantity for h in holdings if h.symbol == symbol)
        if first_date in price_dict:
            first_portfolio_val += qty * price_dict[first_date]
        elif price_dict:
            first_portfolio_val += qty * next(iter(price_dict.values()))
            
    first_bench_price = bench_data.get(first_date, 1.0)
    if not first_bench_price or first_bench_price == 0:
        first_bench_price = 1.0

    history_points = []
    
    # Store running last known prices for safety
    last_known_prices = {}
    for symbol, price_dict in holdings_hist.items():
        if price_dict:
            last_known_prices[symbol] = next(iter(price_dict.values()))
    last_known_bench = first_bench_price

    for date_str in dates:
        portfolio_val = 50000.0
        for symbol, price_dict in holdings_hist.items():
            qty = next(h.quantity for h in holdings if h.symbol == symbol)
            if date_str in price_dict:
                price = price_dict[date_str]
                last_known_prices[symbol] = price
            else:
                price = last_known_prices.get(symbol, 0.0)
            portfolio_val += qty * price
            
        bench_price = bench_data.get(date_str, last_known_bench)
        last_known_bench = bench_price
        scaled_bench = (bench_price / first_bench_price) * first_portfolio_val
        
        history_points.append({
            "date": date_str,
            "value": round(portfolio_val, 2),
            "benchmark": round(scaled_bench, 2)
        })
        
    return history_points