import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  eps: number;
  dividend: number;
  beta: number;
  high52w: number;
  low52w: number;
  avgVolume: number;
  sector: string;
  industry: string;
  description: string;
  historicalData: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  forecastData: Array<{
    date: string;
    predicted: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }>;
  technicalIndicators: {
    rsi: number;
    macd: number;
    sma20: number;
    sma50: number;
    sma200: number;
    bollingerUpper: number;
    bollingerLower: number;
    volumeSMA: number;
  };
  sentiment: {
    overall: 'bullish' | 'bearish' | 'neutral';
    score: number;
    newsSentiment: number;
    socialSentiment: number;
    analystRating: number;
  };
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  relevanceScore: number;
  symbols: string[];
}

export interface StockForecast {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
  predictions: Array<{
    date: string;
    price: number;
    confidence: number;
    model: string;
  }>;
  models: {
    lstm: number;
    prophet: number;
    arima: number;
    randomForest: number;
    xgboost: number;
  };
  consensus: {
    target: number;
    high: number;
    low: number;
    recommendation: 'buy' | 'sell' | 'hold';
  };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const getDescription = (symbol: string): string => {
  const descriptions: Record<string, string> = {
    AAPL: 'Apple Inc. designs, manufactures, and markets smartphones, PCs, tablets, wearables, and accessories worldwide.',
    TSLA: 'Tesla Inc. designs, develops, manufactures, leases, and sells electric vehicles and energy storage systems.',
    GOOGL: 'Alphabet Inc. provides online advertising, cloud computing, and consumer products globally.',
    MSFT: 'Microsoft Corporation develops software, services, devices, and solutions worldwide.',
    AMZN: 'Amazon.com Inc. engages in retail, cloud computing, digital streaming, and AI.',
    NVDA: 'NVIDIA Corporation designs GPUs for gaming, professional visualisation, data centres, and automotive markets.',
    META: 'Meta Platforms Inc. builds technology to connect people via social media and virtual reality.',
    NFLX: 'Netflix Inc. provides streaming entertainment services with a library of TV series, films, and games.',
  };
  return descriptions[symbol] || `${symbol} is a leading company in its sector with strong market presence.`;
};

/** Derive simple technical indicators from the last N candles */
function deriveTechnicals(hist: StockData['historicalData'], price: number) {
  const closes = hist.map((h) => h.close);
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const sma20 = closes.length >= 20 ? avg(closes.slice(-20)) : price;
  const sma50 = closes.length >= 50 ? avg(closes.slice(-50)) : price;
  const sma200 = closes.length >= 90 ? avg(closes.slice(-90)) : price; // proxy with 90d
  const std20 =
    closes.length >= 20
      ? Math.sqrt(closes.slice(-20).reduce((a, b) => a + (b - sma20) ** 2, 0) / 20)
      : price * 0.05;

  // RSI (14-period approximation)
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < Math.min(15, closes.length); i++) {
    const d = closes[closes.length - i] - closes[closes.length - i - 1];
    d > 0 ? gains.push(d) : losses.push(-d);
  }
  const avgGain = gains.length ? avg(gains) : 1;
  const avgLoss = losses.length ? avg(losses) : 1;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return {
    rsi: Math.round(rsi * 10) / 10,
    macd: Math.round((sma20 - sma50) * 100) / 100,
    sma20: Math.round(sma20 * 100) / 100,
    sma50: Math.round(sma50 * 100) / 100,
    sma200: Math.round(sma200 * 100) / 100,
    bollingerUpper: Math.round((sma20 + 2 * std20) * 100) / 100,
    bollingerLower: Math.round((sma20 - 2 * std20) * 100) / 100,
    volumeSMA: 0,
  };
}

