"""
Phase 2 – WebSocket with real yfinance prices.
Every 5 seconds it fetches the live price for the tracked watchlist symbols
and pushes the update to all connected clients.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .database import db_cursor
from .utils import get_stock_price
import asyncio

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data):
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)


manager = ConnectionManager()

# Default symbols to track when no user is connected
DEFAULT_SYMBOLS = ["AAPL", "TSLA", "MSFT", "GOOGL", "NVDA", "META", "AMZN"]


def _get_watchlist_symbols(username: str = "demo") -> list[str]:
    """Load watchlist symbols for a given user from DB."""
    try:
        with db_cursor() as cur:
            cur.execute(
                "SELECT symbol FROM watchlist WHERE username = ?", (username,)
            )
            rows = cur.fetchall()
        return [r["symbol"] for r in rows] if rows else DEFAULT_SYMBOLS
    except Exception:
        return DEFAULT_SYMBOLS


@router.websocket("/prices")
async def websocket_endpoint(websocket: WebSocket, username: str = "demo"):
    await manager.connect(websocket)
    try:
        while True:
            symbols = _get_watchlist_symbols(username)
            price_data = []
            for symbol in symbols:
                price = get_stock_price(symbol)
                if price is not None:
                    price_data.append({"symbol": symbol, "price": round(price, 2)})

            if price_data:
                await manager.broadcast(price_data)

            # Poll every 10 seconds to avoid hammering yfinance
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[WebSocket] Error: {e}")
        manager.disconnect(websocket)