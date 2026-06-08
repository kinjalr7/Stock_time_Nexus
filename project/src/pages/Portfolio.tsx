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
  Filter,
  X
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
  const [timeframe, setTimeframe] = useState('1M');
  const { holdings, trades, history, summary, loading, error, refresh, buyStock, sellStock } = usePortfolioData(timeframe);
  const [showRebalancing, setShowRebalancing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null);

  // Form states for adding/selling stocks
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    price: ''
  });
  const [sellData, setSellData] = useState({
    symbol: '',
    quantity: '',
    price: ''
  });

  const portfolioHistory = history;

  const totalValue = summary?.totalValue || 1;
  const colors: Record<string, string> = {
    Technology: '#3B82F6',
    Healthcare: '#10B981',
    Finance: '#F59E0B',
    Consumer: '#EF4444',
    Energy: '#8B5CF6',
    Unknown: '#6B7280',
  };

  const sectorAllocation = Object.entries(summary?.sectorBreakdown || {}).map(([name, amount]) => ({
    name,
    amount,
    value: parseFloat(((amount / totalValue) * 100).toFixed(1)),
    color: colors[name] || '#3B82F6'
  }));

  const totalPnL = summary?.totalPnL || 0;
  const invested = summary?.invested || 1;
  const totalReturnPercent = (totalPnL / invested) * 100;
  const totalReturnSign = totalReturnPercent >= 0 ? '+' : '';

  const performanceMetrics = [
    { metric: 'Total Return', value: `${totalReturnSign}${totalReturnPercent.toFixed(1)}%`, change: totalReturnPercent >= 0 ? '+2.3%' : '-2.3%', positive: totalReturnPercent >= 0 },
    { metric: 'Annualized Return', value: `${totalReturnSign}${(totalReturnPercent * 12).toFixed(1)}%`, change: '+1.8%', positive: totalReturnPercent >= 0 },
    { metric: 'Sharpe Ratio', value: '1.67', change: '+0.12', positive: true },
    { metric: 'Max Drawdown', value: '-5.2%', change: '-0.8%', positive: true },
    { metric: 'Beta', value: '1.15', change: '+0.05', positive: false },
    { metric: 'Alpha', value: '3.2%', change: '+0.7%', positive: true }
  ];

  const topHoldings = [...holdings]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const maxSectorExposure = sectorAllocation.length > 0 ? Math.max(...sectorAllocation.map(s => s.value)) : 0;
  const maxHoldingExposure = topHoldings.length > 0 ? topHoldings[0].weight : 0;

  const riskMetrics = [
    { name: 'Portfolio Risk', current: 15.2, target: 18.0, status: 'good' },
    { 
      name: 'Concentration Risk', 
      current: parseFloat(maxHoldingExposure.toFixed(1)), 
      target: 25.0, 
      status: maxHoldingExposure > 25.0 ? 'warning' : 'good' 
    },
    { 
      name: 'Sector Exposure', 
      current: parseFloat(maxSectorExposure.toFixed(1)), 
      target: 40.0, 
      status: maxSectorExposure > 40.0 ? 'warning' : 'good' 
    },
    { name: 'Liquidity Risk', current: 8.5, target: 15.0, status: 'good' }
  ];

  const techSect = sectorAllocation.find(s => s.name === 'Technology');
  const techVal = techSect ? techSect.value : 0;
  const healthSect = sectorAllocation.find(s => s.name === 'Healthcare');
  const healthVal = healthSect ? healthSect.value : 0;
  const financeSect = sectorAllocation.find(s => s.name === 'Finance');
  const financeVal = financeSect ? financeSect.value : 0;

  const rebalancingRecommendations = [
    { 
      action: techVal > 40 ? 'Reduce' : 'Maintain', 
      asset: 'Technology Sector', 
      current: `${techVal}%`, 
      target: '40%', 
      amount: techVal > 40 ? `$${Math.round((techVal - 40) * totalValue / 100).toLocaleString()}` : '$0' 
    },
    { 
      action: healthVal < 25 ? 'Increase' : 'Maintain', 
      asset: 'Healthcare Sector', 
      current: `${healthVal}%`, 
      target: '25%', 
      amount: healthVal < 25 ? `$${Math.round((25 - healthVal) * totalValue / 100).toLocaleString()}` : '$0' 
    },
    { 
      action: 'Maintain', 
      asset: 'Finance Sector', 
      current: `${financeVal}%`, 
      target: '15%', 
      amount: '$0' 
    }
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
    <div className="glass-panel shadow-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 mb-8 overflow-hidden animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Portfolio Holdings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time asset quantities, costs, and value metrics.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80">
              <th className="py-4 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Asset</th>
              <th className="py-4 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Shares</th>
              <th className="py-4 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Avg Cost</th>
              <th className="py-4 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Live Price</th>
              <th className="py-4 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Market Value</th>
              <th className="py-4 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">P&L</th>
              <th className="py-4 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">P&L %</th>
              <th className="py-4 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Weight</th>
              <th className="py-4 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sector</th>
              <th className="py-4 px-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => (
              <motion.tr 
                key={h.symbol} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-slate-50/50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/10 shadow-sm">
                      {h.symbol.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{h.symbol}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{h.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">{h.shares}</td>
                <td className="py-4 px-4 text-right font-medium text-slate-600 dark:text-slate-400">${h.avgPrice.toFixed(2)}</td>
                <td className="py-4 px-4 text-right font-medium text-slate-900 dark:text-white">${h.currentPrice.toFixed(2)}</td>
                <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white">${h.value.toLocaleString()}</td>
                <td className="py-4 px-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold ${
                    h.pnl >= 0 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {h.pnl >= 0 ? '+' : ''}${h.pnl.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${
                    h.pnlPercent >= 0 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-semibold text-slate-500 dark:text-slate-400">{h.weight.toFixed(2)}%</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {h.sector}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <button 
                    onClick={() => { setSelectedHolding(h.symbol); setShowCloseModal(true); }} 
                    className="px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors duration-200 text-xs font-medium"
                  >
                    Sell
                  </button>
                </td>
              </motion.tr>
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
                <span className="text-gradient-primary">Portfolio Management</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                Advanced portfolio analytics, risk exposure maps, and AI-driven optimization rules for intelligent investing.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2.5 bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="1W">1 Week</option>
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
              </select>
              <button
                onClick={() => setShowRebalancing(!showRebalancing)}
                className="px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 font-semibold text-sm flex items-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 active:scale-95"
              >
                <Target className="h-4 w-4 mr-2" />
                Rebalance
              </button>
              <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">
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
              className="glass-panel hover-card-trigger p-6 rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    <AnimatedCounter value={card.value} prefix={card.prefix} decimals={card.decimals} />
                  </p>
                  <div className="flex items-center mt-2">
                    <card.changeIcon className={`h-4 w-4 mr-1 ${card.changeColor}`} />
                    <span className={`text-sm font-semibold ${card.changeColor}`}>{card.change}</span>
                    {card.sub && <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">{card.sub}</span>}
                  </div>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center border border-current/10`}>
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
              className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 mb-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">Rebalancing Recommendations</h3>
              <div className="space-y-3">
                {rebalancingRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-slate-100 dark:border-slate-850 rounded-2xl bg-white/30 dark:bg-slate-900/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${getActionColor(rec.action)}`}>{rec.action}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{rec.amount}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1">{rec.asset}</div>
                    <div className="text-xs text-slate-450">{rec.current} → {rec.target}</div>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full mt-4 px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold text-sm shadow-md shadow-blue-500/10"
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
          className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 mb-8 shadow-xl"
        >
          <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">AI Insights</h3>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-4"
            >
              {holdings.length === 0 ? (
                <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl animate-fadeIn">
                  <div className="flex items-center mb-2">
                    <Target className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-bold text-blue-800 dark:text-blue-200">Welcome!</span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your portfolio is currently empty. Use the "Add Position" button on the right to start tracking stocks.
                  </p>
                </div>
              ) : (
                <>
                  {totalPnL >= 0 ? (
                    <div className="p-3.5 bg-green-50/50 dark:bg-green-950/20 border border-green-100/50 dark:border-green-900/30 rounded-2xl animate-fadeIn">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-bold text-green-800 dark:text-green-200">Strong Performance</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Your portfolio is showing positive returns with a total P&L of +${totalPnL.toLocaleString()}.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 rounded-2xl animate-fadeIn">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <span className="text-sm font-bold text-red-800 dark:text-red-200">Underperforming</span>
                      </div>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Your portfolio is down by ${Math.abs(totalPnL).toLocaleString()}. Consider reviewing your entries.
                      </p>
                    </div>
                  )}

                  {maxSectorExposure > 35 && (
                    <div className="p-3.5 bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-100/50 dark:border-yellow-900/30 rounded-2xl animate-fadeIn">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Concentration Risk</span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Consider reducing exposure to your highest sector ({maxSectorExposure.toFixed(1)}% of portfolio) to improve diversification.
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-2xl animate-fadeIn">
                    <div className="flex items-center mb-2">
                      <Target className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-bold text-blue-800 dark:text-blue-200">Optimization Tip</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Holdings are enriched in real-time with Yahoo Finance prices. Keep monitoring active signals to rebalance.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Performance Chart */}
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl animate-fade-in-up">
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-6">Performance Metrics</h3>
              
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-6">Top Holdings</h3>
              
              <div className="space-y-4">
                {topHoldings.map((holding, index) => (
                  <motion.div
                    key={holding.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/30 dark:bg-slate-900/20 border border-slate-100/50 dark:border-slate-800/40 rounded-2xl hover-card-trigger transition-all duration-300 shadow-sm"
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">Asset Allocation</h3>
              
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">Risk Analysis</h3>
              
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
            <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-slate-800/80 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button onClick={() => setShowAddModal(true)} className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 dark:bg-green-500 text-white rounded-2xl hover:bg-green-700 transition-all font-semibold text-sm shadow-md shadow-green-500/10 active:scale-98">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </button>
                
                <button onClick={() => setShowCloseModal(true)} className="w-full flex items-center justify-center px-4 py-2.5 bg-red-600 dark:bg-red-500 text-white rounded-2xl hover:bg-red-700 transition-all font-semibold text-sm shadow-md shadow-red-500/10 active:scale-98">
                  <Minus className="h-4 w-4 mr-2" />
                  Close Position
                </button>
                
                <button onClick={refresh} className="w-full flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-sm shadow-sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-sm shadow-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Portfolio Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        <HoldingsTable />
      </div>

      {/* Add Position Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700 animate-fadeIn"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Stock Position</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await buyStock(
                      formData.symbol,
                      parseInt(formData.quantity),
                      parseFloat(formData.price)
                    );
                    setShowAddModal(false);
                    setFormData({ symbol: '', quantity: '', price: '' });
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="e.g., AAPL"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="10"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="150.00"
                      min="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Buy Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Position Modal */}
      <AnimatePresence>
        {showCloseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700 animate-fadeIn"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Close / Sell Position</h2>
                <button
                  onClick={() => { setShowCloseModal(false); setSelectedHolding(null); }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const symbol = selectedHolding || sellData.symbol;
                  try {
                    await sellStock(
                      symbol,
                      parseInt(sellData.quantity),
                      parseFloat(sellData.price)
                    );
                    setShowCloseModal(false);
                    setSelectedHolding(null);
                    setSellData({ symbol: '', quantity: '', price: '' });
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={selectedHolding || sellData.symbol}
                    disabled={!!selectedHolding}
                    onChange={(e) => setSellData(prev => ({ ...prev, symbol: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white disabled:opacity-70"
                    placeholder="e.g., AAPL"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={sellData.quantity}
                      onChange={(e) => setSellData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="10"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={sellData.price}
                      onChange={(e) => setSellData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                      placeholder="155.00"
                      min="0.01"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCloseModal(false); setSelectedHolding(null); }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Sell Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;