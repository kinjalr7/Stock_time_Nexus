import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Plus,
  Search,
  Info,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUpIcon,
  TrendingDownIcon,
  Minus,
  RefreshCw,
  Eye,
  Star,
  Zap,
  Shield,
  Users,
  Globe,
  Smartphone,
  Car,
  ShoppingCart,
  Heart,
  Gamepad2,
  Coffee,
  Building2,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Bar,
  Scatter,
  ReferenceLine
} from 'recharts';
import { useStockData } from '../hooks/useStockData';
import { useMLModels } from '../hooks/useMLModels';
import StockSearch from '../components/StockSearch';
import StockDetails from '../components/StockDetails';

const Dashboard: React.FC = () => {
  const {
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
  } = useStockData();

  const { models, getBestModel, getModelRecommendation } = useMLModels();

  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y'>('1M');
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [selectedStockData, setSelectedStockData] = useState<any>(null);
  const [selectedForecast, setSelectedForecast] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'forecast' | 'news' | 'analysis'>('overview');

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStockData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchStockData]);

  const handleStockSearch = async (symbol: string) => {
    await searchStock(symbol);
  };

  const handleStockClick = (stock: any) => {
    const forecast = getForecastBySymbol(stock.symbol);
    setSelectedStockData(stock);
    setSelectedForecast(forecast);
    setShowStockDetails(true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getSectorIcon = (sector: string) => {
    const icons: Record<string, any> = {
      'Technology': Smartphone,
      'Healthcare': Heart,
      'Finance': Building2,
      'Energy': Zap,
      'Consumer Discretionary': ShoppingCart,
      'Communication Services': Globe,
      'Industrials': Car,
      'Consumer Staples': Coffee,
      'Real Estate': Building2,
      'Materials': Shield,
      'Utilities': Zap,
      'Automotive': Car
    };
    return icons[sector] || Building2;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'bearish': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'sell': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'hold': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  // Portfolio simulation data
  const portfolioValue = stocks.reduce((total, stock) => total + stock.price * 100, 0);
  const portfolioChange = stocks.reduce((total, stock) => total + stock.change * 100, 0);
  const portfolioChangePercent = portfolioValue > 0 ? (portfolioChange / portfolioValue) * 100 : 0;

  const stats = [
    {
      title: 'Portfolio Value',
      value: formatNumber(portfolioValue),
      change: `${portfolioChangePercent >= 0 ? '+' : ''}${portfolioChangePercent.toFixed(2)}%`,
      changeType: portfolioChangePercent >= 0 ? 'increase' : 'decrease',
      icon: DollarSign,
      description: 'Total portfolio value'
    },
    {
      title: 'Today\'s P&L',
      value: `${portfolioChange >= 0 ? '+' : ''}${formatNumber(portfolioChange)}`,
      change: `${portfolioChangePercent >= 0 ? '+' : ''}${portfolioChangePercent.toFixed(2)}%`,
      changeType: portfolioChangePercent >= 0 ? 'increase' : 'decrease',
      icon: TrendingUp,
      description: 'Daily profit/loss'
    },
    {
      title: 'Active Positions',
      value: stocks.length.toString(),
      change: '+2',
      changeType: 'increase',
      icon: BarChart3,
      description: 'Open positions'
    },
    {
      title: 'Best Model',
      value: getBestModel()?.name || 'LSTM',
      change: `${getBestModel()?.metrics.accuracy.toFixed(1)}%`,
      changeType: 'increase',
      icon: Activity,
      description: 'AI model accuracy'
    }
  ];

  const allocationData = [
    { name: 'Technology', value: 45, color: '#3B82F6' },
    { name: 'Healthcare', value: 25, color: '#10B981' },
    { name: 'Finance', value: 20, color: '#F59E0B' },
    { name: 'Energy', value: 10, color: '#EF4444' },
  ];

  const recentTrades = [
    { symbol: 'AAPL', type: 'BUY', quantity: 50, price: 185.20, time: '14:30', pnl: '+$234' },
    { symbol: 'TSLA', type: 'SELL', quantity: 25, price: 245.80, time: '13:45', pnl: '+$567' },
    { symbol: 'MSFT', type: 'BUY', quantity: 30, price: 375.40, time: '12:15', pnl: '+$123' },
    { symbol: 'GOOGL', type: 'SELL', quantity: 15, price: 144.20, time: '11:30', pnl: '-$89' },
  ];

  const sections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'forecast', label: 'Forecasts', icon: Target },
    { id: 'news', label: 'News', icon: Globe },
    { id: 'analysis', label: 'Analysis', icon: TrendingUp }
  ];

  // Ensure we have data before rendering
  if (loading && stocks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trading Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Real-time stock data, AI-powered forecasts, and market analysis
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <StockSearch 
                onSearch={handleStockSearch}
                popularStocks={popularStocks}
                loading={loading}
              />
              <div className="flex items-center space-x-2">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as any)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="1D">1 Day</option>
                  <option value="1W">1 Week</option>
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="6M">6 Months</option>
                  <option value="1Y">1 Year</option>
                </select>
                <button 
                  onClick={() => fetchStockData()}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <section.icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Performance</h2>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last 6 months</span>
                    </div>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stocks.slice(0, 6).map((stock, index) => ({
                        date: stock.symbol,
                        value: stock.price * 100
                      }))}>
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
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stock List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Market Overview</h2>
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {stocks.slice(0, 8).map((stock, index) => {
                      const forecast = getForecastBySymbol(stock.symbol);
                      const SectorIcon = getSectorIcon(stock.sector);
                      
                      return (
                        <motion.div
                          key={stock.symbol}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleStockClick(stock)}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-gray-100 dark:border-slate-600"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <SectorIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{stock.sector}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</div>
                            <div className={`text-sm flex items-center ${
                              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stock.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {stock.changePercent.toFixed(2)}%
                            </div>
                            {forecast && (
                              <div className={`text-xs px-2 py-1 rounded mt-1 ${getRecommendationColor(forecast.consensus.recommendation)}`}>
                                {forecast.consensus.recommendation.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Watchlist */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performers</h3>
                    <Star className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {stocks
                      .sort((a, b) => b.changePercent - a.changePercent)
                      .slice(0, 5)
                      .map((stock, index) => (
                        <motion.div
                          key={stock.symbol}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleStockClick(stock)}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{stock.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">${stock.price.toFixed(2)}</div>
                            <div className={`text-xs flex items-center ${
                              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stock.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>

                {/* Portfolio Allocation */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Allocation</h3>
                  
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    {allocationData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Trades */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Trades</h3>
                  
                  <div className="space-y-3">
                    {recentTrades.map((trade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.type === 'BUY' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {trade.type}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{trade.symbol}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{trade.quantity} shares</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{trade.pnl}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{trade.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'forecast' && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* AI Model Performance */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">AI Model Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {models.map((model, index) => (
                    <motion.div
                      key={model.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg"
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{model.name}</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {model.metrics.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        RMSE: {model.metrics.rmse.toFixed(3)}
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${model.metrics.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stock Forecasts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stocks.slice(0, 6).map((stock, index) => {
                  const forecast = getForecastBySymbol(stock.symbol);
                  if (!forecast) return null;

                  return (
                    <motion.div
                      key={stock.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stock.symbol}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(forecast.consensus.recommendation)}`}>
                          {forecast.consensus.recommendation.toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${stock.price.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Target Price</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${forecast.consensus.target.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={stock.forecastData.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="date" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="predicted"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="upperBound"
                              stroke="#10B981"
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="lowerBound"
                              stroke="#EF4444"
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      <button
                        onClick={() => handleStockClick(stock)}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeSection === 'news' && (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {news.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {item.summary}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ml-4 ${
                        item.sentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        item.sentiment === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {item.sentiment}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>{item.source}</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.symbols.map(symbol => (
                          <span key={symbol} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                            {symbol}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Market Sentiment Analysis */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Market Sentiment Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stocks.slice(0, 3).map((stock, index) => (
                    <div key={stock.symbol} className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stock.symbol}</div>
                      <div className={`text-lg font-semibold capitalize mb-2 ${getSentimentColor(stock.sentiment.overall)}`}>
                        {stock.sentiment.overall}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {(stock.sentiment.score * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stocks.slice(0, 4).map((stock, index) => (
                  <div key={stock.symbol} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{stock.symbol} Technical Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">RSI</div>
                        <div className={`text-lg font-semibold ${
                          stock.technicalIndicators.rsi > 70 ? 'text-red-600' : 
                          stock.technicalIndicators.rsi < 30 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                        }`}>
                          {stock.technicalIndicators.rsi.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">MACD</div>
                        <div className={`text-lg font-semibold ${
                          stock.technicalIndicators.macd > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.technicalIndicators.macd.toFixed(3)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">SMA 20</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${stock.technicalIndicators.sma20.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">SMA 50</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${stock.technicalIndicators.sma50.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stock Details Modal */}
      <AnimatePresence>
        {showStockDetails && selectedStockData && selectedForecast && (
          <StockDetails
            stock={selectedStockData}
            forecast={selectedForecast}
            onClose={() => setShowStockDetails(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;