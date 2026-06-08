from fastapi import APIRouter
from .utils import get_stock_price
import yfinance as yf
import datetime
from typing import List, Dict

router = APIRouter()

@router.get("/latest")
def get_latest_news(symbol: str = "AAPL"):
    try:
        ticker = yf.Ticker(symbol)
        news = ticker.news
        formatted_news = []
        for i, item in enumerate(news):
            content = item.get("content", {})
            title = content.get("title") or item.get("title", "")
            summary = content.get("summary") or content.get("description") or item.get("summary") or "No summary available."
            url = content.get("canonicalUrl", {}).get("url") or content.get("clickThroughUrl", {}).get("url") or item.get("link", "")
            source = content.get("provider", {}).get("displayName") or item.get("publisher", "Unknown")
            
            # publishedAt (ms since epoch)
            published_at = 0
            pub_date_str = content.get("pubDate")
            if pub_date_str:
                try:
                    dt = datetime.datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))
                    published_at = int(dt.timestamp() * 1000)
                except Exception:
                    pass
            if not published_at:
                published_at = item.get("providerPublishTime", 0) * 1000
                
            # Basic keyword sentiment analysis
            title_lower = title.lower()
            summary_lower = summary.lower()
            text_to_analyze = f"{title_lower} {summary_lower}"
            
            pos_words = ["gain", "surge", "rise", "beat", "positive", "growth", "high", "upgrade", "success", "won", "jump", "rally", "up"]
            neg_words = ["fall", "drop", "plunge", "miss", "negative", "down", "downgrade", "decline", "tensions", "risk", "lower", "concern", "worry"]
            
            pos_count = sum(1 for w in pos_words if w in text_to_analyze)
            neg_count = sum(1 for w in neg_words if w in text_to_analyze)
            
            if pos_count > neg_count:
                sentiment = "positive"
                sentiment_score = min(0.55 + (pos_count - neg_count) * 0.1, 0.95)
            elif neg_count > pos_count:
                sentiment = "negative"
                sentiment_score = min(0.55 + (neg_count - pos_count) * 0.1, 0.95)
            else:
                sentiment = "neutral"
                sentiment_score = 0.5
                
            formatted_news.append({
                "id": f"news-{symbol}-{i}",
                "title": title,
                "summary": summary,
                "url": url,
                "source": source,
                "publishedAt": published_at,
                "sentiment": sentiment,
                "sentimentScore": sentiment_score,
                "relevanceScore": 1.0,
                "symbols": [symbol]
            })
        return formatted_news
    except Exception as e:
        print(f"Error fetching news for {symbol}: {e}")
        return []

