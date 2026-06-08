import React, { useState, useEffect, useCallback } from 'react';
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
  ThumbsDown,
  Rss
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const API_BASE = 'http://localhost:8000';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string | number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  relevanceScore: number;
  symbols: string[];
}

const TRACKED_SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];

/** Fetch news for a list of symbols and deduplicate by title */
async function fetchNewsForSymbols(symbols: string[]): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    symbols.map((sym) =>
      fetch(`${API_BASE}/api/news/latest?symbol=${sym}`).then((r) => r.json())
    )
  );
  const seen = new Set<string>();
  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      for (const item of r.value as NewsItem[]) {
        if (!seen.has(item.title)) {
          seen.add(item.title);
          all.push(item);
        }
      }
    }
  }
  return all.sort((a, b) => Number(b.publishedAt) - Number(a.publishedAt));
}

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const items = await fetchNewsForSymbols(TRACKED_SYMBOLS);
      setNews(items);
    } catch (e: any) {
      setNewsError('Could not load news. Is the backend running?');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [loadNews]);


  const filteredNews = news.filter((item) => {
    const matchesSentiment = selectedSentiment === 'all' || item.sentiment === selectedSentiment;
    const matchesSource = selectedSource === 'all' || item.source === selectedSource;
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSymbol = selectedSymbol === 'all' || (item.symbols || []).includes(selectedSymbol);
    return matchesSentiment && matchesSource && matchesSearch && matchesSymbol;
  });

  const sentimentData = [
    { name: 'Positive', value: news.filter((n) => n.sentiment === 'positive').length, color: '#10B981' },
    { name: 'Neutral',  value: news.filter((n) => n.sentiment === 'neutral').length,  color: '#6B7280' },
    { name: 'Negative', value: news.filter((n) => n.sentiment === 'negative').length, color: '#EF4444' },
  ];

  const sentimentTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString(),
      positive: Math.floor(Math.random() * 20) + 10,
      negative: Math.floor(Math.random() * 15) + 5,
      neutral:  Math.floor(Math.random() * 25) + 15,
    };
  });

  const marketImpact = [
    { symbol: 'AAPL',  sentiment:  0.65, impact: 'High',      change:  2.34 },
    { symbol: 'TSLA',  sentiment:  0.82, impact: 'Very High', change:  5.67 },
    { symbol: 'GOOGL', sentiment: -0.23, impact: 'Medium',    change: -1.25 },
    { symbol: 'MSFT',  sentiment:  0.45, impact: 'Medium',    change:  3.42 },
    { symbol: 'AMZN',  sentiment:  0.12, impact: 'Low',       change: -0.98 },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Very High': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'High':      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'Medium':    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'Low':       return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:          return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const sources  = [...new Set(news.map((item) => item.source).filter(Boolean))];
  const symbols  = TRACKED_SYMBOLS;

  const formatDate = (publishedAt: string | number) => {
    const ms = typeof publishedAt === 'number' ? publishedAt : Date.parse(publishedAt);
    if (isNaN(ms)) return '—';
    return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 dark:bg-slate-950 pt-20 pb-8 overflow-hidden">
      {/* Abstract Glowing Decorative Elements */}
      <div className="gradient-blob bg-blue-400 dark:bg-blue-600 top-20 -left-40"></div>
      <div className="gradient-blob bg-purple-400 dark:bg-purple-600 bottom-10 -right-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                <span className="text-gradient-primary">News Sentiment Analysis</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                Real-time financial news with AI-powered sentiment scoring and market impact assessment.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <button
                onClick={loadNews}
                disabled={newsLoading}
                className="px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 font-semibold text-sm flex items-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${newsLoading ? 'animate-spin' : ''}`} />
                Refresh News
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {newsError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{newsError}</p>
          </div>
        )}


        {/* Filters */}
        <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 mb-8 shadow-xl hover-card-trigger transition-all duration-300 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Sentiment</label>
              <select
                value={selectedSentiment}
                onChange={(e) => setSelectedSentiment(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Source</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="all">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Symbol</label>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
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
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors font-semibold text-sm shadow-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Feed */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-xl overflow-hidden animate-fade-in-up">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800/85">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-905 dark:text-white">Latest Financial News</h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredNews.length} articles
                  </span>
                </div>
              </div>
              
              <div className="max-h-[800px] overflow-y-auto">
                {newsLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading latest news from yfinance…</p>
                  </div>
                ) : filteredNews.length === 0 ? (
                  <div className="p-12 text-center">
                    <Rss className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No articles found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      {newsError ? 'Check that the backend is running.' : 'Try different filters or refresh.'}
                    </p>
                    <button
                      onClick={loadNews}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 p-6">
                    {filteredNews.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.05, 0.5) }}
                        className="p-4 bg-white/30 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-2xl hover-card-trigger transition-all duration-300 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            {item.sentiment === 'positive' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : item.sentiment === 'negative' ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : (
                              <Minus className="h-4 w-4 text-gray-500" />
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.sentiment === 'positive' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' :
                              item.sentiment === 'negative' ? 'text-red-600 bg-red-100 dark:bg-red-900/30' :
                              'text-gray-600 bg-gray-100 dark:bg-gray-800'
                            }`}>
                              {item.sentiment}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.source}</span>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(item.publishedAt)}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 leading-snug">
                          {item.title}
                        </h3>

                        {item.summary && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm line-clamp-2">
                            {item.summary}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 flex-wrap">
                            {(item.symbols || []).map((symbol) => (
                              <span
                                key={symbol}
                                className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                              >
                                {symbol}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {((item.sentimentScore || 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>Read</span>
                              </a>
                            )}
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl animate-fade-in-up">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">Sentiment Distribution</h3>
              
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">7-Day Sentiment Trend</h3>
              
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">Market Impact Analysis</h3>
              
              <div className="space-y-4">
                {marketImpact.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-4 bg-white/30 dark:bg-slate-900/20 border border-slate-100/50 dark:border-slate-800/40 rounded-2xl hover-card-trigger transition-all duration-300 shadow-sm">
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">AI Insights</h3>
              
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-bold text-blue-800 dark:text-blue-200">Bullish Sentiment</span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Tech stocks showing strong positive sentiment with 68% bullish news coverage.
                  </p>
                </div>
                
                <div className="p-3.5 bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-100/50 dark:border-yellow-900/30 rounded-2xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Market Volatility</span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Increased news volume may indicate higher volatility in the coming sessions.
                  </p>
                </div>
                
                <div className="p-3.5 bg-green-50/50 dark:bg-green-950/20 border border-green-100/50 dark:border-green-900/30 rounded-2xl shadow-sm">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-bold text-green-800 dark:text-green-200">Sector Rotation</span>
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