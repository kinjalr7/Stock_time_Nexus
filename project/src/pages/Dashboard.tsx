import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap,
  Brain,
  Target,
  Shield,
  Layers,
  CandlestickChart,
  LineChart as LineChartIcon,
  BarChart2,
  Radar,
  ChevronUp,
  ChevronDown,
  Minus,
  Signal,
  AlertCircle,
} from 'lucide-react';
import {
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell,
} from 'recharts';
import { useStockData } from '../hooks/useStockData';
import StockSearch from '../components/StockSearch';
import { useMLModels } from '../hooks/useMLModels';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartTab = 'candlestick' | 'price' | 'volume' | 'forecast';
type ModelKey = 'ARIMA' | 'Prophet' | 'LSTM' | 'XGBoost' | 'RandomForest';

const MODEL_CONFIG: Record<ModelKey, { color: string; label: string; description: string }> = {
  ARIMA:        { color: '#3B82F6', label: 'ARIMA',         description: 'Linear trend & seasonality' },
  Prophet:      { color: '#10B981', label: 'Prophet',       description: 'Handles holiday effects' },
  LSTM:         { color: '#F59E0B', label: 'LSTM',          description: 'Deep learning patterns' },
  XGBoost:      { color: '#EF4444', label: 'XGBoost',       description: 'Gradient boosting ensemble' },
  RandomForest: { color: '#A855F7', label: 'Random Forest', description: 'Bagging decision trees' },
};

// ─── Custom Candlestick Shape ─────────────────────────────────────────────────

const CandlestickBar = (props: any) => {
  const { x, y, width, height, open, close, high, low, payload } = props;
  if (!payload) return null;
  const isUp = payload.close >= payload.open;
  const color = isUp ? '#10B981' : '#EF4444';
  const bodyTop = Math.min(payload.open, payload.close);
  const bodyBottom = Math.max(payload.open, payload.close);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

  // We receive chart coordinates via y/height from recharts for the "bar"
  // We will use raw price data to compute positions ourselves
  return null; // handled via custom tick render instead
};

// ─── Helper to build candlestick data for recharts ────────────────────────────

function buildCandleData(hist: any[]) {
  return hist.slice(-60).map((d) => ({
    date: d.date?.slice(5) ?? '', // MM-DD
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
    volume: d.volume,
    // recharts ComposedChart trick: low-to-open segment + open-to-close body
    wick: [d.low, d.high] as [number, number],
    body: d.open < d.close
      ? [d.open, d.close]
      : [d.close, d.open],
    isUp: d.close >= d.open,
  }));
}

// ─── Custom Candle Tooltip ────────────────────────────────────────────────────

const CandleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const isUp = d.close >= d.open;
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs font-mono min-w-[160px]">
      <p className="text-slate-400 mb-2 font-sans font-semibold">{d.date}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4"><span className="text-slate-400">O</span><span className="text-white">${d.open?.toFixed(2)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">H</span><span className="text-emerald-400">${d.high?.toFixed(2)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">L</span><span className="text-red-400">${d.low?.toFixed(2)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">C</span><span className={isUp ? 'text-emerald-400' : 'text-red-400'}>${d.close?.toFixed(2)}</span></div>
        <div className="border-t border-slate-700 pt-1 mt-1 flex justify-between gap-4"><span className="text-slate-400">Vol</span><span className="text-blue-400">{(d.volume / 1e6).toFixed(1)}M</span></div>
      </div>
    </div>
  );
};

// ─── Circular Progress (model confidence) ─────────────────────────────────────

