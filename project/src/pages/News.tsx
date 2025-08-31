import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ExternalLink,
  Filter,
  Search,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Minus,
  RefreshCw,
  Globe,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useStockData } from '../hooks/useStockData';

const News: React.FC = () => {
  const { news, loading, fetchStockData } = useStockData();
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');

  useEffect(() => {
    const fetchNews = async () => {
      const res = await fetch('/api/news/latest?symbol=AAPL');
      const data = await res.json();
      // setNews(data); // This line was removed as per the edit hint
    };
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => {
    const matchesSentiment = selectedSentiment === 'all' || item.sentiment === selectedSentiment;
    const matchesSource = selectedSource === 'all' || item.source === selectedSource;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSymbol = selectedSymbol === 'all' || item.symbols.includes(selectedSymbol);
    
    return matchesSentiment && matchesSource && matchesSearch && matchesSymbol;
  });

  const sentimentData = [
    { name: 'Positive', value: news.filter(n => n.sentiment === 'positive').length, color: '#10B981' },
    { name: 'Neutral', value: news.filter(n => n.sentiment === 'neutral').length, color: '#6B7280' },
    { name: 'Negative', value: news.filter(n => n.sentiment === 'negative').length, color: '#EF4444' }
  ];

  const sentimentTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString(),
      positive: Math.floor(Math.random() * 20) + 10,
      negative: Math.floor(Math.random() * 15) + 5,
      neutral: Math.floor(Math.random() * 25) + 15
    };
  });

  const marketImpact = [
    { symbol: 'AAPL', sentiment: 0.65, impact: 'High', change: 2.34 },
    { symbol: 'TSLA', sentiment: 0.82, impact: 'Very High', change: 5.67 },
    { symbol: 'GOOGL', sentiment: -0.23, impact: 'Medium', change: -1.25 },
    { symbol: 'MSFT', sentiment: 0.45, impact: 'Medium', change: 3.42 },
    { symbol: 'AMZN', sentiment: 0.12, impact: 'Low', change: -0.98 }
  ];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Very High': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const sources = [...new Set(news.map(item => item.source))];
  const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">News Sentiment Analysis</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Real-time financial news analysis with AI-powered sentiment scoring and market impact assessment.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <button
                onClick={() => fetchStockData(['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'])}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh News
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sentiment</label>
              <select
                value={selectedSentiment}
                onChange={(e) => setSelectedSentiment(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Symbol</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Symbols</option>
                {symbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedSentiment('all');
                  setSelectedSource('all');
                  setSearchQuery('');
                  setSelectedSymbol('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Latest Financial News</h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredNews.length} articles
                  </span>
                </div>
              </div>
              
              <div className="max-h-[800px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading latest news...</p>
                  </div>
                ) : (
                  <div className="space-y-4 p-6">
                    {filteredNews.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getSentimentIcon(item.sentiment)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                              {item.sentiment}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.source}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {item.title}
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {item.summary}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {item.symbols.map(symbol => (
                              <span
                                key={symbol}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                              >
                                {symbol}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {(item.sentimentScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Read more</span>
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sentiment Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sentiment Distribution</h3>
              
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {sentimentData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">7-Day Sentiment Trend</h3>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="neutral"
                      stackId="1"
                      stroke="#6B7280"
                      fill="#6B7280"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="negative"
                      stackId="1"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Market Impact */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Impact Analysis</h3>
              
              <div className="space-y-4">
                {marketImpact.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{stock.symbol}</div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(stock.impact)}`}>
                          {stock.impact}
                        </span>
                        <span className="text-xs text-gray-500">
                          Sentiment: {(stock.sentiment * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Insights</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Bullish Sentiment</span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Tech stocks showing strong positive sentiment with 68% bullish news coverage.
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Market Volatility</span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Increased news volume may indicate higher volatility in the coming sessions.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Sector Rotation</span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    EV sector gaining momentum with 82% positive sentiment score.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;