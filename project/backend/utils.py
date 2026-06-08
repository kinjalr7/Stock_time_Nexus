import yfinance as yf
from typing import Optional

def get_stock_price(symbol: str) -> Optional[float]:
    """
    Fetches the current market price for a given stock symbol.
    """
    try:
        ticker = yf.Ticker(symbol)
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
        print(f"Error fetching price for {symbol}: {e}")
        return None