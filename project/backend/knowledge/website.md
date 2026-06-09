# About Stock Time Nexus

Stock Time Nexus is a next-generation, AI-powered stock trading and forecasting platform. It integrates advanced machine learning models with real-time stock analytics, live charts, and portfolio tracking.

## Core Features
1. **Interactive AI Forecast Dashboard**: Shows real-time Candlestick charts, price history, volume analysis, and multi-model forecasts.
2. **AI Forecasting Models**: Employs 5 distinct machine learning models (LSTM, FB Prophet, ARIMA, XGBoost, Random Forest) plus an Ensemble model with up to 94% accuracy.
3. **Real-time KPI Metrics**: Tracks and displays stock indicators like Price, Volume, Market Cap, RSI, MACD, and overall sentiment.
4. **Portfolio Management**: Offers real-time tracking, sector allocation, P&L analytics, and risk scoring (Sharpe ratio).
5. **BERT NLP News Sentiment**: Scours financial news feeds, automatically classifying articles as Bullish, Bearish, or Neutral.
6. **Simulated Paper Trading**: Allows users to backtest strategies and simulate buy/sell orders.
7. **Stock Clustering**: Groups similar stocks using K-Means to offer personalized stock recommendations.

## Technology Stack
- **Frontend**: Built using React 18, Vite, TypeScript 5, Tailwind CSS, Framer Motion, and Recharts.
- **Backend**: Python 3.11/3.13, FastAPI for high-performance async APIs, WebSockets for live data stream, SQLite for user portfolios.
- **Data Source**: Integrated with Yahoo Finance (yfinance) and Finnhub APIs.
- **AI/LLM**: Ingests user profiles and website FAQs into ChromaDB, leveraging LlamaIndex and HuggingFace API key for Retrieval-Augmented Generation (RAG).
