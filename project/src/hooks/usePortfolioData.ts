import { useState, useEffect, useCallback } from 'react';

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

export const usePortfolioData = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      // Mock holdings
      const holdings: Holding[] = [
        { symbol: 'AAPL', name: 'Apple Inc.', shares: 150, avgPrice: 175.20, currentPrice: 182.50, value: 27375, weight: 10.95, pnl: 1095, pnlPercent: 4.17, sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 65, avgPrice: 365.80, currentPrice: 378.85, value: 24625, weight: 9.85, pnl: 848, pnlPercent: 3.57, sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 120, avgPrice: 145.60, currentPrice: 142.38, value: 17086, weight: 6.83, pnl: -386, pnlPercent: -2.21, sector: 'Technology' },
        { symbol: 'TSLA', name: 'Tesla Inc.', shares: 80, avgPrice: 235.40, currentPrice: 248.91, value: 19913, weight: 7.97, pnl: 1081, pnlPercent: 5.74, sector: 'Consumer' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 95, avgPrice: 155.20, currentPrice: 151.94, value: 14434, weight: 5.78, pnl: -310, pnlPercent: -2.10, sector: 'Consumer' }
      ];
      // Mock trades
      const trades: Trade[] = [
        { id: 't1', symbol: 'AAPL', type: 'buy', shares: 100, price: 170, date: '2024-05-01' },
        { id: 't2', symbol: 'AAPL', type: 'buy', shares: 50, price: 180, date: '2024-05-15' },
        { id: 't3', symbol: 'TSLA', type: 'buy', shares: 80, price: 235, date: '2024-04-20' },
        { id: 't4', symbol: 'GOOGL', type: 'buy', shares: 120, price: 145, date: '2024-03-10' },
        { id: 't5', symbol: 'AMZN', type: 'buy', shares: 95, price: 155, date: '2024-02-25' },
        { id: 't6', symbol: 'MSFT', type: 'buy', shares: 65, price: 365, date: '2024-01-30' },
        { id: 't7', symbol: 'GOOGL', type: 'sell', shares: 20, price: 150, date: '2024-06-01' }
      ];
      // Mock summary
      const totalValue = holdings.reduce((sum, h) => sum + h.value, 0) + 50000;
      const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);
      const cash = 50000;
      const invested = totalValue - cash;
      const positions = holdings.length;
      const winCount = holdings.filter(h => h.pnl > 0).length;
      const lossCount = holdings.filter(h => h.pnl < 0).length;
      const bestStock = holdings.reduce((best, h) => h.pnl > best.pnl ? h : best, holdings[0]).symbol;
      const worstStock = holdings.reduce((worst, h) => h.pnl < worst.pnl ? h : worst, holdings[0]).symbol;
      const sectorBreakdown: Record<string, number> = {};
      holdings.forEach(h => { sectorBreakdown[h.sector] = (sectorBreakdown[h.sector] || 0) + h.value; });
      const sharpe = 1.67;
      const sortino = 2.01;
      const drawdown = -5.2;
      setHoldings(holdings);
      setTrades(trades);
      setSummary({ totalValue, totalPnL, cash, invested, positions, winCount, lossCount, bestStock, worstStock, sectorBreakdown, sharpe, sortino, drawdown });
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  return { holdings, trades, summary, loading, error, refresh: fetchData };
}; 