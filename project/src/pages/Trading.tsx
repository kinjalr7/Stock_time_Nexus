import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Target,
  Zap,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Plus,
  Minus,
  DollarSign as DollarIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useAutoTrading } from '../hooks/useAutoTrading';

interface PriceRangeOrder {
  id: string;
  symbol: string;
  startPrice: number;
  endPrice: number;
  quantity: number;
  strategy: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  currentPrice?: number;
  progress?: number;
}

const Trading: React.FC = () => {
  const {
    isActive,
    trades,
    portfolio,
    strategies,
    toggleTrading,
    toggleStrategy,
    getPerformanceMetrics
  } = useAutoTrading();

  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]?.id || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showPriceRangeModal, setShowPriceRangeModal] = useState(false);
  const [priceRangeOrders, setPriceRangeOrders] = useState<PriceRangeOrder[]>([]);
  
  // Form state for price range trading
  const [formData, setFormData] = useState({
    symbol: '',
    startPrice: '',
    endPrice: '',
    quantity: '',
    strategy: strategies[0]?.id || ''
  });

  const performanceMetrics = getPerformanceMetrics();

  const portfolioHistory = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseValue = 100000;
    const growth = (i / 29) * 0.15; // 15% growth over 30 days
    const noise = (Math.random() - 0.5) * 0.02;
    return {
      date: date.toISOString().split('T')[0],
      value: baseValue * (1 + growth + noise),
      pnl: (Math.random() - 0.3) * 2000 // Slight positive bias
    };
  });

  const strategyPerformance = strategies.map(strategy => ({
    name: strategy.name,
    winRate: strategy.performance.winRate,
    avgReturn: strategy.performance.avgReturn * 100,
    trades: strategy.performance.totalTrades,
    sharpe: strategy.performance.sharpeRatio
  }));

  const recentSignals = [
    { symbol: 'AAPL', action: 'BUY', confidence: 0.89, price: 182.50, strategy: 'AI Prediction', time: '2 min ago' },
    { symbol: 'TSLA', action: 'SELL', confidence: 0.76, price: 248.91, strategy: 'Momentum', time: '5 min ago' },
    { symbol: 'GOOGL', action: 'HOLD', confidence: 0.65, price: 142.38, strategy: 'Mean Reversion', time: '8 min ago' },
    { symbol: 'MSFT', action: 'BUY', confidence: 0.82, price: 378.85, strategy: 'AI Prediction', time: '12 min ago' }
  ];

  const handlePriceRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrder: PriceRangeOrder = {
      id: `order_${Date.now()}`,
      symbol: formData.symbol.toUpperCase(),
      startPrice: parseFloat(formData.startPrice),
      endPrice: parseFloat(formData.endPrice),
      quantity: parseInt(formData.quantity),
      strategy: formData.strategy,
      status: 'active',
      createdAt: new Date().toISOString(),
      currentPrice: parseFloat(formData.startPrice),
      progress: 0
    };

    setPriceRangeOrders(prev => [...prev, newOrder]);
    setFormData({
      symbol: '',
      startPrice: '',
      endPrice: '',
      quantity: '',
      strategy: strategies[0]?.id || ''
    });
    setShowPriceRangeModal(false);
  };

  const cancelPriceRangeOrder = (orderId: string) => {
    setPriceRangeOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const }
          : order
      )
    );
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'SELL': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'HOLD': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <ArrowUpRight className="h-4 w-4" />;
      case 'SELL': return <ArrowDownRight className="h-4 w-4" />;
      case 'HOLD': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Auto Trading Engine</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                AI-powered automated trading with real-time strategy execution and portfolio management.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isActive ? 'Trading Active' : 'Trading Paused'}
                </span>
              </div>
              <button
                onClick={() => setShowPriceRangeModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <DollarIcon className="h-4 w-4 mr-2" />
                Set Price Range
              </button>
              <button
                onClick={toggleTrading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  isActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isActive ? 'Pause Trading' : 'Start Trading'}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Price Range Orders Section */}
        {priceRangeOrders.length > 0 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Range Orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priceRangeOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{order.symbol}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      {order.status === 'active' && (
                        <button
                          onClick={() => cancelPriceRangeOrder(order.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Start Price:</span>
                        <span className="font-medium text-gray-900 dark:text-white">${order.startPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">End Price:</span>
                        <span className="font-medium text-gray-900 dark:text-white">${order.endPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{order.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Strategy:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {strategies.find(s => s.id === order.strategy)?.name || order.strategy}
                        </span>
                      </div>
                    </div>
                    
                    {order.status === 'active' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{order.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${order.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${portfolio.totalValue.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    +{portfolio.totalReturn.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's P&L</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${portfolio.dailyPnL.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">+2.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics.winRate.toFixed(1)}%
                </p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">Excellent</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Trades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolio.positions.length}
                </p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-medium text-blue-600">Live</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Performance</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Value</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">P&L</span>
                  </div>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioHistory}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategy Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Strategy Performance</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="winRate" fill="#10B981" name="Win Rate %" />
                    <Bar dataKey="avgReturn" fill="#3B82F6" name="Avg Return %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Trades</h3>
              
              <div className="space-y-3">
                {trades.slice(0, 10).map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        trade.type === 'BUY' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {trade.type}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{trade.symbol}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {trade.quantity} shares @ ${trade.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {trade.strategy}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trading Strategies */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trading Strategies</h3>
              
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${strategy.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="font-medium text-gray-900 dark:text-white">{strategy.name}</span>
                      </div>
                      <button
                        onClick={() => toggleStrategy(strategy.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          strategy.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {strategy.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{strategy.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Win Rate:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {strategy.performance.winRate.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Trades:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {strategy.performance.totalTrades}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Return:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {(strategy.performance.avgReturn * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sharpe:</span>
                        <span className="font-medium text-gray-900 dark:text-white ml-1">
                          {strategy.performance.sharpeRatio.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Signals */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Trading Signals</h3>
              
              <div className="space-y-3">
                {recentSignals.map((signal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{signal.symbol}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getActionColor(signal.action)}`}>
                          {getActionIcon(signal.action)}
                          <span className="ml-1">{signal.action}</span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{signal.time}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">${signal.price}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(signal.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${signal.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Risk Management */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Management</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
                  <span className="font-medium text-red-600">-5.2%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Position Size Limit</span>
                  <span className="font-medium text-gray-900 dark:text-white">10%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Stop Loss</span>
                  <span className="font-medium text-gray-900 dark:text-white">-3%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Take Profit</span>
                  <span className="font-medium text-gray-900 dark:text-white">+8%</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Risk parameters within limits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Range Modal */}
        <AnimatePresence>
          {showPriceRangeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Set Price Range Order</h2>
                  <button
                    onClick={() => setShowPriceRangeModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handlePriceRangeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Symbol
                    </label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., AAPL"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.startPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, startPrice: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.endPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, endPrice: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Strategy
                    </label>
                    <select
                      value={formData.strategy}
                      onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {strategies.map((strategy) => (
                        <option key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPriceRangeModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Order
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Trading;