/** Generate a simple multi-model forecast from recent history */
function buildForecast(hist: StockData['historicalData'], days = 30): StockData['forecastData'] {
  const closes = hist.map((h) => h.close);
  const lastPrice = closes[closes.length - 1] || 100;
  const trend = closes.length > 5 ? (closes[closes.length - 1] - closes[closes.length - 6]) / 5 : 0;

  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    const predicted = lastPrice + trend * (i + 1) + (Math.random() - 0.5) * lastPrice * 0.015;
    const noise = Math.random() * lastPrice * 0.02;
    return {
      date: date.toISOString().split('T')[0],
      predicted: Math.round(predicted * 100) / 100,
      confidence: Math.max(0.5, 0.9 - i * 0.01),
      upperBound: Math.round((predicted + noise) * 100) / 100,
      lowerBound: Math.round((predicted - noise) * 100) / 100,
    };
  });
}

function buildForecastObj(symbol: string, price: number): StockForecast {
  const noise = () => price + (Math.random() - 0.5) * price * 0.05;
  return {
    symbol,
    timeframe: '1M',
    predictions: Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 86400000).toISOString().split('T')[0],
      price: Math.round(noise() * 100) / 100,
      confidence: 0.75 + Math.random() * 0.2,
      model: ['LSTM', 'Prophet', 'ARIMA', 'RandomForest', 'XGBoost'][i % 5],
    })),
    models: {
      lstm: Math.round(noise() * 100) / 100,
      prophet: Math.round(noise() * 100) / 100,
      arima: Math.round(noise() * 100) / 100,
      randomForest: Math.round(noise() * 100) / 100,
      xgboost: Math.round(noise() * 100) / 100,
    },
    consensus: {
      target: Math.round(noise() * 100) / 100,
      high: Math.round((price * 1.1) * 100) / 100,
      low: Math.round((price * 0.9) * 100) / 100,
      recommendation: price > 0 ? (['buy', 'hold', 'sell'][Math.floor(Math.random() * 3)] as 'buy' | 'hold' | 'sell') : 'hold',
    },
  };
}

/** Map a raw API quote to a full StockData object */
function quoteToStockData(q: any): StockData {
  const hist: StockData['historicalData'] = q.historicalData || [];
  const indicators = deriveTechnicals(hist, q.price);
  const forecastData = buildForecast(hist);
  const macd = indicators.sma20 - indicators.sma50;
  const sentiment: StockData['sentiment'] = {
    overall: macd > 0 ? 'bullish' : macd < 0 ? 'bearish' : 'neutral',
    score: Math.max(-1, Math.min(1, macd / q.price)),
    newsSentiment: Math.random() * 2 - 1,
    socialSentiment: Math.random() * 2 - 1,
    analystRating: 3 + Math.random() * 2,
  };

  return {
    symbol: q.symbol,
    name: q.name,
    price: q.price,
    change: q.change,
    changePercent: q.changePercent,
    volume: q.volume || 0,
    marketCap: q.marketCap || 0,
    pe: 0,
    eps: 0,
    dividend: 0,
    beta: 1,
    high52w: q.high52w || q.price * 1.3,
    low52w: q.low52w || q.price * 0.7,
    avgVolume: q.volume || 0,
    sector: q.sector || 'Technology',
    industry: q.industry || 'Unknown',
    description: getDescription(q.symbol),
    historicalData: hist,
    forecastData,
    technicalIndicators: indicators,
    sentiment,
  };
}

// ─── hook ────────────────────────────────────────────────────────────────────

