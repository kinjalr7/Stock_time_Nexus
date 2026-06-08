"""
Phase 2 – Stock data endpoint for the frontend.
Returns live price, change, and rich metadata for a list of symbols.
Also provides a watchlist management endpoint.
"""
from fastapi import APIRouter, HTTPException
from .utils import get_stock_price
from .database import db_cursor
import yfinance as yf
from typing import Optional

router = APIRouter()

# Sector/industry/name mappings (lightweight – avoids a slow API call per request)
STOCK_META = {
    "AAPL":  {"name": "Apple Inc.",              "sector": "Technology",               "industry": "Consumer Electronics"},
    "TSLA":  {"name": "Tesla Inc.",               "sector": "Consumer Discretionary",   "industry": "Electric Vehicles"},
    "MSFT":  {"name": "Microsoft Corporation",    "sector": "Technology",               "industry": "Software"},
    "GOOGL": {"name": "Alphabet Inc.",            "sector": "Technology",               "industry": "Internet Services"},
    "AMZN":  {"name": "Amazon.com Inc.",          "sector": "Consumer Discretionary",   "industry": "E-commerce"},
    "META":  {"name": "Meta Platforms Inc.",      "sector": "Technology",               "industry": "Social Media"},
    "NVDA":  {"name": "NVIDIA Corporation",       "sector": "Technology",               "industry": "Semiconductors"},
    "NFLX":  {"name": "Netflix Inc.",             "sector": "Communication Services",   "industry": "Streaming Services"},
    "AMD":   {"name": "Advanced Micro Devices",   "sector": "Technology",               "industry": "Semiconductors"},
    "INTC":  {"name": "Intel Corporation",        "sector": "Technology",               "industry": "Semiconductors"},
    "JPM":   {"name": "JPMorgan Chase & Co.",     "sector": "Financials",               "industry": "Banking"},
    "JNJ":   {"name": "Johnson & Johnson",        "sector": "Healthcare",               "industry": "Pharmaceuticals"},
    "V":     {"name": "Visa Inc.",                "sector": "Financials",               "industry": "Payment Services"},
    "WMT":   {"name": "Walmart Inc.",             "sector": "Consumer Staples",         "industry": "Retail"},
    "DIS":   {"name": "The Walt Disney Co.",      "sector": "Communication Services",   "industry": "Entertainment"},
    "PG":    {"name": "Procter & Gamble Co.",     "sector": "Consumer Staples",         "industry": "Household Products"},
    "PYPL":  {"name": "PayPal Holdings Inc.",     "sector": "Financials",               "industry": "Payment Services"},
    "CRM":   {"name": "Salesforce Inc.",          "sector": "Technology",               "industry": "Cloud Software"},
}


def _get_meta(symbol: str) -> dict:
    return STOCK_META.get(symbol, {
        "name": f"{symbol} Corporation",
        "sector": "Unknown",
        "industry": "Unknown",
    })


@router.get("/quote/{symbol}")
def get_quote(symbol: str):
    """Return live quote + 90-day history for one symbol."""
    sym = symbol.upper()
    try:
        ticker = yf.Ticker(sym)
        info = ticker.fast_info
        hist = ticker.history(period="90d")

        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {sym}")

        current_price = float(info.last_price or hist["Close"].iloc[-1])
        prev_close = float(info.previous_close or hist["Close"].iloc[-2] if len(hist) > 1 else current_price)
        change = current_price - prev_close
        change_pct = (change / prev_close * 100) if prev_close else 0

        historical = [
            {
                "date": str(idx.date()),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for idx, row in hist.iterrows()
        ]

        meta = _get_meta(sym)
        return {
            "symbol": sym,
            "name": meta["name"],
            "sector": meta["sector"],
            "industry": meta["industry"],
            "price": round(current_price, 2),
            "change": round(change, 2),
            "changePercent": round(change_pct, 2),
            "volume": int(getattr(info, "three_month_average_volume", 0) or 0),
            "marketCap": int(getattr(info, "market_cap", 0) or 0),
            "high52w": round(float(getattr(info, "year_high", 0) or 0), 2),
            "low52w": round(float(getattr(info, "year_low", 0) or 0), 2),
            "historicalData": historical,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/batch")
def get_batch_quotes(symbols: str = "AAPL,TSLA,MSFT,GOOGL,NVDA,META,AMZN,NFLX,AMD,INTC"):
    """Return lightweight quotes for multiple symbols (for the market overview)."""
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    results = []
    for sym in sym_list:
        try:
            ticker = yf.Ticker(sym)
            info = ticker.fast_info
            price = float(info.last_price or 0)
            prev = float(info.previous_close or price)
            change = price - prev
            change_pct = (change / prev * 100) if prev else 0
            meta = _get_meta(sym)
            results.append({
                "symbol": sym,
                "name": meta["name"],
                "sector": meta["sector"],
                "price": round(price, 2),
                "change": round(change, 2),
                "changePercent": round(change_pct, 2),
            })
        except Exception as e:
            print(f"[stocks] Error fetching {sym}: {e}")
    return results


# ---- Watchlist endpoints ----

@router.get("/watchlist")
def get_watchlist(username: str = "demo"):
    with db_cursor() as cur:
        cur.execute("SELECT symbol FROM watchlist WHERE username = ?", (username,))
        rows = cur.fetchall()
    return [r["symbol"] for r in rows]


@router.post("/watchlist/{symbol}")
def add_to_watchlist(symbol: str, username: str = "demo"):
    sym = symbol.upper()
    with db_cursor() as cur:
        cur.execute(
            "INSERT OR IGNORE INTO watchlist (username, symbol) VALUES (?, ?)",
            (username, sym),
        )
    return {"status": "added", "symbol": sym}


@router.delete("/watchlist/{symbol}")
def remove_from_watchlist(symbol: str, username: str = "demo"):
    sym = symbol.upper()
    with db_cursor() as cur:
        cur.execute(
            "DELETE FROM watchlist WHERE username = ? AND symbol = ?",
            (username, sym),
        )
    return {"status": "removed", "symbol": sym}
