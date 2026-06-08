import yfinance as yf
ticker = yf.Ticker("AAPL")
print(f"Price: {ticker.basic_info.last_price}")
