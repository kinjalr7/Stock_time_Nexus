import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Customized
} from 'recharts';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  BarChart3,
  Zap,
  Search,
  Filter,
  Eye,
  Brain,
  DollarSign,
  Calendar,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';

// Minimal candlestick renderer for Recharts using Customized
const Candles: React.FC<any> = ({ width, xAxisMap, yAxisMap, data }) => {
  if (!xAxisMap || !yAxisMap || !data || !width) return null;
  const xScale = xAxisMap.xAxis?.scale;
  const yScale = yAxisMap.yAxis?.scale;
  if (!xScale || !yScale) return null;

  const candleWidth = Math.max(2, width / (data.length * 2));
  return (
    <g>
      {data.map((d: any, i: number) => {
        const xCenter = xScale(d.date);
        if (typeof xCenter !== 'number') return null;
        const x = xCenter - candleWidth / 2;

        const open = d.open;
        const close = d.close;
        const high = d.high;
        const low = d.low;
        if ([open, close, high, low].some((v) => typeof v !== 'number')) return null;

        const up = close >= open;
        const color = up ? '#10B981' : '#EF4444';
        const yHigh = yScale(high);
        const yLow = yScale(low);
        const yOpen = yScale(open);
        const yClose = yScale(close);
        const bodyY = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));
        return (
          <g key={i}>
            <line x1={x + candleWidth / 2} x2={x + candleWidth / 2} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
            <rect x={x} y={bodyY} width={candleWidth} height={bodyH} fill={color} opacity={0.7} rx={1} />
          </g>
        );
      })}
    </g>
  );
};

interface RecommendationsPanelProps {
  stockData: any;
  selectedStock: string;
}

