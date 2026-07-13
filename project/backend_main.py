from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from backend.portfolio import router as portfolio_router
from backend.trading import router as trading_router
from backend.websocket import router as websocket_router
from backend.model_performance import router as model_performance_router
from backend.auth import router as auth_router
from backend.news import router as news_router
from backend.stocks import router as stocks_router
from backend.chatbot import router as chatbot_router
from backend.database import init_db

# ── Phase 4: load .env if present ──────────────────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed; rely on OS env vars

# Initialise the SQLite database (Phase 1)
init_db()

app = FastAPI(
    title="Stock Time Nexus API",
    description="Real-time stock analytics and portfolio management platform",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router,        prefix="/api/portfolio",   tags=["Portfolio"])
app.include_router(trading_router,          prefix="/api/trading",     tags=["Trading"])
app.include_router(websocket_router,        prefix="/api/ws",          tags=["WebSocket"])
app.include_router(model_performance_router, prefix="/api/models",     tags=["Model Performance"])
app.include_router(auth_router,             prefix="/api/auth",        tags=["Authentication"])
app.include_router(news_router,             prefix="/api/news",        tags=["News"])
app.include_router(stocks_router,           prefix="/api/stocks",      tags=["Stocks"])
app.include_router(chatbot_router,          prefix="/api/chat",        tags=["AI Chatbot"])


@app.get("/api/health")
def health():
    # Force reload of uvicorn dev server to pick up new .env variables
    return {"status": "ok", "version": "2.0.0"}