const CircularMeter = ({ value, color, size = 64 }: { value: number; color: string; size?: number }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        filter={`drop-shadow(0 0 4px ${color}88)`}
      />
    </svg>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KPICard = ({ icon: Icon, label, value, sub, positive, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3, boxShadow: `0 20px 40px -12px ${color}22` }}
    transition={{ duration: 0.3 }}
    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-slate-700 flex flex-col gap-2 cursor-default shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-400">{label}</span>
      <span className="p-1.5 rounded-lg" style={{ background: `${color}18` }}>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </span>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
    {sub && (
      <p className={`text-xs font-semibold flex items-center gap-1 ${positive === true ? 'text-emerald-600 dark:text-emerald-400' : positive === false ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}`}>
        {positive === true ? <ChevronUp className="h-3 w-3" /> : positive === false ? <ChevronDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
        {sub}
      </p>
    )}
  </motion.div>
);

// ─── Tab Button ───────────────────────────────────────────────────────────────

const TabBtn = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50 shadow-sm'
        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
    }`}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

// ─── Custom Candle Renderer via SVG overlay ───────────────────────────────────

const renderCandlestick = (data: any[], xKey = 'date') => {
  // This is rendered as a custom chart using recharts scatter + error bars approach
  // We'll use the Bar with custom shape
  return data;
};

// Custom bar shape for candlestick body
const CandleBodyShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || !width || width <= 0) return null;
  const isUp = payload.isUp;
  const color = isUp ? '#10B981' : '#EF4444';
  const glow = isUp ? '#10B98155' : '#EF444455';
  return (
    <g>
      <rect
        x={x + width * 0.2}
        y={y}
        width={width * 0.6}
        height={Math.max(Math.abs(height), 1)}
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${glow})` }}
        rx={1}
      />
    </g>
  );
};

// Custom wick shape
const CandleWickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || !width) return null;
  const isUp = payload.isUp;
  const color = isUp ? '#10B981' : '#EF4444';
  return (
    <line
      x1={x + width / 2}
      y1={y}
      x2={x + width / 2}
      y2={y + height}
      stroke={color}
      strokeWidth={1.5}
      opacity={0.7}
    />
  );
};

// ─── RSI Gauge ────────────────────────────────────────────────────────────────

