from fastapi import APIRouter
from .utils import get_stock_price
import yfinance as yf
from typing import List, Dict

router = APIRouter()

@router.get("/latest")
def get_latest_news(symbol: str = "AAPL"):
    try:
        ticker = yf.Ticker(symbol)
        news = ticker.news
        formatted_news = []
        for i, item in enumerate(news):
            formatted_news.append({
                "id": f"news-{i}",
                "title": item.get("title", ""),
                "summary": item.get("summary", "No summary available."),
                "url": item.get("link", ""),
                "source": item.get("publisher", "Unknown"),
                "publishedAt": item.get("providerPublishTime", 0) * 1000, # Convert to ms
                "sentiment": "neutral", # Default for now
                "sentimentScore": 0,
                "relevanceScore": 1.0,
                "symbols": [symbol]
            })
        return formatted_news
    except Exception as e:
        print(f"Error fetching news for {symbol}: {e}")
        return []
