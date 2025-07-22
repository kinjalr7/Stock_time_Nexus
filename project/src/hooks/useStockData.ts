import { useState, useEffect } from 'react';

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

export const useStockData = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [forecasts, setForecasts] = useState<Record<string, StockForecast>>({});

  // Popular stock symbols
  const popularStocks = [
    'AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'NFLX', 
    'AMD', 'INTC', 'JPM', 'JNJ', 'PG', 'V', 'WMT', 'DIS', 'PYPL', 'CRM'
  ];

  // Enhanced mock data generator with forecasting
  const generateMockStockData = (symbol: string): StockData => {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = (change / basePrice) * 100;
    
    const historicalData = Array.from({ length: 90 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (89 - i));
      const price = basePrice + (Math.random() - 0.5) * 50;
      return {
        date: date.toISOString().split('T')[0],
        open: price + (Math.random() - 0.5) * 5,
        high: price + Math.random() * 10,
        low: price - Math.random() * 10,
        close: price,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      };
    });

    // Generate forecast data
    const forecastData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      const predicted = basePrice + (Math.random() - 0.5) * 30;
      const confidence = 0.7 + Math.random() * 0.3;
      return {
        date: date.toISOString().split('T')[0],
        predicted,
        confidence,
        upperBound: predicted + Math.random() * 10,
        lowerBound: predicted - Math.random() * 10
      };
    });

    // Generate technical indicators
    const technicalIndicators = {
      rsi: 30 + Math.random() * 40,
      macd: (Math.random() - 0.5) * 2,
      sma20: basePrice + (Math.random() - 0.5) * 10,
      sma50: basePrice + (Math.random() - 0.5) * 15,
      sma200: basePrice + (Math.random() - 0.5) * 20,
      bollingerUpper: basePrice + Math.random() * 15,
      bollingerLower: basePrice - Math.random() * 15,
      volumeSMA: Math.floor(Math.random() * 5000000) + 1000000
    };

    // Generate sentiment data
    const sentiment = {
      overall: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as 'bullish' | 'bearish' | 'neutral',
      score: Math.random() * 2 - 1,
      newsSentiment: Math.random() * 2 - 1,
      socialSentiment: Math.random() * 2 - 1,
      analystRating: Math.random() * 5
    };

    return {
      symbol,
      name: getCompanyName(symbol),
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: Math.floor(Math.random() * 1000000000000) + 10000000000,
      pe: Math.random() * 30 + 5,
      eps: Math.random() * 10 + 1,
      dividend: Math.random() * 5,
      beta: Math.random() * 2 + 0.5,
      high52w: basePrice + Math.random() * 100,
      low52w: basePrice - Math.random() * 100,
      avgVolume: Math.floor(Math.random() * 5000000) + 1000000,
      sector: getSector(symbol),
      industry: getIndustry(symbol),
      description: getDescription(symbol),
      historicalData,
      forecastData,
      technicalIndicators,
      sentiment
    };
  };

  const generateForecast = (symbol: string): StockForecast => {
    const basePrice = Math.random() * 500 + 50;
    
    const predictions = Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return {
        date: date.toISOString().split('T')[0],
        price: basePrice + (Math.random() - 0.5) * 30,
        confidence: 0.7 + Math.random() * 0.3,
        model: ['LSTM', 'Prophet', 'ARIMA', 'RandomForest', 'XGBoost'][Math.floor(Math.random() * 5)]
      };
    });

    return {
      symbol,
      timeframe: '1M',
      predictions,
      models: {
        lstm: basePrice + (Math.random() - 0.5) * 20,
        prophet: basePrice + (Math.random() - 0.5) * 20,
        arima: basePrice + (Math.random() - 0.5) * 20,
        randomForest: basePrice + (Math.random() - 0.5) * 20,
        xgboost: basePrice + (Math.random() - 0.5) * 20
      },
      consensus: {
        target: basePrice + (Math.random() - 0.5) * 15,
        high: basePrice + Math.random() * 25,
        low: basePrice - Math.random() * 25,
        recommendation: ['buy', 'sell', 'hold'][Math.floor(Math.random() * 3)] as 'buy' | 'sell' | 'hold'
      }
    };
  };

  const generateMockNews = (): NewsItem[] => {
    const headlines = [
      "Tech Stocks Rally on AI Breakthrough Announcement",
      "Federal Reserve Signals Potential Rate Cut",
      "Quarterly Earnings Beat Expectations Across Sectors",
      "Market Volatility Expected Due to Geopolitical Tensions",
      "Green Energy Stocks Surge on New Policy Announcement",
      "Cryptocurrency Market Shows Signs of Recovery",
      "Healthcare Sector Outperforms Market Expectations",
      "Supply Chain Disruptions Impact Manufacturing Stocks",
      "Apple Reports Record iPhone Sales in Q4",
      "Tesla Announces New Gigafactory Location",
      "Microsoft Cloud Services Revenue Soars",
      "Amazon Expands into Healthcare Sector",
      "Meta's VR Division Shows Strong Growth",
      "NVIDIA Chips in High Demand for AI Applications"
    ];

    return headlines.map((title, index) => ({
      id: `news-${index}`,
      title,
      summary: `${title}. Market analysts are closely watching the developments as they could significantly impact trading patterns and investor sentiment in the coming weeks.`,
      url: `https://example.com/news/${index}`,
      source: ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance'][index % 5],
      publishedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as 'positive' | 'negative' | 'neutral',
      sentimentScore: Math.random() * 2 - 1,
      relevanceScore: Math.random(),
      symbols: popularStocks.slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  };

  const fetchStockData = async (symbols: string[] = popularStocks) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stockData = symbols.map(generateMockStockData);
      setStocks(stockData);
      
      const newsData = generateMockNews();
      setNews(newsData);

      // Generate forecasts for all stocks
      const forecastData: Record<string, StockForecast> = {};
      symbols.forEach(symbol => {
        forecastData[symbol] = generateForecast(symbol);
      });
      setForecasts(forecastData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchStock = async (symbol: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const stockData = generateMockStockData(symbol.toUpperCase());
      setStocks([stockData]);
      setSelectedStock(symbol.toUpperCase());
      
      // Generate forecast for searched stock
      const forecast = generateForecast(symbol.toUpperCase());
      setForecasts(prev => ({ ...prev, [symbol.toUpperCase()]: forecast }));
    } catch (error) {
      console.error('Error searching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockBySymbol = (symbol: string) => {
    return stocks.find(stock => stock.symbol === symbol);
  };

  const getForecastBySymbol = (symbol: string) => {
    return forecasts[symbol];
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchStockData();
    const interval = setInterval(() => {
      fetchStockData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    stocks,
    news,
    loading,
    selectedStock,
    forecasts,
    popularStocks,
    fetchStockData,
    searchStock,
    getStockBySymbol,
    getForecastBySymbol,
    setSelectedStock
  };
};

const getCompanyName = (symbol: string): string => {
  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'TSLA': 'Tesla Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'NFLX': 'Netflix Inc.',
    'AMD': 'Advanced Micro Devices',
    'INTC': 'Intel Corporation'
  };
  return companies[symbol] || `${symbol} Corporation`;
};

const getSector = (symbol: string): string => {
  const sectors: Record<string, string> = {
    'AAPL': 'Technology',
    'TSLA': 'Automotive',
    'GOOGL': 'Technology',
    'MSFT': 'Technology',
    'AMZN': 'Consumer Discretionary',
    'META': 'Technology',
    'NVDA': 'Technology',
    'NFLX': 'Communication Services',
    'AMD': 'Technology',
    'INTC': 'Technology'
  };
  return sectors[symbol] || 'Technology';
};

const getIndustry = (symbol: string): string => {
  const industries: Record<string, string> = {
    'AAPL': 'Consumer Electronics',
    'TSLA': 'Electric Vehicles',
    'GOOGL': 'Internet Services',
    'MSFT': 'Software',
    'AMZN': 'E-commerce',
    'META': 'Social Media',
    'NVDA': 'Semiconductors',
    'NFLX': 'Streaming Services',
    'AMD': 'Semiconductors',
    'INTC': 'Semiconductors'
  };
  return industries[symbol] || 'Software';
};

const getDescription = (symbol: string): string => {
  const descriptions: Record<string, string> = {
    'AAPL': 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    'TSLA': 'Tesla Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
    'GOOGL': 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    'MSFT': 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    'AMZN': 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.'
  };
  return descriptions[symbol] || `${symbol} is a leading company in its sector with strong market presence and growth potential.`;
};