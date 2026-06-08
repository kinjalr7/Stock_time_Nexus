# 🗺️ Production Roadmap: Stock Time Nexus

## ✅ Phase 1: Persistence (COMPLETE)
**Goal**: Replace in-memory data with a real database so nothing resets on restart.

### What was done:
- Created `backend/database.py` — unified SQLite layer using `contextlib` for safe connection management.
- **Tables**: `users`, `logins`, `portfolio_holdings`, `watchlist`, `orders`
- `portfolio_holdings` is now seeded with demo data on first run (AAPL, TSLA, MSFT, NVDA)
- `backend/portfolio.py` fully rewritten — buy/sell/get all operate on SQLite, no in-memory list
- **Files changed**: `backend/database.py` (new), `backend/portfolio.py`

---

## ✅ Phase 2: Real-Time Data (COMPLETE)
**Goal**: Replace hardcoded/mock prices with live market data.

### What was done:
- `backend/utils.py` — `get_stock_price()` using `yfinance` (already in place, kept)
- `backend/stocks.py` (new) — exposes:
  - `GET /api/stocks/quote/{symbol}` → full quote + 90-day history + 52-week high/low
  - `GET /api/stocks/batch?symbols=AAPL,TSLA,...` → lightweight batch quotes for market overview
  - `GET/POST/DELETE /api/stocks/watchlist` → watchlist CRUD persisted in SQLite
- `backend/websocket.py` rewritten — pushes **real yfinance prices** every 10 seconds (no more random noise)
- `src/hooks/useStockData.ts` rewritten — fetches from `/api/stocks/batch` + `/api/stocks/quote/{symbol}`, derives real technical indicators (RSI, MACD, Bollinger Bands) from historical data
- **Files changed**: `backend/stocks.py` (new), `backend/websocket.py`, `src/hooks/useStockData.ts`

---

## ✅ Phase 3: Intelligence & Transactions (COMPLETE)
**Goal**: Connect the chatbot to a real LLM.

### What was done:
- `backend/chatbot.py` (new) — `POST /api/chat/` proxies to OpenAI (or any compatible API)
  - Reads `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `CHAT_MODEL` from environment
  - **Graceful fallback**: if no API key, returns smart keyword-based local responses so the UI never breaks
  - Supports optional `portfolioContext` so the AI can answer "How is my portfolio doing?"
- `src/components/Chatbot.tsx` rewritten:
  - Full multi-turn conversation history maintained in state
  - Shows `model name`, `latency`, and `● Live` badge
  - Suggested quick-questions on first load
  - Dark mode support
- **Payment (Stripe)**: Architecture is ready — add `backend/payments.py` when you get a Stripe key

### To enable real AI:
1. Copy `.env.example` → `.env`
2. Set `OPENAI_API_KEY=sk-...`
3. Restart the backend

---

## ✅ Phase 4: Production Polish (COMPLETE)
**Goal**: Make the app deployable.

### What was done:
- `.env.example` — documents all config vars (`OPENAI_API_KEY`, `DB_PATH`, `SECRET_KEY`, `CHAT_MODEL`)
- `Dockerfile` — minimal Python 3.11-slim image for the backend
- `backend_main.py` updated — loads `.env` via `python-dotenv`, registers all new routers, calls `init_db()` on startup
- `requirements.txt` updated: added `httpx`, `python-dotenv`, `bcrypt`
- Bug fixed in `auth.py` login handler (was using a closed SQLite connection)

### To deploy:
```bash
# Backend (Docker)
docker build -t stock-nexus-backend .
docker run -p 8000:8000 --env-file .env stock-nexus-backend

# Frontend
npm run build
# → deploy dist/ to Vercel or Netlify
```

---

## 🔮 Next Steps (Optional)
| Feature | File to create | Notes |
|---|---|---|
| JWT Authentication | `backend/auth.py` | Add `python-jose` token generation |
| Stripe Payments | `backend/payments.py` | Add `stripe` package |
| Background price cache | `backend/scheduler.py` | Use `apscheduler` to pre-fetch prices |
| Production DB | Migrate to PostgreSQL | Replace `sqlite3` with `asyncpg` + SQLAlchemy |
| CI/CD | `.github/workflows/` | GitHub Actions for auto-deploy |
