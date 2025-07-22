import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  ComposedChart,
  Bar,
  Scatter,
  ReferenceLine
} from 'recharts';
import { StockData, StockForecast } from '../hooks/useStockData';

interface StockDetailsProps {
  stock: StockData;
  forecast: StockForecast;
  onClose: () => void;
}

const StockDetails: React.FC<StockDetailsProps> = ({ stock, forecast, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'forecast' | 'sentiment'>('overview');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y'>('1M');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'technical', label: 'Technical', icon: BarChart3 },
    { id: 'forecast', label: 'Forecast', icon: Target },
    { id: 'sentiment', label: 'Sentiment', icon: TrendingUp }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600';
      case 'bearish': return 'text-red-600';
      default: return 'text-gray-600';
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

  const combinedData = [
    ...stock.historicalData.slice(-30).map(item => ({
      date: item.date,
      price: item.close,
      volume: item.volume,
      type: 'historical'
    })),
    ...stock.forecastData.map(item => ({
      date: item.date,
      price: item.predicted,
      volume: 0,
      type: 'forecast',
      upperBound: item.upperBound,
      lowerBound: item.lowerBound
    }))
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{stock.symbol}</h2>
              <p className="text-blue-100">{stock.name}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-3xl font-bold">${stock.price.toFixed(2)}</span>
                <div className={`flex items-center ${stock.change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {stock.change >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 mr-1" />
                  )}
                  <span className="text-lg font-semibold">
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(stock.marketCap)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stock.pe.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(stock.volume)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">52W High</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${stock.high52w.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Chart</h3>
                  <div className="flex space-x-2">
                    {(['1D', '1W', '1M', '3M', '6M', '1Y'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          timeframe === tf
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                        dataKey="price"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
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
              </div>

              {/* Company Info */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sector</div>
                    <div className="font-medium text-gray-900 dark:text-white">{stock.sector}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Industry</div>
                    <div className="font-medium text-gray-900 dark:text-white">{stock.industry}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Beta</div>
                    <div className="font-medium text-gray-900 dark:text-white">{stock.beta.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Dividend Yield</div>
                    <div className="font-medium text-gray-900 dark:text-white">{stock.dividend.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</div>
                  <div className="text-gray-900 dark:text-white">{stock.description}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
              {/* Technical Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">RSI</div>
                  <div className={`text-lg font-semibold ${
                    stock.technicalIndicators.rsi > 70 ? 'text-red-600' : 
                    stock.technicalIndicators.rsi < 30 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {stock.technicalIndicators.rsi.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">MACD</div>
                  <div className={`text-lg font-semibold ${
                    stock.technicalIndicators.macd > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.technicalIndicators.macd.toFixed(3)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">SMA 20</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${stock.technicalIndicators.sma20.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">SMA 50</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${stock.technicalIndicators.sma50.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Technical Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Analysis</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stock.historicalData.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                      />
                      <ReferenceLine y={stock.technicalIndicators.sma20} stroke="#10B981" strokeDasharray="3 3" />
                      <ReferenceLine y={stock.technicalIndicators.sma50} stroke="#F59E0B" strokeDasharray="3 3" />
                      <ReferenceLine y={stock.technicalIndicators.bollingerUpper} stroke="#EF4444" strokeDasharray="3 3" />
                      <ReferenceLine y={stock.technicalIndicators.bollingerLower} stroke="#EF4444" strokeDasharray="3 3" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="space-y-6">
              {/* Forecast Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Forecast Summary</h3>
                    <p className="text-gray-600 dark:text-gray-400">AI-powered price predictions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${forecast.consensus.target.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${getRecommendationColor(forecast.consensus.recommendation)} px-2 py-1 rounded`}>
                      {forecast.consensus.recommendation.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Predictions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Predictions</h3>
                  <div className="space-y-3">
                    {Object.entries(forecast.models).map(([model, price]) => (
                      <div key={model} className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">{model}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Range</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">High Target</span>
                      <span className="font-semibold text-green-600">${forecast.consensus.high.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Low Target</span>
                      <span className="font-semibold text-red-600">${forecast.consensus.low.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Price</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${stock.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Forecast Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Price Forecast</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stock.forecastData}>
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
              </div>
            </div>
          )}

          {activeTab === 'sentiment' && (
            <div className="space-y-6">
              {/* Overall Sentiment */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Sentiment</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {stock.sentiment.overall}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Overall Sentiment</div>
                  </div>
                  <div className={`text-4xl ${getSentimentColor(stock.sentiment.overall)}`}>
                    {stock.sentiment.overall === 'bullish' ? <TrendingUpIcon /> : 
                     stock.sentiment.overall === 'bearish' ? <TrendingDownIcon /> : <Minus />}
                  </div>
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">News Sentiment</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {(stock.sentiment.newsSentiment * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Social Sentiment</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {(stock.sentiment.socialSentiment * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Analyst Rating</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stock.sentiment.analystRating.toFixed(1)}/5
                  </div>
                </div>
              </div>

              {/* Sentiment Score Chart */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sentiment Score</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'News', value: stock.sentiment.newsSentiment * 100 },
                      { name: 'Social', value: stock.sentiment.socialSentiment * 100 },
                      { name: 'Analyst', value: (stock.sentiment.analystRating / 5) * 100 },
                      { name: 'Overall', value: (stock.sentiment.score + 1) * 50 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StockDetails; 