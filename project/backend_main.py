from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.portfolio import router as portfolio_router
from backend.trading import router as trading_router
from backend.websocket import router as websocket_router
from backend.model_performance import router as model_performance_router
from backend.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(trading_router, prefix="/api/trading", tags=["Trading"])
app.include_router(websocket_router, prefix="/api/ws", tags=["WebSocket"])
app.include_router(model_performance_router, prefix="/api/models", tags=["Model Performance"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])