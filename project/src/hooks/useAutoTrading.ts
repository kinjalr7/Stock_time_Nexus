import { useState, useEffect } from 'react';

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  pnl: number;
  status: 'executed' | 'pending' | 'cancelled';
  strategy: string;
  confidence: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  value: number;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  parameters: Record<string, any>;
  performance: {
    totalTrades: number;
    winRate: number;
    avgReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

export interface Portfolio {
  totalValue: number;
  cash: number;
  positions: Position[];
  dailyPnL: number;
  totalPnL: number;
  totalReturn: number;
}

export const useAutoTrading = () => {
  const [isActive, setIsActive] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 100000,
    cash: 50000,
    positions: [],
    dailyPnL: 0,
    totalPnL: 0,
    totalReturn: 0
  });
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);

  useEffect(() => {
    initializeStrategies();
    generateMockTrades();
    generateMockPositions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        simulateTrading();
      }, 5000); // Execute trades every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, strategies]);

  const initializeStrategies = () => {
    const defaultStrategies: TradingStrategy[] = [
      {
        id: 'momentum',
        name: 'Momentum Strategy',
        description: 'Buy stocks with strong upward momentum and positive sentiment',
        isActive: true,
        parameters: {
          momentumThreshold: 0.02,
          sentimentThreshold: 0.3,
          stopLoss: 0.05,
          takeProfit: 0.1,
          maxPositionSize: 0.1
        },
        performance: {
          totalTrades: 156,
          winRate: 68.5,
          avgReturn: 0.034,
          sharpeRatio: 1.42,
          maxDrawdown: 0.08
        }
      },
      {
        id: 'meanReversion',
        name: 'Mean Reversion',
        description: 'Buy oversold stocks and sell overbought stocks',
        isActive: false,
        parameters: {
          rsiOverbought: 70,
          rsiOversold: 30,
          bollinger_std: 2,
          stopLoss: 0.03,
          takeProfit: 0.06
        },
        performance: {
          totalTrades: 89,
          winRate: 72.1,
          avgReturn: 0.028,
          sharpeRatio: 1.18,
          maxDrawdown: 0.06
        }
      },
      {
        id: 'aiPrediction',
        name: 'AI Prediction Based',
        description: 'Trade based on LSTM model predictions and confidence scores',
        isActive: true,
        parameters: {
          confidenceThreshold: 0.8,
          predictionHorizon: 5,
          minPriceChange: 0.015,
          riskPerTrade: 0.02
        },
        performance: {
          totalTrades: 203,
          winRate: 74.9,
          avgReturn: 0.041,
          sharpeRatio: 1.67,
          maxDrawdown: 0.05
        }
      }
    ];
    
    setStrategies(defaultStrategies);
  };

  const generateMockTrades = () => {
    const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];
    const strategies = ['momentum', 'meanReversion', 'aiPrediction'];
    const mockTrades: Trade[] = [];
    
    for (let i = 0; i < 20; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const price = Math.random() * 300 + 50;
      const quantity = Math.floor(Math.random() * 100) + 10;
      const pnl = (Math.random() - 0.4) * 1000; // Slight positive bias
      
      mockTrades.push({
        id: `trade-${i}`,
        symbol,
        type,
        quantity,
        price,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        pnl,
        status: 'executed',
        strategy: strategies[Math.floor(Math.random() * strategies.length)],
        confidence: Math.random() * 0.3 + 0.7
      });
    }
    
    setTrades(mockTrades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const generateMockPositions = () => {
    const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT'];
    const positions: Position[] = symbols.map(symbol => {
      const quantity = Math.floor(Math.random() * 100) + 10;
      const avgPrice = Math.random() * 300 + 50;
      const currentPrice = avgPrice + (Math.random() - 0.4) * 20;
      const value = quantity * currentPrice;
      const pnl = (currentPrice - avgPrice) * quantity;
      const pnlPercent = (pnl / (avgPrice * quantity)) * 100;
      
      return {
        symbol,
        quantity,
        avgPrice,
        currentPrice,
        pnl,
        pnlPercent,
        value
      };
    });
    
    const totalPositionValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    
    setPortfolio(prev => ({
      ...prev,
      positions,
      totalValue: prev.cash + totalPositionValue,
      totalPnL,
      totalReturn: (totalPnL / (prev.totalValue - totalPnL)) * 100,
      dailyPnL: totalPnL * 0.1 // Assume 10% of total PnL is from today
    }));
  };

  const simulateTrading = () => {
    const activeStrategies = strategies.filter(s => s.isActive);
    if (activeStrategies.length === 0) return;
    
    // Randomly execute a trade based on active strategies
    if (Math.random() < 0.3) { // 30% chance to execute a trade
      const strategy = activeStrategies[Math.floor(Math.random() * activeStrategies.length)];
      const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const price = Math.random() * 300 + 50;
      const quantity = Math.floor(Math.random() * 50) + 5;
      
      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        symbol,
        type,
        quantity,
        price,
        timestamp: new Date().toISOString(),
        pnl: 0, // Will be calculated later
        status: 'executed',
        strategy: strategy.id,
        confidence: Math.random() * 0.3 + 0.7
      };
      
      setTrades(prev => [newTrade, ...prev.slice(0, 49)]); // Keep last 50 trades
      
      // Update portfolio
      setPortfolio(prev => {
        const tradeValue = quantity * price;
        if (type === 'BUY') {
          return {
            ...prev,
            cash: prev.cash - tradeValue,
            totalValue: prev.totalValue // Will be recalculated with positions
          };
        } else {
          return {
            ...prev,
            cash: prev.cash + tradeValue,
            totalValue: prev.totalValue
          };
        }
      });
    }
  };

  const toggleTrading = () => {
    setIsActive(!isActive);
  };

  const toggleStrategy = (strategyId: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, isActive: !strategy.isActive }
        : strategy
    ));
  };

  const updateStrategyParameters = (strategyId: string, parameters: Record<string, any>) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === strategyId 
        ? { ...strategy, parameters: { ...strategy.parameters, ...parameters } }
        : strategy
    ));
  };

  const getPerformanceMetrics = () => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => trade.pnl > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const avgReturn = trades.reduce((sum, trade) => sum + trade.pnl, 0) / totalTrades || 0;
    
    return {
      totalTrades,
      winRate,
      avgReturn,
      totalPnL: portfolio.totalPnL,
      totalReturn: portfolio.totalReturn
    };
  };

  return {
    isActive,
    trades,
    portfolio,
    strategies,
    toggleTrading,
    toggleStrategy,
    updateStrategyParameters,
    getPerformanceMetrics
  };
};