import yfinance as yf
import httpx
import os
from typing import Optional

FINNHUB_KEY  = os.getenv("FINNHUB_API_KEY", "")
FINNHUB_BASE = "https://finnhub.io/api/v1"

def get_stock_price(symbol: str) -> Optional[float]:
    """
    Fetches the current market price for a given stock symbol.
    Tries Finnhub first if key is present, falls back to yfinance.
    """
    sym = symbol.upper()
    if FINNHUB_KEY:
        try:
            resp = httpx.get(
                f"{FINNHUB_BASE}/quote",
                params={"symbol": sym, "token": FINNHUB_KEY},
                timeout=6.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                price = data.get("c")
                if price and price != 0:
                    return float(price)
        except Exception as e:
            print(f"[utils] Finnhub price error for {sym}: {e}")

    try:
        ticker = yf.Ticker(sym)
        # Using fast_info for quick access to price
        # Note: fast_info is a property in recent yfinance versions
        price = ticker.fast_info.last_price
        
        if price is None or price == 0:
            # Fallback to history if fast_info fails or returns 0
            data = ticker.history(period="1d")
            if not data.empty:
                price = data['Close'].iloc[-1]
        return price
    except Exception as e:
        print(f"Error fetching price for {sym}: {e}")
        return None