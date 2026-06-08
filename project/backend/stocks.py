"""
Stocks endpoint — Real-time + historical data.
Primary:  Finnhub REST API (free key, real-time quotes)
Fallback: yfinance (15-min delayed, no key needed)
"""
from fastapi import APIRouter, HTTPException
from .database import db_cursor
import yfinance as yf
import httpx
import os
from typing import Optional

router = APIRouter()

# ── Finnhub config ─────────────────────────────────────────────────────────────
FINNHUB_KEY  = os.getenv("FINNHUB_API_KEY", "")
FINNHUB_BASE = "https://finnhub.io/api/v1"

# ── Static metadata ─────────────────────────────────────────────────────────────
STOCK_META = {
    "AAPL":  {"name": "Apple Inc.",              "sector": "Technology",             "industry": "Consumer Electronics"},
    "TSLA":  {"name": "Tesla Inc.",               "sector": "Consumer Discretionary", "industry": "Electric Vehicles"},
    "MSFT":  {"name": "Microsoft Corporation",    "sector": "Technology",             "industry": "Software"},
    "GOOGL": {"name": "Alphabet Inc.",            "sector": "Technology",             "industry": "Internet Services"},
    "AMZN":  {"name": "Amazon.com Inc.",          "sector": "Consumer Discretionary", "industry": "E-commerce"},
    "META":  {"name": "Meta Platforms Inc.",      "sector": "Technology",             "industry": "Social Media"},
    "NVDA":  {"name": "NVIDIA Corporation",       "sector": "Technology",             "industry": "Semiconductors"},
    "NFLX":  {"name": "Netflix Inc.",             "sector": "Communication Services", "industry": "Streaming"},
    "AMD":   {"name": "Advanced Micro Devices",   "sector": "Technology",             "industry": "Semiconductors"},
    "INTC":  {"name": "Intel Corporation",        "sector": "Technology",             "industry": "Semiconductors"},
    "JPM":   {"name": "JPMorgan Chase & Co.",     "sector": "Financials",             "industry": "Banking"},
    "JNJ":   {"name": "Johnson & Johnson",        "sector": "Healthcare",             "industry": "Pharmaceuticals"},
    "V":     {"name": "Visa Inc.",                "sector": "Financials",             "industry": "Payment Services"},
    "WMT":   {"name": "Walmart Inc.",             "sector": "Consumer Staples",       "industry": "Retail"},
    "DIS":   {"name": "The Walt Disney Co.",      "sector": "Communication Services", "industry": "Entertainment"},
    "PG":    {"name": "Procter & Gamble Co.",     "sector": "Consumer Staples",       "industry": "Household Products"},
    "PYPL":  {"name": "PayPal Holdings Inc.",     "sector": "Financials",             "industry": "Payment Services"},
    "CRM":   {"name": "Salesforce Inc.",          "sector": "Technology",             "industry": "Cloud Software"},
    "UBER":  {"name": "Uber Technologies Inc.",   "sector": "Technology",             "industry": "Ride Sharing"},
    "SPOT":  {"name": "Spotify Technology SA",    "sector": "Communication Services", "industry": "Audio Streaming"},
    "COIN":  {"name": "Coinbase Global Inc.",     "sector": "Financials",             "industry": "Crypto Exchange"},
    "SHOP":  {"name": "Shopify Inc.",             "sector": "Technology",             "industry": "E-commerce Software"},
    "SQ":    {"name": "Block Inc.",               "sector": "Financials",             "industry": "Fintech"},
    "PLTR":  {"name": "Palantir Technologies",    "sector": "Technology",             "industry": "Data Analytics"},
    "BA":    {"name": "Boeing Co.",               "sector": "Industrials",            "industry": "Aerospace"},
    "GS":    {"name": "Goldman Sachs Group",      "sector": "Financials",             "industry": "Investment Banking"},
    "BABA":  {"name": "Alibaba Group",            "sector": "Consumer Discretionary", "industry": "E-commerce"},
    "TSM":   {"name": "Taiwan Semiconductor",     "sector": "Technology",             "industry": "Semiconductors"},
}


def _get_meta(symbol: str) -> dict:
    return STOCK_META.get(symbol, {
        "name": f"{symbol} Corporation",
        "sector": "Unknown",
        "industry": "Unknown",
    })


# ── Finnhub helpers ─────────────────────────────────────────────────────────────

