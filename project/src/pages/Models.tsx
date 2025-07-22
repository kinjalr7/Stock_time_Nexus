import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Zap,
  Play,
  Settings,
  Download,
  CheckCircle,
  Clock,
  Target,
  Cpu,
  Database,
  Star,
  Search,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Info,
  AlertTriangle
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
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useStockData } from '../hooks/useStockData';

import ModelComparator from '../components/ModelComparator';

const Models: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('30D');
  const [selectedModel, setSelectedModel] = useState('LSTM Neural Network');
  const [isTraining, setIsTraining] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use stock data hook
  const {
    stocks,
    loading,
    selectedStock: hookSelectedStock,
    forecasts,
    popularStocks,
    searchStock,
    getStockBySymbol,
    getForecastBySymbol,
    setSelectedStock: setHookSelectedStock
  } = useStockData();

  // Get current stock data
  const currentStock = getStockBySymbol(selectedStock);
  const currentForecast = getForecastBySymbol(selectedStock);

  // Mock data for models with stock-specific performance
  const generateModelsForStock = (stockSymbol: string) => {
    const basePrice = currentStock?.price || 100;
    const volatility = currentStock?.technicalIndicators?.rsi ? (currentStock.technicalIndicators.rsi / 100) * 0.3 : 0.2;
    
    return [
      {
        name: 'LSTM Neural Network',
        type: 'LSTM',
        status: 'trained',
        accuracy: 94.2 + (Math.random() - 0.5) * 5,
        rmse: 0.023 + Math.random() * 0.01,
        mae: 0.018 + Math.random() * 0.008,
        mape: 2.1 + Math.random() * 1.5,
        r2Score: 0.892 + (Math.random() - 0.5) * 0.1,
        predictions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: basePrice + (Math.random() - 0.5) * basePrice * volatility,
          confidence: 0.7 + Math.random() * 0.3
        }))
      },
      {
        name: 'Prophet Forecasting',
        type: 'Prophet',
        status: 'trained',
        accuracy: 91.8 + (Math.random() - 0.5) * 5,
        rmse: 0.031 + Math.random() * 0.01,
        mae: 0.025 + Math.random() * 0.008,
        mape: 2.8 + Math.random() * 1.5,
        r2Score: 0.845 + (Math.random() - 0.5) * 0.1,
        predictions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: basePrice + (Math.random() - 0.5) * basePrice * volatility,
          confidence: 0.7 + Math.random() * 0.3
        }))
      },
      {
        name: 'ARIMA Model',
        type: 'ARIMA',
        status: 'trained',
        accuracy: 88.5 + (Math.random() - 0.5) * 5,
        rmse: 0.038 + Math.random() * 0.01,
        mae: 0.032 + Math.random() * 0.008,
        mape: 3.2 + Math.random() * 1.5,
        r2Score: 0.798 + (Math.random() - 0.5) * 0.1,
        predictions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: basePrice + (Math.random() - 0.5) * basePrice * volatility,
          confidence: 0.7 + Math.random() * 0.3
        }))
      },
      {
        name: 'Random Forest',
        type: 'RandomForest',
        status: 'trained',
        accuracy: 89.7 + (Math.random() - 0.5) * 5,
        rmse: 0.035 + Math.random() * 0.01,
        mae: 0.028 + Math.random() * 0.008,
        mape: 2.9 + Math.random() * 1.5,
        r2Score: 0.823 + (Math.random() - 0.5) * 0.1,
        predictions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: basePrice + (Math.random() - 0.5) * basePrice * volatility,
          confidence: 0.7 + Math.random() * 0.3
        }))
      },
      {
        name: 'XGBoost Ensemble',
        type: 'XGBoost',
        status: 'trained',
        accuracy: 92.1 + (Math.random() - 0.5) * 5,
        rmse: 0.029 + Math.random() * 0.01,
        mae: 0.022 + Math.random() * 0.008,
        mape: 2.4 + Math.random() * 1.5,
        r2Score: 0.867 + (Math.random() - 0.5) * 0.1,
        predictions: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          price: basePrice + (Math.random() - 0.5) * basePrice * volatility,
          confidence: 0.7 + Math.random() * 0.3
        }))
      }
    ];
  };

  const [models, setModels] = useState(generateModelsForStock(selectedStock));

  // Update models when stock changes
  useEffect(() => {
    setModels(generateModelsForStock(selectedStock));
  }, [selectedStock, currentStock]);

  const bestModel = models.reduce((best, current) => 
    current.accuracy > best.accuracy ? current : best
  );

  const handleTrainModel = async (modelName: string) => {
    setIsTraining(true);
    setTimeout(() => setIsTraining(false), 3000);
  };

  const handleStockSearch = async (symbol: string) => {
    await searchStock(symbol);
    setSelectedStock(symbol.toUpperCase());
    setHookSelectedStock(symbol.toUpperCase());
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'LSTM': return Brain;
      case 'Prophet': return TrendingUp;
      case 'ARIMA': return BarChart3;
      case 'RandomForest': return Activity;
      case 'XGBoost': return Zap;
      default: return Brain;
    }
  };

  const selectedModelData = models.find(m => m.name === selectedModel);

  // Prepare chart data
  const historicalChartData = currentStock?.historicalData?.slice(-30).map(item => ({
    date: item.date,
    price: item.close,
    volume: item.volume,
    type: 'Historical'
  })) || [];

  const forecastChartData = selectedModelData?.predictions?.map(item => ({
    date: item.date,
    price: item.price,
    confidence: item.confidence,
    type: 'Forecast'
  })) || [];

  const combinedChartData = [
    ...historicalChartData.map(item => ({ ...item, type: 'Historical' })),
    ...forecastChartData.map(item => ({ ...item, type: 'Forecast' }))
  ];

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatCurrency = (num: number) => {
    return `$${num.toFixed(2)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Model Laboratory</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Advanced machine learning models for stock price forecasting and analysis.
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* Stock Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search stock (e.g., AAPL)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      handleStockSearch(searchQuery);
                    }
                  }}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white w-48"
                />
              </div>
              <select
                value={selectedStock}
                onChange={(e) => {
                  setSelectedStock(e.target.value);
                  setHookSelectedStock(e.target.value);
                }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white"
              >
                {popularStocks.map(stock => (
                  <option key={stock} value={stock}>{stock}</option>
                ))}
              </select>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="7D">7 Days</option>
                <option value="30D">30 Days</option>
                <option value="90D">90 Days</option>
                <option value="1Y">1 Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stock Overview Card */}
        {currentStock && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStock.symbol} - {currentStock.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{currentStock.sector} • {currentStock.industry}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(currentStock.price)}
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  currentStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentStock.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {formatCurrency(Math.abs(currentStock.change))} ({currentStock.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
                <div className="font-semibold text-gray-900 dark:text-white">{formatNumber(currentStock.marketCap)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
                <div className="font-semibold text-gray-900 dark:text-white">{formatNumber(currentStock.volume)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</div>
                <div className="font-semibold text-gray-900 dark:text-white">{currentStock.pe.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Beta</div>
                <div className="font-semibold text-gray-900 dark:text-white">{currentStock.beta.toFixed(2)}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stock Price Chart */}
        {currentStock && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                📈 {selectedStock} Price Chart & Model Predictions
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Historical</span>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Forecast</span>
                <div className="w-4 h-4 bg-green-500 rounded"></div>
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine 
                    x={historicalChartData[historicalChartData.length - 1]?.date} 
                    stroke="#EF4444" 
                    strokeDasharray="3 3"
                    label="Today"
                  />
                  
                  {/* Historical Data */}
                  <Line
                    type="monotone"
                    dataKey="price"
                    data={historicalChartData}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    name="Historical Price"
                  />
                  
                  {/* Forecast Data */}
                  <Line
                    type="monotone"
                    dataKey="price"
                    data={forecastChartData}
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Forecast Price"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Best Model Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">🏆 Best Performing Model for {selectedStock}</h3>
              <p className="text-blue-100">
                {bestModel.name} is currently delivering the highest accuracy at {bestModel.accuracy.toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{bestModel.accuracy.toFixed(1)}%</div>
              <div className="text-blue-200">Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Model Selection Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {models.map((model, index) => {
            const ModelIcon = getModelIcon(model.type);
            
            return (
              <motion.div
                key={model.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedModel === model.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
                onClick={() => setSelectedModel(model.name)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedModel === model.name
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : 'bg-gray-100 dark:bg-slate-700'
                  }`}>
                    <ModelIcon className={`h-6 w-6 ${
                      selectedModel === model.name
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{model.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{model.type} Model</p>
                
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{model.accuracy.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{model.rmse.toFixed(3)}</div>
                    <div className="text-xs text-gray-500">RMSE</div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrainModel(model.name);
                  }}
                  disabled={isTraining}
                  className="w-full py-2 px-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTraining ? 'Training...' : 'Retrain'}
                </button>

                {selectedModel === model.name && (
                  <motion.div
                    layoutId="model-selector"
                    className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Model Performance Comparator */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📊 Model Performance Comparator
          </h3>
          <ModelComparator
            models={models}
            selectedStock={selectedStock}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
        </div>

        {/* Model Details Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Selected Model</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedModelData?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedModelData?.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">Trained</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">R² Score</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedModelData?.r2Score.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Model Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Controls</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleTrainModel(selectedModel)}
                  disabled={isTraining}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isTraining ? 'Training...' : 'Retrain Model'}
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Parameters
                </button>
                
                <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export Model
                </button>
              </div>
            </div>

            {/* System Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Resources</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">GPU Usage</span>
                    <span className="font-medium text-gray-900 dark:text-white">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Memory</span>
                    <span className="font-medium text-gray-900 dark:text-white">12.4 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Training Queue</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">2 jobs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Models