const RSIGauge = ({ value }: { value: number }) => {
  const pct = Math.min(100, Math.max(0, value));
  const color = value < 30 ? '#EF4444' : value > 70 ? '#F59E0B' : '#10B981';
  const label = value < 30 ? 'Oversold' : value > 70 ? 'Overbought' : 'Neutral';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <CircularMeter value={pct} color={color} size={72} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>{value.toFixed(0)}</span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const {
    stocks,
    loading,
    selectedStock,
    fetchStockData,
    searchStock,
    getStockBySymbol,
    setSelectedStock,
    popularStocks,
    dataSource,
    lastUpdated,
  } = useStockData();

  const { models, trainModel, loadAllModelData, isTraining } = useMLModels(selectedStock);

  const [activeTab, setActiveTab] = useState<ChartTab>('candlestick');
  const [forecastHorizon, setForecastHorizon] = useState(30);
  const [selectedModels, setSelectedModels] = useState<ModelKey[]>(['ARIMA', 'Prophet', 'LSTM']);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStockData = getStockBySymbol(selectedStock);

  const handleModelToggle = (model: ModelKey) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const generateForecasts = async () => {
    if (!selectedStock) return;
    setIsGenerating(true);
    try {
      // Retrain the selected models
      for (const model of selectedModels) {
        await trainModel(selectedStock, model);
      }
      await loadAllModelData(selectedStock);
    } catch (e) {
      console.error("Forecast generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStockSearch = async (symbol: string) => {
    await searchStock(symbol);
  };

  // Build chart datasets
  const candleData = useMemo(
    () => buildCandleData(currentStockData?.historicalData ?? []),
    [currentStockData]
  );

  const priceData = useMemo(() => {
    if (!currentStockData) return [];
    const hist = currentStockData.historicalData.slice(-90);
    const ti = currentStockData.technicalIndicators;
    return hist.map((d) => ({
      date: d.date?.slice(5),
      close: d.close,
      sma20: ti.sma20,
      sma50: ti.sma50,
      bUp: ti.bollingerUpper,
      bLow: ti.bollingerLower,
    }));
  }, [currentStockData]);

  const volumeData = useMemo(() => {
    if (!currentStockData) return [];
    return currentStockData.historicalData.slice(-40).map((d) => ({
      date: d.date?.slice(5),
      volume: d.volume,
      isUp: d.close >= d.open,
    }));
  }, [currentStockData]);

  // Construct forecast data from real backend models
  const realForecastData = useMemo(() => {
    if (!models || models.length === 0) return [];
    
    // Group predictions by date
    const dateMap: Record<string, any> = {};
    
    models.forEach(model => {
      if (model.status === 'trained' && selectedModels.includes(model.type as ModelKey)) {
        model.predictions.forEach(p => {
          if (!dateMap[p.date]) {
            dateMap[p.date] = { date: p.date };
          }
          dateMap[p.date][model.type] = p.predicted;
        });
      }
    });
    
    return Object.values(dateMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [models, selectedModels]);

  const fullForecastData = useMemo(() => {
    if (!currentStockData) return [];
    const last = currentStockData.historicalData.slice(-20).map((d) => ({
      date: d.date?.slice(5),
      Historical: d.close,
    }));
    return [
      ...last,
      ...realForecastData.map((d) => ({ ...d, date: d.date?.slice(5) })),
    ];
  }, [currentStockData, realForecastData]);

  const ti = currentStockData?.technicalIndicators;
  const sentiment = currentStockData?.sentiment;
  const price = currentStockData?.price ?? 0;
  const change = currentStockData?.changePercent ?? 0;
  const isUp = change >= 0;

  // KPI data
  const kpis = [
    {
      icon: DollarSign,
      label: 'Price',
      value: price ? `$${price.toFixed(2)}` : '—',
      sub: `${isUp ? '+' : ''}${change.toFixed(2)}%`,
      positive: isUp,
      color: '#3B82F6',
    },
    {
      icon: Activity,
      label: 'Volume',
      value: currentStockData?.volume ? `${(currentStockData.volume / 1e6).toFixed(1)}M` : '—',
      sub: 'vs avg vol',
      positive: undefined,
      color: '#8B5CF6',
    },
    {
      icon: BarChart3,
      label: 'Market Cap',
      value: currentStockData?.marketCap ? `$${(currentStockData.marketCap / 1e9).toFixed(1)}B` : '—',
      sub: currentStockData?.sector ?? '—',
      positive: undefined,
      color: '#F59E0B',
    },
    {
      icon: Shield,
      label: 'RSI (14)',
      value: ti ? ti.rsi.toFixed(1) : '—',
      sub: ti ? (ti.rsi < 30 ? 'Oversold ⚡' : ti.rsi > 70 ? 'Overbought ⚠' : 'Neutral') : '—',
      positive: ti ? (ti.rsi < 30 ? true : ti.rsi > 70 ? false : undefined) : undefined,
      color: '#10B981',
    },
    {
      icon: TrendingUp,
      label: 'MACD',
      value: ti ? `${ti.macd > 0 ? '+' : ''}${ti.macd.toFixed(2)}` : '—',
      sub: ti ? (ti.macd > 0 ? 'Bullish crossover' : 'Bearish crossover') : '—',
      positive: ti ? ti.macd > 0 : undefined,
      color: '#EF4444',
    },
    {
      icon: Target,
      label: 'Sentiment',
      value: sentiment ? `${(sentiment.score * 100).toFixed(0)}%` : '—',
      sub: sentiment?.overall ?? '—',
      positive: sentiment ? (sentiment.overall === 'bullish' ? true : sentiment.overall === 'bearish' ? false : undefined) : undefined,
      color: '#A855F7',
    },
  ];

  const stockTicker = [
    { symbol: 'AAPL', headline: 'Apple hits 52-week high on strong iPhone demand' },
    { symbol: 'TSLA', headline: 'Tesla battery breakthrough sparks rally' },
    { symbol: 'NVDA', headline: 'NVIDIA AI chip demand surges past estimates' },
    { symbol: 'MSFT', headline: 'Microsoft Azure cloud revenue beats consensus' },
    { symbol: 'GOOGL', headline: 'Google invests $2B in quantum computing' },
    { symbol: 'AMZN', headline: 'Amazon logistics expansion drives Q2 growth' },
    { symbol: 'META', headline: 'Meta Reality Labs losses narrow year-over-year' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20 pb-12 overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-10 -left-40 w-[600px] h-[600px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-purple-400/15 dark:bg-purple-600/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-blue-300/10 dark:bg-indigo-500/5 blur-[150px]" />
      </div>

      {/* Inject ticker animation */}
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0%)} 100%{transform:translateX(-50%)} }
        .animate-marquee { display:flex; white-space:nowrap; animation: marquee 35s linear infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
      `}</style>

      {/* Live ticker bar */}
      <div className="w-full bg-blue-50/80 dark:bg-slate-900/80 border-b border-blue-100 dark:border-slate-800/60 py-2 overflow-hidden mb-0 backdrop-blur-md z-10 relative">
        <div className="animate-marquee" style={{ minWidth: '200%' }}>
          {[...stockTicker, ...stockTicker].map((item, i) => (
            <div key={i} className="flex items-center gap-2 mr-10 min-w-max">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 pulse-dot" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{item.symbol}</span>
              <span className="text-xs text-gray-600 dark:text-slate-400">{item.headline}</span>
              <span className="text-gray-300 dark:text-slate-700 mx-2">|</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                AI Forecast Dashboard
              </span>
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-2">
              {dataSource === 'finnhub-realtime' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
                  LIVE
                </span>
              ) : dataSource === 'yfinance-delayed' ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  15-MIN DELAYED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 pulse-dot" />
                  Connecting...
                </span>
              )}
              <span className="text-gray-400 dark:text-slate-500">·</span>
              AI-powered predictions
              {lastUpdated && (
                <>
                  <span className="text-gray-400 dark:text-slate-500">·</span>
                  <span className="text-xs text-gray-400 dark:text-slate-500">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Stock search */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-64">
              <StockSearch onSearch={handleStockSearch} popularStocks={popularStocks} loading={loading} />
            </div>
            <button
              onClick={() => fetchStockData()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:border-blue-400 dark:hover:border-blue-500/50 transition-all shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* ── 6 KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>

        {/* ── Main Content: Chart + Sidebar ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-6">

          {/* ── Chart Panel ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-3xl p-6 shadow-xl"
          >
            {/* Chart header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {currentStockData ? (
                    <>
                      <span>{currentStockData.name}</span>
                      <span className="text-sm font-normal text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{currentStockData.symbol}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-slate-400">Select a stock to begin</span>
                  )}
                  {currentStockData && (
                    <span className={`flex items-center gap-1 text-sm font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {isUp ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{currentStockData?.sector} · {currentStockData?.industry}</p>
              </div>

              {/* Chart tabs */}
              <div className="flex gap-2 flex-wrap">
                <TabBtn active={activeTab === 'candlestick'} onClick={() => setActiveTab('candlestick')} icon={CandlestickChart} label="Candles" />
                <TabBtn active={activeTab === 'price'}       onClick={() => setActiveTab('price')}       icon={LineChartIcon}    label="Price" />
                <TabBtn active={activeTab === 'volume'}      onClick={() => setActiveTab('volume')}      icon={BarChart2}        label="Volume" />
                <TabBtn active={activeTab === 'forecast'}    onClick={() => setActiveTab('forecast')}    icon={Radar}            label="Forecast" />
              </div>
            </div>

            {/* ── Chart Body ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="h-[380px]"
              >
                {/* CANDLESTICK TAB */}
                {activeTab === 'candlestick' && (
                  candleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={candleData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(candleData.length / 8)} />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={60} />
                        <Tooltip content={<CandleTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                        {/* Wick (high-low) */}
                        <Bar dataKey="high" fill="transparent" shape={<CandleWickShape />} legendType="none" />
                        {/* Body (open-close) */}
                        <Bar dataKey="close" shape={<CandleBodyShape />} legendType="none">
                          {candleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isUp ? '#10B981' : '#EF4444'} />
                          ))}
                        </Bar>
                        {/* Reference lines for key levels */}
                        {ti && <ReferenceLine y={ti.sma20} stroke="#3B82F6" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'SMA20', fill: '#3B82F6', fontSize: 10 }} />}
                        {ti && <ReferenceLine y={ti.sma50} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'SMA50', fill: '#F59E0B', fontSize: 10 }} />}
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                      <div className="text-center">
                        <CandlestickChart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Search for a stock to load candlestick data</p>
                      </div>
                    </div>
                  )
                )}

                {/* PRICE HISTORY TAB */}
                {activeTab === 'price' && (
                  priceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                        <defs>
                          <linearGradient id="gradClose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.07} />
                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(priceData.length / 8)} />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={60} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(255,255,255,0.97)', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#1e293b' }}
                          labelStyle={{ color: '#475569' }}
                          itemStyle={{ color: '#1e293b' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#94a3b8' }} />
                        {/* Bollinger Bands */}
                        <Area type="monotone" dataKey="bUp"  name="BB Upper" stroke="#8B5CF6" strokeWidth={1} strokeDasharray="3 3" fill="url(#gradBand)" dot={false} opacity={0.7} />
                        <Area type="monotone" dataKey="bLow" name="BB Lower" stroke="#8B5CF6" strokeWidth={1} strokeDasharray="3 3" fill="transparent" dot={false} opacity={0.7} />
                        {/* SMA lines */}
                        <Area type="monotone" dataKey="sma20" name="SMA 20" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="5 3" fill="transparent" dot={false} />
                        <Area type="monotone" dataKey="sma50" name="SMA 50" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="5 3" fill="transparent" dot={false} />
                        {/* Price */}
                        <Area type="monotone" dataKey="close" name="Price" stroke="#60A5FA" strokeWidth={2.5} fill="url(#gradClose)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                      <div className="text-center">
                        <LineChartIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No price history available</p>
                      </div>
                    </div>
                  )
                )}

                {/* VOLUME TAB */}
                {activeTab === 'volume' && (
                  volumeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(volumeData.length / 8)} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} width={55} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(255,255,255,0.97)', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#1e293b' }}
                          labelStyle={{ color: '#475569' }}
                          formatter={(v: any) => [`${(Number(v) / 1e6).toFixed(2)}M shares`, 'Volume']}
                        />
                        {currentStockData?.avgVolume && (
                          <ReferenceLine y={currentStockData.avgVolume} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'Avg Vol', fill: '#64748b', fontSize: 10 }} />
                        )}
                        <Bar dataKey="volume" radius={[3, 3, 0, 0]} maxBarSize={20}>
                          {volumeData.map((entry, index) => (
                            <Cell
                              key={`vol-${index}`}
                              fill={entry.isUp ? '#10B98155' : '#EF444455'}
                              stroke={entry.isUp ? '#10B981' : '#EF4444'}
                              strokeWidth={1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                      <div className="text-center">
                        <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No volume data available</p>
                      </div>
                    </div>
                  )
                )}

                {/* FORECAST TAB */}
                {activeTab === 'forecast' && (
                  fullForecastData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={fullForecastData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                        <defs>
                          <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(fullForecastData.length / 8)} />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={60} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(255,255,255,0.97)', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#1e293b' }}
                          labelStyle={{ color: '#475569' }}
                          itemStyle={{ color: '#1e293b' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#64748b' }} />
                        {/* Separator at start of forecast */}
                        <ReferenceLine x={fullForecastData[19]?.date} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: 'Forecast →', fill: '#64748b', fontSize: 10 }} />
                        <Area type="monotone" dataKey="Historical" name="Historical" stroke="#60A5FA" strokeWidth={2.5} fill="url(#gradHist)" dot={false} />
                        {selectedModels.map((model) => (
                          <Line
                            key={model}
                            type="monotone"
                            dataKey={model}
                            stroke={MODEL_CONFIG[model].color}
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={false}
                            connectNulls
                            filter={`drop-shadow(0 0 3px ${MODEL_CONFIG[model].color}88)`}
                          />
                        ))}
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-slate-500">
                      <Brain className="h-14 w-14 opacity-20" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-500 dark:text-slate-400 mb-1">No forecast generated yet</p>
                        <p className="text-sm">Select models and click <strong className="text-blue-600 dark:text-blue-400">Generate Forecast</strong></p>
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ── Right Sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* Model Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-3xl p-5 shadow-xl"
            >
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" /> AI Models
              </h3>
              <div className="space-y-3 mb-5">
                {(Object.keys(MODEL_CONFIG) as ModelKey[]).map((model) => {
                  const cfg = MODEL_CONFIG[model];
                  const active = selectedModels.includes(model);
                  const targetModel = models.find((m) => m.type.toLowerCase() === model.toLowerCase());
                  const accuracy = targetModel?.metrics.accuracy || 0;
                  return (
                    <button
                      key={model}
                      onClick={() => handleModelToggle(model)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 ${
                        active
                          ? 'border-opacity-50 bg-opacity-10'
                          : 'border-gray-200 dark:border-slate-800 bg-transparent opacity-50'
                      }`}
                      style={active ? { borderColor: `${cfg.color}50`, background: `${cfg.color}10` } : {}}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cfg.color, boxShadow: active ? `0 0 6px ${cfg.color}` : 'none' }} />
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{cfg.label}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500">{cfg.description}</p>
                      </div>
                      {active && (
                        <div className="relative">
                          <CircularMeter value={accuracy} color={cfg.color} size={38} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[9px] font-bold" style={{ color: cfg.color }}>{accuracy.toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Horizon selector */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Forecast Horizon</label>
                <div className="grid grid-cols-4 gap-1">
                  {[7, 30, 90, 180].map((d) => (
                    <button
                      key={d}
                      onClick={() => setForecastHorizon(d)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        forecastHorizon === d
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {d < 30 ? `${d}D` : d < 365 ? `${d/30 < 2 ? '1M' : d === 90 ? '3M' : '6M'}` : '1Y'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={() => { generateForecasts(); setActiveTab('forecast'); }}
                disabled={isGenerating || !currentStockData}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40"
                style={{
                  background: isGenerating ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                  boxShadow: isGenerating ? 'none' : '0 8px 24px -4px rgba(59,130,246,0.4)',
                  color: 'white',
                }}
              >
                {isGenerating ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Generating…</>
                ) : (
                  <><Zap className="h-4 w-4" /> Generate Forecast</>
                )}
              </button>
            </motion.div>

            {/* Sentiment Panel */}
            {sentiment && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-xl"
              >
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Signal className="h-4 w-4 text-emerald-400" /> Market Sentiment
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-2xl font-extrabold capitalize ${sentiment.overall === 'bullish' ? 'text-emerald-600 dark:text-emerald-400' : sentiment.overall === 'bearish' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-yellow-400'}`}>
                      {sentiment.overall}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Overall signal</p>
                  </div>
                  <RSIGauge value={ti?.rsi ?? 50} />
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'News Sentiment',   value: sentiment.newsSentiment,   max: 1, color: '#2563EB' },
                    { label: 'Social Sentiment', value: sentiment.socialSentiment,  max: 1, color: '#7C3AED' },
                    { label: 'Analyst Rating',   value: (sentiment.analystRating - 1) / 4, max: 1, color: '#059669' },
                  ].map(({ label, value, color }) => {
                    const pct = Math.max(0, Math.min(1, (value + 1) / 2)) * 100;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 dark:text-slate-400">{label}</span>
                          <span className="font-semibold" style={{ color }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="h-full rounded-full"
                            style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Bottom Row: Technical Indicators + 52W Range + Bollinger ── */}
        {ti && currentStockData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Moving Averages */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-3xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Moving Averages
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'SMA 20', value: ti.sma20, color: '#2563EB' },
                  { label: 'SMA 50', value: ti.sma50, color: '#D97706' },
                  { label: 'SMA 200', value: ti.sma200, color: '#DC2626' },
                ].map(({ label, value, color }) => {
                  const above = price > value;
                  return (
                    <div key={label} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-sm text-slate-300 font-semibold">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">${value.toFixed(2)}</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${above ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                          {above ? '▲ Above' : '▼ Below'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 52-Week Range */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-3xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Price Levels
              </h3>
              {(() => {
                const lo = currentStockData.low52w;
                const hi = currentStockData.high52w;
                const pct = ((price - lo) / (hi - lo)) * 100;
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-2">
                        <span>52W Low: <strong className="text-red-600 dark:text-red-400">${lo.toFixed(2)}</strong></span>
                        <span>52W High: <strong className="text-emerald-600 dark:text-emerald-400">${hi.toFixed(2)}</strong></span>
                      </div>
                      <div className="relative h-3 bg-gray-200 dark:bg-slate-800 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#EF4444,#F59E0B,#10B981)' }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white bg-blue-500 shadow-lg"
                          style={{ left: `calc(${pct}% - 6px)` }}
                        />
                      </div>
                      <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-2">Current: <strong className="text-blue-600 dark:text-blue-400">${price.toFixed(2)}</strong> ({pct.toFixed(1)}% from low)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
                        <p className="text-xs text-gray-500 dark:text-slate-400">BB Upper</p>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">${ti.bollingerUpper.toFixed(2)}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
                        <p className="text-xs text-gray-500 dark:text-slate-400">BB Lower</p>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">${ti.bollingerLower.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Model Consensus */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 rounded-3xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> AI Consensus
              </h3>
              {forecastData.length > 0 ? (
                <div className="space-y-3">
                  {selectedModels.map((model) => {
                    const lastForecast = forecastData[forecastData.length - 1]?.[model];
                    if (!lastForecast) return null;
                    const delta = lastForecast - price;
                    const pct = (delta / price) * 100;
                    const cfg = MODEL_CONFIG[model];
                    return (
                      <div key={model} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                          <span className="text-sm text-gray-700 dark:text-slate-300 font-semibold">{cfg.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">${lastForecast.toFixed(2)}</p>
                          <p className={`text-xs font-semibold ${pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-slate-600">
                  <Brain className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">Generate forecast to see AI consensus</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;