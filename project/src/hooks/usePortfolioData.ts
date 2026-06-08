import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  weight: number;
  pnl: number;
  pnlPercent: number;
  sector: string;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  date: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalPnL: number;
  cash: number;
  invested: number;
  positions: number;
  winCount: number;
  lossCount: number;
  bestStock: string;
  worstStock: string;
  sectorBreakdown: Record<string, number>;
  sharpe: number;
  sortino: number;
  drawdown: number;
}

export interface HistoryPoint {
  date: string;
  value: number;
  benchmark: number;
}

export const usePortfolioData = (timeframe: string = '1M') => {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const username = user?.username || 'demo';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [holdingsRes, historyRes] = await Promise.all([
        axios.get('http://localhost:8000/api/portfolio/', { params: { username } }),
        axios.get('http://localhost:8000/api/portfolio/history', { params: { username, timeframe } })
      ]);
      
      const rawData = holdingsRes.data;
      const historyData = historyRes.data;
      
      const symbolNames: Record<string, string> = {
        AAPL: 'Apple Inc.',
        MSFT: 'Microsoft Corp.',
        GOOGL: 'Alphabet Inc.',
        TSLA: 'Tesla Inc.',
        AMZN: 'Amazon.com Inc.',
        NVDA: 'NVIDIA Corp.',
        NFLX: 'Netflix Inc.',
        META: 'Meta Platforms Inc.',
        JPM: 'JPMorgan Chase & Co.',
        V: 'Visa Inc.',
        JNJ: 'Johnson & Johnson',
        PG: 'Procter & Gamble Co.',
        HD: 'Home Depot Inc.',
        DIS: 'The Walt Disney Co.',
      };

      const symbolSectors: Record<string, string> = {
        AAPL: 'Technology',
        MSFT: 'Technology',
        GOOGL: 'Technology',
        TSLA: 'Consumer',
        AMZN: 'Consumer',
        NVDA: 'Technology',
        NFLX: 'Consumer',
        META: 'Technology',
        JPM: 'Finance',
        V: 'Finance',
        JNJ: 'Healthcare',
        PG: 'Consumer',
        HD: 'Consumer',
        DIS: 'Consumer',
      };

      // Calculate total holding value
      const totalHoldingsValue = rawData.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
      const cash = 50000;
      const totalValue = totalHoldingsValue + cash;

      const holdingsData: Holding[] = rawData.map((item: any) => {
        const shares = item.quantity || 0;
        const avgPrice = item.avg_price || 0;
        const currentPrice = item.current_price || 0;
        const value = item.value || (shares * currentPrice);
        const pnl = item.pnl !== undefined ? item.pnl : (value - (shares * avgPrice));
        const pnlPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
        const weight = totalValue > 0 ? (value / totalValue) * 100 : 0;
        
        return {
          symbol: item.symbol,
          name: symbolNames[item.symbol] || `${item.symbol} Inc.`,
          shares,
          avgPrice,
          currentPrice,
          value,
          weight,
          pnl,
          pnlPercent,
          sector: symbolSectors[item.symbol] || 'Technology',
        };
      });
      
      // Calculate summary from the real holdings
      const totalPnL = holdingsData.reduce((sum, h) => sum + h.pnl, 0);
      const invested = totalValue - cash;
      const positions = holdingsData.length;
      const winCount = holdingsData.filter(h => h.pnl > 0).length;
      const lossCount = holdingsData.filter(h => h.pnl < 0).length;
      
      // Handle empty portfolio case
      let bestStock = 'N/A';
      let worstStock = 'N/A';
      if (holdingsData.length > 0) {
        bestStock = holdingsData.reduce((best, h) => h.pnl > best.pnl ? h : best, holdingsData[0]).symbol;
        worstStock = holdingsData.reduce((worst, h) => h.pnl < worst.pnl ? h : worst, holdingsData[0]).symbol;
      }
      
      const sectorBreakdown: Record<string, number> = {};
      holdingsData.forEach(h => { 
        const sector = h.sector || 'Unknown';
        sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + h.value; 
      });
      
      setHoldings(holdingsData);
      setHistory(historyData);
      setSummary({ 
        totalValue, 
        totalPnL, 
        cash, 
        invested, 
        positions, 
        winCount, 
        lossCount, 
        bestStock, 
        worstStock, 
        sectorBreakdown, 
        sharpe: 1.67, 
        sortino: 2.01, 
        drawdown: -5.2 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch portfolio data');
    } finally {
      setLoading(false);
    }
  }, [username, timeframe]);

  const buyStock = async (symbol: string, quantity: number, price: number) => {
    try {
      await axios.post('http://localhost:8000/api/portfolio/buy', {
        symbol: symbol.toUpperCase(),
        quantity,
        price
      }, {
        params: { username }
      });
      await fetchData();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to buy stock');
    }
  };

  const sellStock = async (symbol: string, quantity: number, price: number) => {
    try {
      await axios.post('http://localhost:8000/api/portfolio/sell', {
        symbol: symbol.toUpperCase(),
        quantity,
        price
      }, {
        params: { username }
      });
      await fetchData();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to sell stock');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  return { holdings, trades, history, summary, loading, error, refresh: fetchData, buyStock, sellStock };
}; 