def _finnhub_quote(symbol: str) -> Optional[dict]:
    """Fetch real-time quote from Finnhub. Returns None if no key or error."""
    if not FINNHUB_KEY:
        return None
    try:
        resp = httpx.get(
            f"{FINNHUB_BASE}/quote",
            params={"symbol": symbol, "token": FINNHUB_KEY},
            timeout=6.0,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        # Finnhub returns {c: current, d: change, dp: change%, h: high, l: low, o: open, pc: prev_close, t: timestamp}
        if not data.get("c"):  # c=0 means no data
            return None
        return data
    except Exception as e:
        print(f"[Finnhub] quote error for {symbol}: {e}")
        return None


def _finnhub_candles(symbol: str, days: int = 90) -> list:
    """Fetch OHLCV candles from Finnhub (free: daily resolution)."""
    if not FINNHUB_KEY:
        return []
    import time
    to_ts   = int(time.time())
    from_ts = to_ts - days * 86400
    try:
        resp = httpx.get(
            f"{FINNHUB_BASE}/stock/candle",
            params={"symbol": symbol, "resolution": "D", "from": from_ts, "to": to_ts, "token": FINNHUB_KEY},
            timeout=10.0,
        )
        if resp.status_code != 200:
            return []
        data = resp.json()
        if data.get("s") != "ok":
            return []
        result = []
        for i, ts in enumerate(data.get("t", [])):
            import datetime
            result.append({
                "date": datetime.datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d"),
                "open":   round(data["o"][i], 2),
                "high":   round(data["h"][i], 2),
                "low":    round(data["l"][i], 2),
                "close":  round(data["c"][i], 2),
                "volume": int(data["v"][i]),
            })
        return result
    except Exception as e:
        print(f"[Finnhub] candles error for {symbol}: {e}")
        return []


def _finnhub_company_profile(symbol: str) -> dict:
    """Fetch company profile (market cap, sector etc.) from Finnhub."""
    if not FINNHUB_KEY:
        return {}
    try:
        resp = httpx.get(
            f"{FINNHUB_BASE}/stock/profile2",
            params={"symbol": symbol, "token": FINNHUB_KEY},
            timeout=6.0,
        )
        if resp.status_code != 200:
            return {}
        return resp.json()
    except Exception:
        return {}


# ── yfinance fallback ──────────────────────────────────────────────────────────

def _yf_quote_and_history(symbol: str) -> dict:
    """Fetch quote + history from yfinance (15-min delayed, no key needed)."""
    ticker = yf.Ticker(symbol)
    info   = ticker.fast_info
    hist   = ticker.history(period="90d")

    if hist.empty:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}")

    price      = float(info.last_price or hist["Close"].iloc[-1])
    prev_close = float(info.previous_close or (hist["Close"].iloc[-2] if len(hist) > 1 else price))
    change     = price - prev_close
    change_pct = (change / prev_close * 100) if prev_close else 0

    historical = [
        {
            "date":   str(idx.date()),
            "open":   round(float(row["Open"]),   2),
            "high":   round(float(row["High"]),   2),
            "low":    round(float(row["Low"]),    2),
            "close":  round(float(row["Close"]),  2),
            "volume": int(row["Volume"]),
        }
        for idx, row in hist.iterrows()
    ]

    return {
        "price":      round(price, 2),
        "change":     round(change, 2),
        "changePct":  round(change_pct, 2),
        "volume":     int(getattr(info, "three_month_average_volume", 0) or 0),
        "marketCap":  int(getattr(info, "market_cap", 0) or 0),
        "high52w":    round(float(getattr(info, "year_high", 0) or 0), 2),
        "low52w":     round(float(getattr(info, "year_low", 0) or 0), 2),
        "historical": historical,
        "source":     "yfinance (15-min delayed)",
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/quote/{symbol}")
def get_quote(symbol: str):
    """Return live quote + 90-day OHLCV history for one symbol.
    Tries Finnhub first (real-time), falls back to yfinance."""
    sym = symbol.upper()
    meta = _get_meta(sym)

    # ── Try Finnhub (real-time) ──────────────────────────────────────────────
    fh = _finnhub_quote(sym)
    if fh:
        historical = _finnhub_candles(sym, days=90)
        if not historical:
            # Fallback history from yfinance, but keep Finnhub price
            try:
                yf_data = _yf_quote_and_history(sym)
                historical = yf_data["historical"]
            except Exception:
                historical = []

        profile = _finnhub_company_profile(sym)
        mkt_cap = int(profile.get("marketCapitalization", 0) * 1_000_000)  # Finnhub gives in millions

        return {
            "symbol":        sym,
            "name":          profile.get("name") or meta["name"],
            "sector":        profile.get("gics_sector") or meta["sector"],
            "industry":      profile.get("gics_sub_industry") or meta["industry"],
            "price":         round(float(fh["c"]), 2),
            "change":        round(float(fh["d"]), 2),
            "changePercent": round(float(fh["dp"]), 2),
            "open":          round(float(fh["o"]), 2),
            "high":          round(float(fh["h"]), 2),
            "low":           round(float(fh["l"]), 2),
            "prevClose":     round(float(fh["pc"]), 2),
            "volume":        0,
            "marketCap":     mkt_cap,
            "high52w":       0.0,
            "low52w":        0.0,
            "historicalData": historical,
            "dataSource":    "finnhub-realtime",
            "timestamp":     fh.get("t", 0),
        }

    # ── Fallback: yfinance ───────────────────────────────────────────────────
    try:
        yf_data = _yf_quote_and_history(sym)
        return {
            "symbol":        sym,
            "name":          meta["name"],
            "sector":        meta["sector"],
            "industry":      meta["industry"],
            "price":         yf_data["price"],
            "change":        yf_data["change"],
            "changePercent": yf_data["changePct"],
            "volume":        yf_data["volume"],
            "marketCap":     yf_data["marketCap"],
            "high52w":       yf_data["high52w"],
            "low52w":        yf_data["low52w"],
            "historicalData": yf_data["historical"],
            "dataSource":    "yfinance-delayed",
            "timestamp":     0,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/live-price/{symbol}")
def get_live_price(symbol: str):
    """Lightweight endpoint — returns ONLY the current price for fast polling."""
    sym = symbol.upper()
    fh  = _finnhub_quote(sym)
    if fh and fh.get("c"):
        return {
            "symbol":        sym,
            "price":         round(float(fh["c"]), 2),
            "change":        round(float(fh["d"]), 2),
            "changePercent": round(float(fh["dp"]), 2),
            "high":          round(float(fh["h"]), 2),
            "low":           round(float(fh["l"]), 2),
            "open":          round(float(fh["o"]), 2),
            "prevClose":     round(float(fh["pc"]), 2),
            "timestamp":     fh.get("t", 0),
            "dataSource":    "finnhub-realtime",
        }
    # Fallback yfinance
    try:
        ticker = yf.Ticker(sym)
        info   = ticker.fast_info
        price  = float(info.last_price or 0)
        prev   = float(info.previous_close or price)
        change = price - prev
        return {
            "symbol":        sym,
            "price":         round(price, 2),
            "change":        round(change, 2),
            "changePercent": round((change / prev * 100) if prev else 0, 2),
            "high":          0.0,
            "low":           0.0,
            "open":          0.0,
            "prevClose":     round(prev, 2),
            "timestamp":     0,
            "dataSource":    "yfinance-delayed",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/batch")
def get_batch_quotes(symbols: str = "AAPL,TSLA,MSFT,GOOGL,NVDA,META,AMZN,NFLX,AMD,INTC"):
    """Batch lightweight quotes. Uses Finnhub per symbol, falls back to yfinance."""
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    results  = []

    for sym in sym_list:
        try:
            fh = _finnhub_quote(sym)
            if fh and fh.get("c"):
                meta = _get_meta(sym)
                results.append({
                    "symbol":        sym,
                    "name":          meta["name"],
                    "sector":        meta["sector"],
                    "price":         round(float(fh["c"]), 2),
                    "change":        round(float(fh["d"]), 2),
                    "changePercent": round(float(fh["dp"]), 2),
                    "dataSource":    "finnhub-realtime",
                })
            else:
                # yfinance fallback
                ticker = yf.Ticker(sym)
                info   = ticker.fast_info
                price  = float(info.last_price or 0)
                prev   = float(info.previous_close or price)
                change = price - prev
                meta   = _get_meta(sym)
                results.append({
                    "symbol":        sym,
                    "name":          meta["name"],
                    "sector":        meta["sector"],
                    "price":         round(price, 2),
                    "change":        round(change, 2),
                    "changePercent": round((change / prev * 100) if prev else 0, 2),
                    "dataSource":    "yfinance-delayed",
                })
        except Exception as e:
            print(f"[stocks] batch error for {sym}: {e}")

    return results


# ── Watchlist ──────────────────────────────────────────────────────────────────

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
