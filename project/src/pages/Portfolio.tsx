import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';
import { usePortfolioData } from '../hooks/usePortfolioData';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  React.useEffect(() => {
    let start = display;
    let end = value;
    let frame: number;
    let startTime: number;
    const duration = 800;
    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setDisplay(start + (end - start) * progress);
      if (progress < 1) frame = requestAnimationFrame(animate);
      else setDisplay(end);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line
  }, [value]);
  return (
    <span>
      {prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
};

const Portfolio: React.FC = () => {
  const { holdings, trades, summary, loading, error, refresh } = usePortfolioData();
  const [timeframe, setTimeframe] = useState('1M');
  const [showRebalancing, setShowRebalancing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null);

  // Enhanced portfolio data
  const portfolioHistory = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseValue = 100000;
    const growth = (i / 29) * 0.18; // 18% growth over 30 days
    const noise = (Math.random() - 0.5) * 0.03;
    return {
      date: date.toISOString().split('T')[0],
      value: baseValue * (1 + growth + noise),
      benchmark: baseValue * (1 + (i / 29) * 0.12 + (Math.random() - 0.5) * 0.02), // S&P 500 benchmark
      cash: 50000 - (i * 1000),
      invested: baseValue * (1 + growth + noise) - (50000 - (i * 1000))
    };
  });

  const sectorAllocation = [
    { name: 'Technology', value: 45, amount: 112500, color: '#3B82F6' },
    { name: 'Healthcare', value: 20, amount: 50000, color: '#10B981' },
    { name: 'Finance', value: 15, amount: 37500, color: '#F59E0B' },
    { name: 'Consumer', value: 12, amount: 30000, color: '#EF4444' },
    { name: 'Energy', value: 8, amount: 20000, color: '#8B5CF6' }
  ];

  const performanceMetrics = [
    { metric: 'Total Return', value: '18.5%', change: '+2.3%', positive: true },
    { metric: 'Annualized Return', value: '22.1%', change: '+1.8%', positive: true },
    { metric: 'Sharpe Ratio', value: '1.67', change: '+0.12', positive: true },
    { metric: 'Max Drawdown', value: '-5.2%', change: '-0.8%', positive: true },
    { metric: 'Beta', value: '1.15', change: '+0.05', positive: false },
    { metric: 'Alpha', value: '3.2%', change: '+0.7%', positive: true }
  ];

  const topHoldings = [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 150, avgPrice: 175.20, currentPrice: 182.50, value: 27375, weight: 10.95, pnl: 1095, pnlPercent: 4.17 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 65, avgPrice: 365.80, currentPrice: 378.85, value: 24625, weight: 9.85, pnl: 848, pnlPercent: 3.57 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 120, avgPrice: 145.60, currentPrice: 142.38, value: 17086, weight: 6.83, pnl: -386, pnlPercent: -2.21 },
    { symbol: 'TSLA', name: 'Tesla Inc.', shares: 80, avgPrice: 235.40, currentPrice: 248.91, value: 19913, weight: 7.97, pnl: 1081, pnlPercent: 5.74 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 95, avgPrice: 155.20, currentPrice: 151.94, value: 14434, weight: 5.78, pnl: -310, pnlPercent: -2.10 }
  ];

  const riskMetrics = [
    { name: 'Portfolio Risk', current: 15.2, target: 18.0, status: 'good' },
    { name: 'Concentration Risk', current: 25.8, target: 30.0, status: 'good' },
    { name: 'Sector Exposure', current: 45.0, target: 40.0, status: 'warning' },
    { name: 'Liquidity Risk', current: 8.5, target: 15.0, status: 'good' }
  ];

  const rebalancingRecommendations = [
    { action: 'Reduce', asset: 'Technology Sector', current: '45%', target: '40%', amount: '$12,500' },
    { action: 'Increase', asset: 'Healthcare Sector', current: '20%', target: '25%', amount: '$12,500' },
    { action: 'Maintain', asset: 'Finance Sector', current: '15%', target: '15%', amount: '$0' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'danger': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Reduce': return 'text-red-600 bg-red-100';
      case 'Increase': return 'text-green-600 bg-green-100';
      case 'Maintain': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Add animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
  };

  // Advanced Holdings Table
  const HoldingsTable = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Holdings</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="py-2 px-4 text-left">Symbol</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-right">Shares</th>
              <th className="py-2 px-4 text-right">Avg Price</th>
              <th className="py-2 px-4 text-right">Current Price</th>
              <th className="py-2 px-4 text-right">Value</th>
              <th className="py-2 px-4 text-right">P&L</th>
              <th className="py-2 px-4 text-right">P&L %</th>
              <th className="py-2 px-4 text-right">Weight</th>
              <th className="py-2 px-4 text-left">Sector</th>
              <th className="py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.symbol} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <td className="py-2 px-4 font-semibold text-blue-600 dark:text-blue-400">{h.symbol}</td>
                <td className="py-2 px-4">{h.name}</td>
                <td className="py-2 px-4 text-right">{h.shares}</td>
                <td className="py-2 px-4 text-right">${h.avgPrice.toFixed(2)}</td>
                <td className="py-2 px-4 text-right">${h.currentPrice.toFixed(2)}</td>
                <td className="py-2 px-4 text-right">${h.value.toLocaleString()}</td>
                <td className={`py-2 px-4 text-right font-medium ${h.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{h.pnl >= 0 ? '+' : ''}${h.pnl}</td>
                <td className={`py-2 px-4 text-right font-medium ${h.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%</td>
                <td className="py-2 px-4 text-right">{h.weight.toFixed(2)}%</td>
                <td className="py-2 px-4">{h.sector}</td>
                <td className="py-2 px-4 text-center">
                  <button onClick={() => { setSelectedHolding(h.symbol); setShowCloseModal(true); }} className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Close</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Loading and error UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          <div className="text-lg text-gray-700 dark:text-gray-200">Loading portfolio...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="text-lg text-red-600">{error}</div>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Advanced portfolio analytics, risk management, and optimization tools for intelligent investing.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="1W">1 Week</option>
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
              </select>
              <button
                onClick={() => setShowRebalancing(!showRebalancing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Target className="h-4 w-4 mr-2" />
                Rebalance
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Overview Cards with animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[{
            label: 'Total Portfolio Value',
            value: summary?.totalValue ?? 0,
            icon: DollarSign,
            color: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-600 dark:text-blue-400',
            prefix: '$',
            decimals: 0,
            change: '',
            changeIcon: TrendingUp,
            changeColor: 'text-green-600',
            sub: 'vs benchmark'
          }, {
            label: 'Total P&L',
            value: summary?.totalPnL ?? 0,
            icon: TrendingUp,
            color: 'bg-green-100 dark:bg-green-900/30',
            text: 'text-green-600 dark:text-green-400',
            prefix: '$',
            decimals: 0,
            change: '',
            changeIcon: ArrowUpRight,
            changeColor: 'text-green-600',
            sub: 'total return'
          }, {
            label: 'Available Cash',
            value: summary?.cash ?? 0,
            icon: BarChart3,
            color: 'bg-purple-100 dark:bg-purple-900/30',
            text: 'text-purple-600 dark:text-purple-400',
            prefix: '$',
            decimals: 0,
            change: summary && summary.totalValue ? `${((summary.cash / summary.totalValue) * 100).toFixed(1)}%` : '',
            changeIcon: DollarSign,
            changeColor: 'text-blue-600',
            sub: 'of portfolio'
          }, {
            label: 'Active Positions',
            value: summary?.positions ?? 0,
            icon: Target,
            color: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-600 dark:text-orange-400',
            prefix: '',
            decimals: 0,
            change: summary ? `${summary.winCount} profitable` : '',
            changeIcon: CheckCircle,
            changeColor: 'text-green-600',
            sub: ''
          }].map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <AnimatedCounter value={card.value} prefix={card.prefix} decimals={card.decimals} />
                  </p>
                  <div className="flex items-center mt-2">
                    <card.changeIcon className={`h-4 w-4 mr-1 ${card.changeColor}`} />
                    <span className={`text-sm font-medium ${card.changeColor}`}>{card.change}</span>
                    {card.sub && <span className="text-sm text-gray-500 ml-1">{card.sub}</span>}
                  </div>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <card.icon className={`h-6 w-6 ${card.text}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Collapsible/animated Rebalancing Recommendations */}
        <AnimatePresence>
          {showRebalancing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rebalancing Recommendations</h3>
              <div className="space-y-3">
                {rebalancingRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(rec.action)}`}>{rec.action}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{rec.amount}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{rec.asset}</div>
                    <div className="text-xs text-gray-500">{rec.current} → {rec.target}</div>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Execute Rebalancing
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Insights</h3>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-4"
            >
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Strong Performance</span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Portfolio is outperforming benchmark by 6.4% with excellent risk-adjusted returns.
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Concentration Risk</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Consider reducing technology sector exposure from 45% to improve diversification.
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <Target className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Optimization</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Increasing healthcare allocation could improve risk-adjusted returns by 0.3%.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Performance Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio Performance</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">vs S&P 500 Benchmark</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Portfolio</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-400 rounded"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">S&P 500</span>
                  </div>
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioHistory}>
                    <defs>
                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6B7280" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6B7280" stopOpacity={0}/>
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
                      fill="url(#colorPortfolio)"
                      name="Portfolio Value"
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#6B7280"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBenchmark)"
                      name="S&P 500"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Metrics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {performanceMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.metric}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {metric.metric}
                    </div>
                    <div className={`text-xs flex items-center justify-center ${
                      metric.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.positive ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {metric.change}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Top Holdings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Holdings</h3>
              
              <div className="space-y-4">
                {topHoldings.map((holding, index) => (
                  <motion.div
                    key={holding.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{holding.symbol}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-600 dark:text-gray-400">
                          {holding.shares} shares @ ${holding.avgPrice}
                        </div>
                        <div className="text-gray-500">
                          Current: ${holding.currentPrice}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${holding.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {holding.weight.toFixed(1)}% of portfolio
                      </div>
                      <div className={`text-sm font-medium ${
                        holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.pnl >= 0 ? '+' : ''}${holding.pnl} ({holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Asset Allocation */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Allocation</h3>
              
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={sectorAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sectorAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {sectorAllocation.map((sector) => (
                  <div key={sector.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: sector.color }}
                      ></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{sector.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{sector.value}%</div>
                      <div className="text-xs text-gray-500">${sector.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Analysis</h3>
              
              <div className="space-y-4">
                {riskMetrics.map((risk, index) => (
                  <div key={risk.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{risk.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {risk.current}%
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(risk.status)}`}>
                          {risk.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          risk.status === 'good' ? 'bg-green-500' : 
                          risk.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(risk.current / risk.target) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: {risk.target}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Minus className="h-4 w-4 mr-2" />
                  Close Position
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  <Settings className="h-4 w-4 mr-2" />
                  Portfolio Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mb-4">
          <button onClick={refresh} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
          </button>
        </div>
        <HoldingsTable />
      </div>
    </div>
  );
};

export default Portfolio;