function RecommendationsPanel({ stockData, selectedStock }: RecommendationsPanelProps) {
  const [selectedCluster, setSelectedCluster] = useState<null | number>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStockDetail, setSelectedStockDetail] = useState<string | null>(null);
  const [filterSector, setFilterSector] = useState('all');
  const [showAddStock, setShowAddStock] = useState(false);
  const [customStock, setCustomStock] = useState({
    symbol: '',
    name: '',
    sector: '',
    price: '',
    change: '',
    changePercent: ''
  });

  const stockDatabase = [
    // Tech Giants
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 175.84, change: 2.34, changePercent: 1.35, marketCap: '2.8T', pe: 28.5, dividend: 0.53, beta: 1.2, volume: '45.2M', cluster: 1, similarity: 100, selected: selectedStock === 'AAPL' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', price: 378.85, change: 4.12, changePercent: 1.10, marketCap: '2.8T', pe: 32.1, dividend: 2.72, beta: 0.9, volume: '28.1M', cluster: 1, similarity: 89.7, selected: selectedStock === 'MSFT' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: 142.56, change: 1.87, changePercent: 1.33, marketCap: '1.8T', pe: 25.4, dividend: 0, beta: 1.1, volume: '32.5M', cluster: 1, similarity: 87.3, selected: selectedStock === 'GOOGL' },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', price: 352.70, change: 8.90, changePercent: 2.59, marketCap: '895B', pe: 24.8, dividend: 0, beta: 1.3, volume: '18.7M', cluster: 1, similarity: 85.1, selected: selectedStock === 'META' },
    
    // High Growth
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', price: 248.50, change: -5.20, changePercent: -2.05, marketCap: '789B', pe: 65.2, dividend: 0, beta: 2.1, volume: '95.3M', cluster: 2, similarity: 94.2, selected: selectedStock === 'TSLA' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', price: 875.25, change: 15.60, changePercent: 1.81, marketCap: '2.2T', pe: 71.3, dividend: 0.16, beta: 1.7, volume: '42.8M', cluster: 2, similarity: 92.8, selected: selectedStock === 'NVDA' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', price: 184.52, change: -2.15, changePercent: -1.15, marketCap: '298B', pe: 45.6, dividend: 0, beta: 1.8, volume: '38.9M', cluster: 2, similarity: 88.4, selected: selectedStock === 'AMD' },
    
    // Value Stocks
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-commerce', price: 152.32, change: -2.45, changePercent: -1.58, marketCap: '1.6T', pe: 42.1, dividend: 0, beta: 1.2, volume: '35.6M', cluster: 3, similarity: 82.7, selected: selectedStock === 'AMZN' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', price: 168.45, change: 1.23, changePercent: 0.74, marketCap: '485B', pe: 12.8, dividend: 4.00, beta: 1.1, volume: '12.4M', cluster: 3, similarity: 78.9, selected: selectedStock === 'JPM' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', price: 162.78, change: 0.89, changePercent: 0.55, marketCap: '428B', pe: 15.2, dividend: 2.95, beta: 0.7, volume: '8.9M', cluster: 3, similarity: 75.3, selected: selectedStock === 'JNJ' },
    
    // Additional stocks for comprehensive analysis
    { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Entertainment', price: 445.23, change: 12.45, changePercent: 2.88, marketCap: '198B', pe: 35.7, dividend: 0, beta: 1.4, volume: '4.2M', cluster: 2, similarity: 79.6, selected: selectedStock === 'NFLX' },
    { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Entertainment', price: 98.76, change: -1.34, changePercent: -1.34, marketCap: '180B', pe: 28.9, dividend: 0, beta: 1.2, volume: '11.8M', cluster: 3, similarity: 72.1, selected: selectedStock === 'DIS' },
    
    // Healthcare Sector
    { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', price: 28.45, change: -0.32, changePercent: -1.11, marketCap: '161B', pe: 12.3, dividend: 6.12, beta: 0.8, volume: '45.8M', cluster: 3, similarity: 68.9, selected: selectedStock === 'PFE' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', price: 485.67, change: 8.92, changePercent: 1.87, marketCap: '449B', pe: 18.9, dividend: 1.45, beta: 0.9, volume: '3.2M', cluster: 1, similarity: 76.4, selected: selectedStock === 'UNH' },
    { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', price: 156.78, change: 2.34, changePercent: 1.52, marketCap: '276B', pe: 14.2, dividend: 4.12, beta: 0.7, volume: '6.8M', cluster: 3, similarity: 71.2, selected: selectedStock === 'ABBV' },
    
    // Energy Sector
    { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', price: 98.45, change: -1.23, changePercent: -1.23, marketCap: '413B', pe: 11.8, dividend: 3.85, beta: 1.1, volume: '18.9M', cluster: 3, similarity: 69.8, selected: selectedStock === 'XOM' },
    { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', price: 145.67, change: 2.89, changePercent: 2.02, marketCap: '287B', pe: 13.2, dividend: 4.15, beta: 1.0, volume: '12.3M', cluster: 3, similarity: 67.4, selected: selectedStock === 'CVX' },
    
    // Consumer Goods
    { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Goods', price: 58.92, change: 0.45, changePercent: 0.77, marketCap: '255B', pe: 24.1, dividend: 3.12, beta: 0.6, volume: '15.7M', cluster: 3, similarity: 65.9, selected: selectedStock === 'KO' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Goods', price: 156.34, change: 1.23, changePercent: 0.79, marketCap: '369B', pe: 25.8, dividend: 2.45, beta: 0.4, volume: '8.9M', cluster: 3, similarity: 64.2, selected: selectedStock === 'PG' },
    
    // Industrial
    { symbol: 'BA', name: 'Boeing Co.', sector: 'Industrial', price: 245.67, change: 12.34, changePercent: 5.29, marketCap: '148B', pe: 45.2, dividend: 0, beta: 1.4, volume: '8.2M', cluster: 2, similarity: 73.8, selected: selectedStock === 'BA' },
    { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrial', price: 234.56, change: -3.45, changePercent: -1.45, marketCap: '118B', pe: 16.8, dividend: 2.12, beta: 1.2, volume: '4.1M', cluster: 1, similarity: 70.5, selected: selectedStock === 'CAT' },
    
    // Real Estate
    { symbol: 'SPG', name: 'Simon Property Group Inc.', sector: 'Real Estate', price: 145.23, change: 1.67, changePercent: 1.16, marketCap: '48B', pe: 18.9, dividend: 5.67, beta: 1.3, volume: '2.8M', cluster: 3, similarity: 62.7, selected: selectedStock === 'SPG' },
    
    // Communication Services
    { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services', price: 38.45, change: -0.23, changePercent: -0.59, marketCap: '162B', pe: 8.9, dividend: 7.23, beta: 0.5, volume: '22.1M', cluster: 3, similarity: 59.4, selected: selectedStock === 'VZ' },
    { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services', price: 16.78, change: 0.12, changePercent: 0.72, marketCap: '120B', pe: 7.2, dividend: 6.89, beta: 0.6, volume: '35.6M', cluster: 3, similarity: 58.1, selected: selectedStock === 'T' }
  ];

  const clusterData = stockDatabase.map(stock => ({
    x: stock.pe,
    y: stock.beta * 50,
    size: Math.log(parseFloat(stock.marketCap.replace(/[TB]/g, '')) * (stock.marketCap.includes('T') ? 1000 : 1)) * 10,
    cluster: stock.cluster,
    symbol: stock.symbol,
    name: stock.name,
    selected: stock.selected
  }));

  const clusterColors = {
    1: '#2563eb', // blue-600
    2: '#0ea5e9', // sky-500
    3: '#3b82f6', // blue-500
  };

  const clusterNames = {
    1: 'Stable Tech Giants',
    2: 'High-Growth Innovators',
    3: 'Value & Dividend Leaders'
  };

  const sectors = ['all', 'Technology', 'Automotive', 'E-commerce', 'Financial', 'Healthcare', 'Entertainment', 'Energy', 'Consumer Goods', 'Industrial', 'Real Estate', 'Communication Services'];

  const filteredStocks = stockDatabase.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'all' || stock.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  const handleAddCustomStock = () => {
    if (customStock.symbol && customStock.name && customStock.sector && customStock.price) {
      const newStock = {
        symbol: customStock.symbol.toUpperCase(),
        name: customStock.name,
        sector: customStock.sector,
        price: parseFloat(customStock.price),
        change: parseFloat(customStock.change) || 0,
        changePercent: parseFloat(customStock.changePercent) || 0,
        marketCap: 'N/A',
        pe: Math.random() * 50 + 10,
        dividend: Math.random() * 5,
        beta: Math.random() * 2 + 0.5,
        volume: 'N/A',
        cluster: Math.floor(Math.random() * 3) + 1,
        similarity: Math.random() * 30 + 70,
        selected: false
      };
      
      stockDatabase.push(newStock);
      setCustomStock({ symbol: '', name: '', sector: '', price: '', change: '', changePercent: '' });
      setShowAddStock(false);
    }
  };

  const getDetailedStockData = (symbol: string) => {
    const stock = stockDatabase.find(s => s.symbol === symbol);
    if (!stock) return null;

    // Generate mock historical data for the selected stock
    const historicalData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: stock.price + (Math.random() - 0.5) * stock.price * 0.1,
      volume: parseFloat(stock.volume.replace('M', '')) * 1000000 * (0.8 + Math.random() * 0.4)
    }));

    return {
      ...stock,
      historicalData,
      technicalIndicators: {
        rsi: 45.2 + Math.random() * 20,
        macd: (Math.random() - 0.5) * 2,
        sma20: stock.price * (0.98 + Math.random() * 0.04),
        sma50: stock.price * (0.95 + Math.random() * 0.1),
        bollinger: {
          upper: stock.price * 1.05,
          lower: stock.price * 0.95
        }
      },
      fundamentals: {
        revenue: `$${(Math.random() * 300 + 50).toFixed(1)}B`,
        grossMargin: `${(15 + Math.random() * 25).toFixed(1)}%`,
        operatingMargin: `${(5 + Math.random() * 20).toFixed(1)}%`,
        debtToEquity: (Math.random() * 2).toFixed(2),
        roe: `${(5 + Math.random() * 25).toFixed(1)}%`,
        currentRatio: (1 + Math.random() * 2).toFixed(2)
      },
      aiAnalysis: {
        sentiment: Math.random() > 0.5 ? 'Bullish' : Math.random() > 0.3 ? 'Neutral' : 'Bearish',
        confidence: (70 + Math.random() * 25).toFixed(1),
        priceTarget: stock.price * (1 + (Math.random() - 0.3) * 0.3),
        recommendation: Math.random() > 0.6 ? 'Buy' : Math.random() > 0.3 ? 'Hold' : 'Sell'
      }
    };
  };

  const currentStock = stockDatabase.find(stock => stock.selected);
  const currentCluster = currentStock ? currentStock.cluster : 1;

  const clusterAnalysis = {
    1: {
      name: 'Stable Tech Giants',
      description: 'Large-cap technology companies with consistent performance and strong fundamentals',
      characteristics: ['High market cap', 'Stable growth', 'Strong dividends', 'Low volatility'],
      avgReturn: '12.4%',
      volatility: 'Low-Medium',
      riskLevel: 'Conservative'
    },
    2: {
      name: 'High-Growth Innovators',
      description: 'Companies with high growth potential but increased volatility',
      characteristics: ['Emerging technologies', 'High beta', 'Innovation focus', 'Growth-oriented'],
      avgReturn: '18.7%',
      volatility: 'High',
      riskLevel: 'Aggressive'
    },
    3: {
      name: 'Value & Dividend Leaders',
      description: 'Established companies with strong dividend yields and value characteristics',
      characteristics: ['Dividend focus', 'Value pricing', 'Stable cash flow', 'Defensive'],
      avgReturn: '8.9%',
      volatility: 'Low',
      riskLevel: 'Conservative'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header with Search and Filters */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Stock Analysis</h1>
              <p className="text-gray-600 dark:text-gray-400">AI-powered stock clustering, analysis, and recommendations</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 dark:text-blue-400" />
                <input
                  type="text"
                  placeholder="Search stocks, sectors, or companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && setSearchTerm(e.currentTarget.value)}
                  className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector === 'all' ? 'All Sectors' : sector}
                  </option>
                ))}
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterSector('all');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </motion.button>
            </div>
          </div>

          {/* Quick Sector Filter Buttons */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-900 dark:text-white font-semibold">Quick Sector Filters</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {sectors.filter(s => s !== 'all').map(sector => (
                <motion.button
                  key={sector}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterSector(sector)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filterSector === sector
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                  }`}
                >
                  {sector}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterSector('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterSector === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                }`}
              >
                All Sectors
              </motion.button>
            </div>
          </div>

          {/* Search Results Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-900 dark:text-white font-semibold">
                    Search Results: {filteredStocks.length} stocks found
                  </span>
                </div>
                {searchTerm && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Search: "{searchTerm}"
                    </span>
                  </div>
                )}
                {filterSector !== 'all' && (
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Sector: {filterSector}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {stockDatabase.filter(s => s.cluster === 1).length}
                  </span> Stable Tech
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {stockDatabase.filter(s => s.cluster === 2).length}
                  </span> Growth
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {stockDatabase.filter(s => s.cluster === 3).length}
                  </span> Value
                </div>
              </div>
            </div>
            
            {/* Search Tips */}
            {filteredStocks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>💡 Tip:</span>
                  <span>Click on any stock card to view detailed analysis, charts, and AI recommendations</span>
                </div>
              </div>
            )}
          </div>

          {/* Add Custom Stock Modal */}
          <AnimatePresence>
            {showAddStock && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowAddStock(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-slate-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Custom Stock</h2>
                    <button
                      onClick={() => setShowAddStock(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock Symbol
                      </label>
                      <input
                        type="text"
                        value={customStock.symbol}
                        onChange={(e) => setCustomStock({...customStock, symbol: e.target.value})}
                        placeholder="e.g., AAPL"
                        className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={customStock.name}
                        onChange={(e) => setCustomStock({...customStock, name: e.target.value})}
                        placeholder="e.g., Apple Inc."
                        className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sector
                      </label>
                      <select
                        value={customStock.sector}
                        onChange={(e) => setCustomStock({...customStock, sector: e.target.value})}
                        className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Sector</option>
                        {sectors.filter(s => s !== 'all').map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price
                        </label>
                        <input
                          type="number"
                          value={customStock.price}
                          onChange={(e) => setCustomStock({...customStock, price: e.target.value})}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Change %
                        </label>
                        <input
                          type="number"
                          value={customStock.changePercent}
                          onChange={(e) => setCustomStock({...customStock, changePercent: e.target.value})}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddCustomStock}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Add Stock
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddStock(false)}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStocks.map((stock, index) => (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`bg-white dark:bg-slate-800 rounded-lg p-4 border cursor-pointer transition-all duration-200 ${
                  stock.selected 
                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-400'
                }`}
                onClick={() => setSelectedStockDetail(stock.symbol)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold">{stock.symbol}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{stock.sector}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Price</span>
                    <span className="text-gray-900 dark:text-white font-semibold">${stock.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Change</span>
                    <span className={`text-sm font-medium ${
                      stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Market Cap</span>
                    <span className="text-gray-900 dark:text-white text-sm">{stock.marketCap}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">P/E Ratio</span>
                    <span className="text-gray-900 dark:text-white text-sm">{stock.pe}</span>
                  </div>
                  
                  {stock.similarity < 100 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-xs">Similarity</span>
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">{stock.similarity}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-600 dark:bg-blue-400 h-1 rounded-full transition-all duration-500"
                          style={{ width: `${stock.similarity}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredStocks.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No stocks found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search terms or sector filter
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setFilterSector('all');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </motion.button>
            </div>
          )}

          {/* Cluster Visualization */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stock Similarity Clusters</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Machine learning-based stock grouping by behavior patterns</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="P/E Ratio" 
                      domain={[0, 80]}
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Beta Score" 
                      domain={[0, 120]}
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => {
                        const stock = clusterData.find(s => s.x === label);
                        return stock ? `${stock.symbol} - ${stock.name}` : '';
                      }}
                    />
                    
                    {Object.keys(clusterColors).map(clusterId => (
                      <Scatter
                        key={clusterId}
                        data={clusterData.filter(d => d.cluster === (parseInt(clusterId) as 1|2|3))}
                        fill={clusterColors[clusterId as unknown as 1|2|3]}
                      >
                        {clusterData.filter(d => d.cluster === (parseInt(clusterId) as 1|2|3)).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={entry.selected ? '#EF4444' : clusterColors[clusterId as unknown as 1|2|3]}
                            stroke={entry.selected ? '#FEF2F2' : 'none'}
                            strokeWidth={entry.selected ? 3 : 0}
                          />
                        ))}
                      </Scatter>
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="text-gray-900 dark:text-white font-semibold">Cluster Legend</h3>
                {Object.entries(clusterNames).map(([clusterId, name]) => (
                  <div key={clusterId} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: clusterColors[clusterId as unknown as 1|2|3] }}
                    />
                    <span className="text-gray-300 text-sm">{name}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-3 mt-4">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
                  <span className="text-gray-300 text-sm">Your Selection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stock Analysis Modal */}
          <AnimatePresence>
            {selectedStockDetail && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedStockDetail(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-800 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Type guard: only call getDetailedStockData if selectedStockDetail is not null */}
                  {selectedStockDetail ? (() => {
                    const stockDetailRaw = getDetailedStockData(selectedStockDetail);
                    const stockDetail = stockDetailRaw && {
                      ...stockDetailRaw,
                      historicalData: stockDetailRaw.historicalData.map((d: any, idx: number, arr: any[]) => {
                        if (
                          typeof d.open === 'number' &&
                          typeof d.high === 'number' &&
                          typeof d.low === 'number' &&
                          typeof d.close === 'number'
                        ) {
                          return d;
                        }
                        const prev = arr[Math.max(0, idx - 1)];
                        const base = typeof d.price === 'number' ? d.price : typeof d.close === 'number' ? d.close : 0;
                        const open = typeof prev?.close === 'number' ? prev.close : base * (0.995 + Math.random() * 0.01);
                        const close = base * (0.995 + Math.random() * 0.01);
                        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
                        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
                        return { ...d, open, high, low, close };
                      })
                    };
                    if (!stockDetail) return null;
                    return (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">{stockDetail.symbol}</span>
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-white">{stockDetail.name}</h2>
                              <p className="text-gray-400">{stockDetail.sector} • {stockDetail.marketCap} Market Cap</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setSelectedStockDetail(null)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-sm">Current Price</span>
                              <DollarSign className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">${stockDetail.price}</p>
                            <p className={`text-sm ${stockDetail.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {stockDetail.change >= 0 ? '+' : ''}{stockDetail.change} ({stockDetail.changePercent >= 0 ? '+' : ''}{stockDetail.changePercent}%)
                            </p>
                          </div>

                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-sm">AI Target</span>
                              <Brain className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-blue-400">${stockDetail.aiAnalysis.priceTarget.toFixed(2)}</p>
                            <p className="text-sm text-gray-300">{stockDetail.aiAnalysis.confidence}% confidence</p>
                          </div>

                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-sm">Recommendation</span>
                              {stockDetail.aiAnalysis.recommendation === 'Buy' ? (
                                <CheckCircle className="w-4 h-4 text-blue-400" />
                              ) : stockDetail.aiAnalysis.recommendation === 'Sell' ? (
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                              ) : (
                                <Shield className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <p className={`text-2xl font-bold ${
                              stockDetail.aiAnalysis.recommendation === 'Buy' ? 'text-blue-400' :
                              stockDetail.aiAnalysis.recommendation === 'Sell' ? 'text-red-400' : 'text-blue-400'
                            }`}>
                              {stockDetail.aiAnalysis.recommendation}
                            </p>
                            <p className="text-sm text-gray-300">{stockDetail.aiAnalysis.sentiment} sentiment</p>
                          </div>

                          <div className="bg-gray-700/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-sm">Volume</span>
                              <Activity className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">{stockDetail.volume}</p>
                            <p className="text-sm text-gray-300">Beta: {stockDetail.beta}</p>
                          </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* Price Chart */}
                          <div className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-white">Price History (30 Days)</h3>
                              <div className="text-xs text-gray-400">Line & Candlestick</div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                              <ComposedChart data={stockDetail.historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                                <YAxis stroke="#9CA3AF" fontSize={10} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                  }}
                                />
                                {/* Line overlay using close */}
                                <Line type="monotone" dataKey="close" stroke="#60A5FA" strokeWidth={2} dot={false} name="Close" />
                                {/* Candlesticks */}
                                <Customized component={Candles} />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Volume Chart */}
                          <div className="bg-gray-700/30 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Volume Trend</h3>
                            <ResponsiveContainer width="100%" height={200}>
                              <AreaChart data={stockDetail.historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} />
                                <YAxis stroke="#9CA3AF" fontSize={10} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="volume"
                                  stroke="#3B82F6"
                                  fill="#3B82F6"
                                  fillOpacity={0.3}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Technical & Fundamental Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Technical Indicators */}
                          <div className="bg-gray-700/30 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators</h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">RSI (14)</span>
                                <span className="text-white">{stockDetail.technicalIndicators.rsi.toFixed(1)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">MACD</span>
                                <span className={`${stockDetail.technicalIndicators.macd >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                  {stockDetail.technicalIndicators.macd.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">SMA (20)</span>
                                <span className="text-white">${stockDetail.technicalIndicators.sma20.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">SMA (50)</span>
                                <span className="text-white">${stockDetail.technicalIndicators.sma50.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Bollinger Upper</span>
                                <span className="text-white">${stockDetail.technicalIndicators.bollinger.upper.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Bollinger Lower</span>
                                <span className="text-white">${stockDetail.technicalIndicators.bollinger.lower.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Fundamental Analysis */}
                          <div className="bg-gray-700/30 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Fundamental Metrics</h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Revenue (TTM)</span>
                                <span className="text-white">{stockDetail.fundamentals.revenue}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Gross Margin</span>
                                <span className="text-white">{stockDetail.fundamentals.grossMargin}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Operating Margin</span>
                                <span className="text-white">{stockDetail.fundamentals.operatingMargin}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">P/E Ratio</span>
                                <span className="text-white">{stockDetail.pe}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Debt/Equity</span>
                                <span className="text-white">{stockDetail.fundamentals.debtToEquity}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">ROE</span>
                                <span className="text-white">{stockDetail.fundamentals.roe}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Current Ratio</span>
                                <span className="text-white">{stockDetail.fundamentals.currentRatio}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Dividend Yield</span>
                                <span className="text-white">{stockDetail.dividend > 0 ? `${stockDetail.dividend}%` : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })() : null}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cluster Analysis */}
          {currentStock && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Your Cluster: {clusterAnalysis[currentCluster as keyof typeof clusterAnalysis].name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {clusterAnalysis[currentCluster as keyof typeof clusterAnalysis].description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Average Return</h4>
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    {clusterAnalysis[currentCluster as keyof typeof clusterAnalysis].avgReturn}
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Volatility</h4>
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-lg font-semibold text-blue-400">
                    {clusterAnalysis[currentCluster as keyof typeof clusterAnalysis].volatility}
                  </p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Risk Level</h4>
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-lg font-semibold text-blue-400">
                    {clusterAnalysis[currentCluster as keyof typeof clusterAnalysis].riskLevel}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-white font-semibold mb-3">Cluster Characteristics</h4>
                <div className="grid grid-cols-2 gap-2">
                  {clusterAnalysis[currentCluster as keyof typeof clusterAnalysis].characteristics.map((char, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span>{char}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comprehensive Cluster Analysis - Always Visible */}
          <div className="space-y-6">
            {/* Cluster Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cluster Analysis Overview</h2>
                  <p className="text-gray-600 dark:text-gray-400">Complete breakdown of all stock clusters and their characteristics</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(clusterAnalysis).map(([clusterId, analysis]) => (
                  <div key={clusterId} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                    <div className="flex items-center space-x-3 mb-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: clusterColors[clusterId as unknown as 1|2|3] }}
                      />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{analysis.name}</h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{analysis.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Average Return</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{analysis.avgReturn}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Volatility</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{analysis.volatility}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Risk Level</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{analysis.riskLevel}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                      <h4 className="text-gray-900 dark:text-white font-semibold text-sm mb-2">Characteristics:</h4>
                      <div className="space-y-1">
                        {analysis.characteristics.map((char, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            <span>{char}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Performance Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Market Performance Summary</h2>
                  <p className="text-gray-600 dark:text-gray-400">Overall market statistics and performance metrics</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {stockDatabase.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Total Stocks</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {stockDatabase.filter(s => s.changePercent > 0).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Gaining Stocks</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                    {stockDatabase.filter(s => s.changePercent < 0).length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Declining Stocks</div>
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {sectors.filter(s => s !== 'all').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">Sectors Covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;