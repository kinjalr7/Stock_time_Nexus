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
  Cpu,
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
  X,
  Brain,
  Layers,
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
  ReferenceLine,
  Legend,
} from 'recharts';
import { useStockData } from '../hooks/useStockData';
import StockSearch from '../components/StockSearch';

const modelDetails = {
  ARIMA: { color: '#3B82F6', description: 'Good for stable, linear trends.' },
  Prophet: { color: '#10B981', description: 'Excels at handling seasonality.' },
  LSTM: { color: '#F59E0B', description: 'Captures complex, non-linear patterns.' },
};

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
  } = useStockData();

  const [forecastHorizon, setForecastHorizon] = useState(30);
  const [selectedModels, setSelectedModels] = useState(['ARIMA', 'Prophet', 'LSTM']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>([]);

  const currentStockData = getStockBySymbol(selectedStock);

  const handleModelToggle = (modelName: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelName)
        ? prev.filter((m) => m !== modelName)
        : [...prev, modelName]
    );
  };

  const generateForecasts = () => {
    if (!currentStockData) return;
    setIsGenerating(true);

    const lastHistoricalPoint =
      currentStockData.historicalData[currentStockData.historicalData.length - 1];
    if (!lastHistoricalPoint) {
      setIsGenerating(false);
      return;
    }
    const lastPrice = lastHistoricalPoint.close;
    let newForecastData = [];

    for (let i = 1; i <= forecastHorizon; i++) {
      const futureDate = new Date(lastHistoricalPoint.date);
      futureDate.setDate(futureDate.getDate() + i);
      let point: any = { date: futureDate.toISOString().split('T')[0] };

      if (selectedModels.includes('ARIMA')) {
        point.ARIMA = lastPrice + (Math.random() - 0.45) * i * 0.5;
      }
      if (selectedModels.includes('Prophet')) {
        point.Prophet =
          lastPrice +
          Math.sin(i / (forecastHorizon / 4)) * (i * 0.2) +
          (Math.random() - 0.5) * 5;
      }
      if (selectedModels.includes('LSTM')) {
        point.LSTM = lastPrice + (Math.random() - 0.5) * i * 1.2;
      }
      newForecastData.push(point);
    }

    setTimeout(() => {
      setForecastData(newForecastData);
      setIsGenerating(false);
    }, 1500);
  };

  const handleStockSearch = async (symbol: string) => {
    await searchStock(symbol);
    setForecastData([]);
  };

  const fullChartData = currentStockData
    ? [...currentStockData.historicalData, ...forecastData]
    : [];

  const stockHeadlines = [
    { symbol: 'AAPL', headline: 'Apple hits new 52-week high on strong iPhone sales' },
    { symbol: 'TSLA', headline: 'Tesla announces new battery tech, shares surge' },
    { symbol: 'MSFT', headline: 'Microsoft unveils AI-powered Office features' },
    { symbol: 'GOOGL', headline: 'Google invests $2B in cloud infrastructure' },
    { symbol: 'AMZN', headline: 'Amazon Q2 profits beat expectations' },
    { symbol: 'NVDA', headline: 'NVIDIA stock rallies on AI chip demand' },
    { symbol: 'META', headline: 'Meta launches new VR headset' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8">
      {/* Inject marquee style */}
      <style>{`
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  display: flex;
  white-space: nowrap;
  overflow: hidden;
  animation: marquee 30s linear infinite;
}
`}</style>
      {/* Stock Headlines Ticker */}
      <div className="w-full bg-blue-50 dark:bg-blue-900/30 py-2 px-4 mb-6 rounded-xl overflow-x-hidden whitespace-nowrap border border-blue-100 dark:border-blue-800 relative">
        <div className="animate-marquee" style={{ minWidth: '200%' }}>
          {[...stockHeadlines, ...stockHeadlines].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 min-w-max mr-8">
              <span className="font-bold text-blue-700 dark:text-blue-300">{item.symbol}</span>
              <span className="text-gray-700 dark:text-blue-100 text-sm">{item.headline}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Interactive Forecast Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Compare ML models to predict stock prices.
          </p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Forecasting Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock
                </label>
                <StockSearch
                  onSearch={handleStockSearch}
                  popularStocks={popularStocks}
                  loading={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Forecast Horizon
                </label>
                <select
                  value={forecastHorizon}
                  onChange={(e) => setForecastHorizon(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value={7}>7 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={180}>180 Days</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={generateForecasts}
                  disabled={isGenerating || !currentStockData}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Forecast
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Models
            </h3>
            <div className="space-y-3">
              {Object.entries(modelDetails).map(
                ([name, { color, description }]) => (
                  <div key={name} className="flex items-center">
                    <input
                      type="checkbox"
                      id={name}
                      checked={selectedModels.includes(name)}
                      onChange={() => handleModelToggle(name)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      style={{ accentColor: color }}
                    />
                    <label
                      htmlFor={name}
                      className="ml-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {name}
                    </label>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentStockData
                ? `${currentStockData.name} (${currentStockData.symbol})`
                : 'Select a stock'}
            </h2>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={fullChartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="close"
                  name="Historical"
                  stroke="#8884d8"
                  dot={false}
                  strokeWidth={2}
                />
                {selectedModels.map((model) => (
                  <Line
                    key={model}
                    type="monotone"
                    dataKey={model}
                    stroke={
                      modelDetails[model as keyof typeof modelDetails]?.color
                    }
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;