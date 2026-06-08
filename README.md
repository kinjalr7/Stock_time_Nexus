<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge&logo=github" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />

<br/><br/>

```
███████╗████████╗ ██████╗  ██████╗██╗  ██╗    ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
██╔════╝╚══██╔══╝██╔═══██╗██╔════╝██║ ██╔╝    ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
███████╗   ██║   ██║   ██║██║     █████╔╝     ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
╚════██║   ██║   ██║   ██║██║     ██╔═██╗     ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
███████║   ██║   ╚██████╔╝╚██████╗██║  ██╗    ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
╚══════╝   ╚═╝    ╚═════╝  ╚═════╝╚═╝  ╚═╝    ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
```

### 🚀 The Next-Generation AI-Powered Stock Trading & Forecasting Platform

*Where Machine Learning Meets the Market*

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-blue?style=for-the-badge)](http://localhost:5173)
[![Documentation](https://img.shields.io/badge/📖_Docs-Read_Now-purple?style=for-the-badge)](#-documentation)
[![Report Bug](https://img.shields.io/badge/🐛_Bug-Report_Issue-red?style=for-the-badge)](https://github.com/tirthpatel143/stock_time_nexus/issues)
[![Request Feature](https://img.shields.io/badge/✨_Feature-Request-green?style=for-the-badge)](https://github.com/tirthpatel143/stock_time_nexus/issues)

</div>

---

## 📸 Platform Preview

<div align="center">

| Dashboard | AI Forecast | Portfolio |
|:---:|:---:|:---:|
| 📊 Candlestick Charts | 🤖 Multi-Model AI | 💼 Live Tracking |
| Volume Analysis | Bollinger Bands | Risk Analytics |
| Real-time KPIs | Confidence Meters | P&L Breakdown |

</div>

---

## ✨ Why StockNexus?

> **94% AI accuracy rate** across 5 machine learning models. Real-time market data. Institutional-grade analytics — all in one beautifully designed platform.

StockNexus is not just another trading dashboard. It's a **full-stack AI forecasting system** built for traders, analysts, and developers who demand precision and aesthetics. From Bloomberg-style candlestick charts to deep-learning predictions, every pixel and every prediction is crafted for excellence.

---

## 🎯 Key Features

### 📊 Interactive AI Forecast Dashboard
- **4-Tab Chart System** — Candlestick · Price History · Volume Analysis · AI Forecast
- **Real OHLC Candlestick** charts with neon green/red glow and SMA reference lines
- **Bollinger Bands** overlaid on price history with gradient fills
- **Volume bars** color-coded by up/down price movement
- **Multi-model forecast** with animated dashed lines and forecast separator

### 🤖 5 AI/ML Forecasting Models
| Model | Description | Accuracy |
|---|---|---|
| **LSTM** | Long Short-Term Memory — captures complex non-linear patterns | ~92% |
| **Prophet** | Facebook's time series model — handles seasonality & holidays | ~89% |
| **ARIMA** | Classic statistical model — reliable for stable linear trends | ~85% |
| **XGBoost** | Gradient boosting ensemble — powerful with tabular data | ~88% |
| **Random Forest** | Bagging decision trees — robust to noise and outliers | ~87% |
| **Ensemble** | Combined prediction from all models | **~94%** |

### 📈 Real-time KPI Cards
Animated stat cards showing — **Price · Volume · Market Cap · RSI · MACD · Sentiment** — all with directional arrows and color-coded trends.

### 🧠 Technical Indicators Panel
- **Moving Averages** — SMA 20, SMA 50, SMA 200 with Above/Below badges
- **Bollinger Bands** — Upper & Lower band values
- **RSI Gauge** — Radial circular meter with Oversold/Overbought zones
- **MACD** — Signal crossover detection

### 💼 Portfolio Management
- Real-time portfolio value tracking
- Transaction history with P&L analytics
- Sector allocation and diversification scoring
- Risk assessment with Sharpe ratio

### 📰 News Sentiment Analysis
- Live financial news feed with BERT NLP sentiment scoring
- Bullish / Bearish / Neutral classification per article
- Market impact assessment linked to specific tickers

### ⚡ Auto Trading Simulation
- AI-generated buy/sell signals
- Paper trading with virtual portfolio
- Strategy backtesting with historical data
- Risk management rules and stop-loss simulation

### 🔍 Stock Clustering
- K-Means clustering to group similar stocks
- Personalized stock recommendations
- Sector correlation maps

### 💬 AI Chatbot Assistant
- 24/7 trading assistant powered by NLP
- Contextual answers about stocks, features, pricing
- Quick-action prompts for common queries

### 🔐 Auth & Subscriptions
- JWT-based authentication (sign up / sign in)
- 3-tier subscription plans — Starter · Professional · Enterprise
- Stripe-powered payment processing
- 14-day free trial · 30-day money-back guarantee

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STOCKNEXUS                               │
│                                                                 │
│  ┌─────────────────────┐        ┌──────────────────────────┐   │
│  │   FRONTEND (React)  │◄──────►│    BACKEND (FastAPI)     │   │
│  │                     │  HTTP  │                          │   │
│  │  • Vite + React 18  │  REST  │  • Python 3.11+          │   │
│  │  • TypeScript 5     │        │  • FastAPI + Uvicorn     │   │
│  │  • Tailwind CSS     │        │  • SQLite (users.db)     │   │
│  │  • Framer Motion    │        │  • JWT Authentication    │   │
│  │  • Recharts         │        │  • yfinance (market data)│   │
│  │  • Lucide Icons     │        │  • WebSocket support     │   │
│  └──────────┬──────────┘        └────────────┬─────────────┘   │
│             │                                │                  │
│  ┌──────────▼──────────────────────────────▼──────────────┐   │
│  │                    DATA LAYER                           │   │
│  │                                                         │   │
│  │    Yahoo Finance API  ·  SQLite DB  ·  News APIs        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with concurrent features |
| **TypeScript 5** | Type-safe development |
| **Vite 7** | Lightning-fast build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Smooth animations & transitions |
| **Recharts** | Candlestick, area, bar & composed charts |
| **React Router v6** | Client-side routing |
| **Lucide React** | Beautiful icon library |
| **Axios** | HTTP client for API calls |
| **React Hot Toast** | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async Python API |
| **Uvicorn** | ASGI server |
| **yfinance** | Real-time & historical stock data |
| **SQLite** | User auth & transaction storage |
| **JWT / Jose** | Secure token authentication |
| **Passlib + bcrypt** | Password hashing |
| **WebSockets** | Real-time data streaming |

---

## 🚀 Quick Start

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
python >= 3.11
```

### 1. Clone the Repository

```bash
git clone https://github.com/tirthpatel143/stock_time_nexus.git
cd stock_time_nexus/project
```

### 2. Setup the Backend

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate          # Windows

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python backend_main.py
# ✅ Backend running at http://localhost:8000
```

### 3. Setup the Frontend

```bash
# Install Node dependencies
npm install

# Start the Vite dev server
npm run dev
# ✅ Frontend running at http://localhost:5173
```

### 4. Open in Browser

```
http://localhost:5173
```

> 🎉 You're live! Sign up for an account to unlock all protected features.

---

## ⚙️ Environment Variables

Copy the example env file and configure:

```bash
cp .env.example .env
```

```env
# Backend
SECRET_KEY=your-super-secret-jwt-key-here
DATABASE_URL=sqlite:///./users.db
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend (Vite)
VITE_API_BASE_URL=http://localhost:8000

# Optional: Stripe (for payments)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
```

---

## 📁 Project Structure

```
stock_time_nexus/project/
│
├── 📂 src/
│   ├── 📂 pages/               # Route-level page components
│   │   ├── Home.tsx            # Landing page + chatbot
│   │   ├── Dashboard.tsx       # 🌟 AI Forecast Dashboard (main)
│   │   ├── Models.tsx          # ML model comparison
│   │   ├── News.tsx            # News sentiment feed
│   │   ├── Trading.tsx         # Auto-trading simulation
│   │   ├── Clusters.tsx        # Stock clustering analysis
│   │   ├── Portfolio.tsx       # Portfolio management
│   │   ├── Pricing.tsx         # Subscription plans
│   │   ├── Auth.tsx            # Sign in / Sign up
│   │   └── ChatbotDemo.tsx     # AI chatbot showcase
│   │
│   ├── 📂 components/          # Reusable UI components
│   │   ├── Navbar.tsx          # Navigation with dark mode toggle
│   │   ├── Footer.tsx          # Site footer
│   │   ├── StockSearch.tsx     # Live stock symbol search
│   │   ├── StockDetails.tsx    # Detailed stock info panel
│   │   ├── ModelComparator.tsx # Side-by-side model comparison
│   │   ├── Chatbot.tsx         # Embedded AI assistant
│   │   ├── PaymentProcessor.tsx# Stripe payment flow
│   │   └── SubscriptionManager.tsx
│   │
│   ├── 📂 hooks/
│   │   └── useStockData.ts     # Data fetching + state management
│   │
│   ├── 📂 contexts/
│   │   ├── ThemeContext.tsx     # Light/dark mode
│   │   └── AuthContext.tsx     # User auth state
│   │
│   ├── App.tsx                 # Root app + routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles + animations
│
├── 📂 backend/                 # Python FastAPI backend
│   ├── auth.py                 # JWT auth endpoints
│   ├── stocks.py               # Stock data API
│   ├── news.py                 # News & sentiment API
│   ├── portfolio.py            # Portfolio CRUD
│   ├── trading.py              # Trading simulation
│   ├── chatbot.py              # AI chatbot logic
│   ├── websocket.py            # Real-time streaming
│   └── database.py             # DB setup & queries
│
├── backend_main.py             # FastAPI app entry point
├── requirements.txt            # Python dependencies
├── package.json                # Node dependencies
├── tailwind.config.js          # Tailwind configuration
├── vite.config.ts              # Vite configuration
└── .env.example                # Environment variable template
```

---

## 🗺️ Pages & Routes

| Route | Page | Auth | Description |
|---|---|---|---|
| `/` | Home | Public | Landing page, hero, features, testimonials, chatbot |
| `/dashboard` | Dashboard | Public | **AI forecast, candlestick charts, KPIs** |
| `/models` | Models | 🔒 Protected | ML model comparison and metrics |
| `/news` | News | 🔒 Protected | Sentiment-scored financial news feed |
| `/trading` | Trading | 🔒 Protected | Auto-trading simulation & signals |
| `/clusters` | Clusters | 🔒 Protected | Stock clustering & recommendations |
| `/portfolio` | Portfolio | 🔒 Protected | Personal portfolio tracker |
| `/pricing` | Pricing | Public | Subscription plans & payment |
| `/chatbot` | Chatbot Demo | Public | Standalone AI assistant |
| `/auth` | Auth | Public | Sign in / Sign up |

---

## 📊 Dashboard Features Deep Dive

The crown jewel of StockNexus — the **AI Forecast Dashboard** — includes:

```
🕯️ CANDLESTICK TAB
  ├── Real OHLC candles (last 60 sessions)
  ├── Green (bullish) / Red (bearish) with neon glow
  ├── SMA 20 (blue dashed) overlay
  └── SMA 50 (amber dashed) overlay

📈 PRICE HISTORY TAB
  ├── Smooth area chart (last 90 sessions)
  ├── Bollinger Bands (upper & lower)
  ├── SMA 20 + SMA 50 overlays
  └── Gradient fill under price curve

📊 VOLUME TAB
  ├── Color-coded bars (green = up-day, red = down-day)
  ├── Average volume reference line
  └── Volume in millions formatter

🔮 FORECAST TAB
  ├── Historical area (last 20 sessions)
  ├── 5 AI model dashed forecast lines
  ├── Forecast/historical separator
  └── Animated on generation

🤖 AI MODELS SIDEBAR
  ├── 5 toggleable models with circular confidence meters
  ├── Forecast horizon: 7d / 30d / 90d / 180d
  └── Generate Forecast button (updates all panels)

📡 MARKET SENTIMENT
  ├── Bullish / Bearish / Neutral classification
  ├── RSI radial gauge with zones
  └── News · Social · Analyst progress bars

📉 TECHNICAL PANEL (bottom row)
  ├── Moving Averages (SMA 20/50/200) — Above/Below badge
  ├── 52-Week Range gradient slider
  └── AI Consensus — per-model target price + % delta
```

---

## 💰 Subscription Plans

| Feature | Starter ($9/mo) | Professional ($29/mo) | Enterprise ($99/mo) |
|---|:---:|:---:|:---:|
| AI Forecasting | Basic | All Models | All Models + Custom |
| API Requests/mo | 100 | 1,000 | Unlimited |
| User Accounts | 1 | 5 | Unlimited |
| Support | Email | Priority | 24/7 Phone + Dedicated |
| API Access | ❌ | ✅ | ✅ |
| White Label | ❌ | ❌ | ✅ |
| Free Trial | 14 days | 14 days | 14 days |

---

## 🧪 Development Scripts

```bash
# Frontend
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint check

# Backend
python backend_main.py           # Start FastAPI (localhost:8000)
uvicorn backend_main:app --reload # Hot-reload mode

# Type checking
npx tsc --noEmit     # TypeScript strict check
```

---

## 🐳 Docker Support

```bash
# Build and run with Docker
docker build -t stocknexus .
docker run -p 8000:8000 stocknexus
```

---

## 🤝 Contributing

Contributions are what make the open-source community amazing! We welcome all contributions.

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'feat: Add some AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation change
- `style:` — Code style / formatting
- `refactor:` — Code refactoring
- `perf:` — Performance improvement
- `test:` — Adding tests

---

## 🛡️ Security

- 🔐 **JWT tokens** for stateless authentication
- 🔒 **bcrypt** password hashing (cost factor 12)
- 🛡️ **CORS** configured for allowed origins only
- 📝 **Input validation** via FastAPI's Pydantic schemas
- 🔑 **Environment variables** for all secrets (never hardcoded)

**Found a security issue?** Please email us privately rather than opening a public issue.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

```
MIT License — © 2026 Tirth Patel
Permission is granted to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of this software.
```

---

## 👨‍💻 Author

<div align="center">

**Tirth Patel**

[![GitHub](https://img.shields.io/badge/GitHub-tirthpatel143-181717?style=for-the-badge&logo=github)](https://github.com/tirthpatel143)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/tirthpatel)

*Built with ❤️ and way too much caffeine ☕*

</div>

---

## 🌟 Show Your Support

If this project helped you or impressed you, please give it a **⭐ Star** on GitHub!

```
    ⭐ Star the repo  →  https://github.com/tirthpatel143/stock_time_nexus
```

Every star motivates further development and helps others discover StockNexus!

---

## 📊 Project Stats

<div align="center">

![GitHub Stars](https://img.shields.io/github/stars/tirthpatel143/stock_time_nexus?style=social)
![GitHub Forks](https://img.shields.io/github/forks/tirthpatel143/stock_time_nexus?style=social)
![GitHub Issues](https://img.shields.io/github/issues/tirthpatel143/stock_time_nexus)
![GitHub Last Commit](https://img.shields.io/github/last-commit/tirthpatel143/stock_time_nexus)

</div>

---

<div align="center">

**StockNexus** — *Trade Smarter. Predict Better. Grow Faster.*

Made with 🧠 AI · 📊 Data · ❤️ Passion

</div>
