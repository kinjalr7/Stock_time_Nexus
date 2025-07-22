from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .models import stocks
import asyncio
import random

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data):
        for connection in self.active_connections:
            await connection.send_json(data)

manager = ConnectionManager()

@router.websocket("/prices")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1)
            for stock in stocks:
                stock.price = round(stock.price * (1 + (random.random() - 0.5) * 0.01), 2)
            await manager.broadcast([s.dict() for s in stocks])
    except WebSocketDisconnect:
        manager.disconnect(websocket) 