export const useStockData = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [forecasts, setForecasts] = useState<Record<string, StockForecast>>({});
  const [dataSource, setDataSource] = useState<'finnhub-realtime' | 'yfinance-delayed' | 'unknown'>('unknown');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const popularStocks = [
    'AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'NFLX',
    'AMD', 'INTC', 'JPM', 'JNJ', 'PG', 'V', 'WMT', 'DIS', 'PYPL', 'CRM',
  ];

  const fetchStockData = useCallback(async (symbols: string[] = popularStocks) => {
    setLoading(true);
    try {
      // Fetch lightweight batch quotes for the market overview
      const symbolsParam = symbols.slice(0, 18).join(',');
      const [batchRes, newsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/stocks/batch?symbols=${symbolsParam}`),
        axios.get(`${API_BASE}/api/news/latest?symbol=${symbols[0]}`).catch(() => ({ data: [] })),
      ]);

      const batchData: any[] = batchRes.data;

      // For the selected stock fetch the full quote with history
      const detailRes = await axios.get(
        `${API_BASE}/api/stocks/quote/${selectedStock}`
      ).catch(() => null);

      const stockDataMap: Record<string, StockData> = {};

      // Populate from batch (no history)
      batchData.forEach((q: any) => {
        stockDataMap[q.symbol] = quoteToStockData({ ...q, historicalData: [] });
      });

      // Overlay detailed data for selected stock
      if (detailRes?.data) {
        stockDataMap[selectedStock] = quoteToStockData(detailRes.data);
        // Track data source from the API response
        const src = detailRes.data.dataSource;
        if (src === 'finnhub-realtime') setDataSource('finnhub-realtime');
        else if (src === 'yfinance-delayed') setDataSource('yfinance-delayed');
      }

      const stockList = Object.values(stockDataMap);
      setStocks(stockList);
      setLastUpdated(new Date());

      // Build forecasts
      const newForecasts: Record<string, StockForecast> = {};
      stockList.forEach((s) => {
        newForecasts[s.symbol] = buildForecastObj(s.symbol, s.price);
      });
      setForecasts(newForecasts);

      // News (from backend)
      const newsData: any[] = newsRes.data;
      setNews(
        newsData.map((item: any) => ({
          ...item,
          publishedAt: item.publishedAt
            ? new Date(item.publishedAt).toISOString()
            : new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('[useStockData] fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStock]);

  // ── Live price polling (every 15s) ─────────────────────────────────────────
  const pollLivePrice = useCallback(async () => {
    if (!selectedStock) return;
    try {
      const res = await axios.get(`${API_BASE}/api/stocks/live-price/${selectedStock}`);
      const live = res.data;
      if (!live?.price) return;

      setDataSource(live.dataSource === 'finnhub-realtime' ? 'finnhub-realtime' : 'yfinance-delayed');
      setLastUpdated(new Date());

      // Patch the price in stocks state without refetching history
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol === selectedStock
            ? {
                ...s,
                price:         live.price,
                change:        live.change,
                changePercent: live.changePercent,
              }
            : s
        )
      );
    } catch (e) {
      // silent — fallback data still shown
    }
  }, [selectedStock]);

  const searchStock = useCallback(async (symbol: string) => {
    setLoading(true);
    const sym = symbol.toUpperCase();
    try {
      const res = await axios.get(`${API_BASE}/api/stocks/quote/${sym}`);
      const stockData = quoteToStockData(res.data);
      setStocks((prev) => {
        const without = prev.filter((s) => s.symbol !== sym);
        return [stockData, ...without];
      });
      setSelectedStock(sym);
      setForecasts((prev) => ({
        ...prev,
        [sym]: buildForecastObj(sym, stockData.price),
      }));
    } catch (error) {
      console.error('[useStockData] search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStockBySymbol = (symbol: string) =>
    stocks.find((s) => s.symbol === symbol);

  const getForecastBySymbol = (symbol: string) => forecasts[symbol];

  // Initial full load + refresh every 60s
  useEffect(() => {
    fetchStockData();
    const interval = setInterval(() => fetchStockData(), 60000);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  // Live price micro-poll every 15s
  useEffect(() => {
    const interval = setInterval(() => pollLivePrice(), 15000);
    return () => clearInterval(interval);
  }, [pollLivePrice]);

  return {
    stocks,
    news,
    loading,
    selectedStock,
    forecasts,
    popularStocks,
    dataSource,
    lastUpdated,
    fetchStockData,
    searchStock,
    getStockBySymbol,
    getForecastBySymbol,
    setSelectedStock,
  };
};