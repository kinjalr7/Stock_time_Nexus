import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  BarChart3, 
  Activity,
  Zap,
  Calendar,
  Filter,
  Play,
  Pause,
  Settings,
  Download,
  Share2,
  Eye,
  EyeOff,
  Target,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Layers,
  Grid,
  BarChart,
  LineChart,
  PieChart,
  Scatter,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
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
  ScatterChart,
  Scatter as RechartsScatter,
  ReferenceLine,
  Legend,
  Brush
} from 'recharts';
import { useStockData } from '../hooks/useStockData';
import { useMLModels } from '../hooks/useMLModels';
import StockSearch from './StockSearch';

interface ForecastConfig {
  stockSymbol: string;
  historicalRange: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';
  forecastHorizon: '7D' | '14D' | '30D' | '60D' | '90D' | '180D';
  selectedModels: string[];
  confidenceInterval: number;
  showHistorical: boolean;
  showForecast: boolean;
  showConfidence: boolean;
  chartType: 'line' | 'area' | 'candlestick' | 'scatter';
  autoRefresh: boolean;
}

interface ModelPrediction {
  date: string;
  price: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  model: string;
}

const InteractiveForecastDashboard: React.FC = () => {
  const [config, setConfig] = useState<ForecastConfig>({
    stockSymbol: 'AAPL',
    historicalRange: '6M',
    forecastHorizon: '30D',
    selectedModels: ['LSTM', 'Prophet', 'ARIMA'],
    confidenceInterval: 0.95,
    showHistorical: true,
    showForecast: true,
    showConfidence: true,
    chartType: 'line',
    autoRefresh: false
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [predictions, setPredictions] = useState<ModelPrediction[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [modelPerformance, setModelPerformance] = useState<any[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'forecast' | 'comparison' | 'analysis'>('forecast');

  const { stocks, loading, searchStock, getStockBySymbol } = useStockData();
  const { models, compareModels, getModelRecommendation } = useMLModels();

  const currentStock = getStockBySymbol(config.stockSymbol);

  // Generate enhanced predictions with multiple models
  const generatePredictions = useMemo(() => {
    if (!currentStock) return [];

    const basePrice = currentStock.price;
    const volatility = currentStock.technicalIndicators?.rsi ? (currentStock.technicalIndicators.rsi / 100) * 0.3 : 0.2;
    const forecastDays = parseInt(config.forecastHorizon.replace('D', ''));
    
    const predictions: ModelPrediction[] = [];
    
    // Generate predictions for each selected model
    config.selectedModels.forEach(modelType => {
      for (let i = 0; i < forecastDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        // Model-specific prediction logic
        let price = basePrice;
        let confidence = 0.9;
        
        switch (modelType) {
          case 'LSTM':
            price = basePrice + Math.sin(i * 0.1) * basePrice * 0.05 + (Math.random() - 0.5) * basePrice * volatility;
            confidence = 0.95 - (i * 0.002);
            break;
          case 'Prophet':
            price = basePrice + i * basePrice * 0.001 + Math.sin(i * 0.2) * basePrice * 0.03 + (Math.random() - 0.5) * basePrice * volatility;
            confidence = 0.92 - (i * 0.003);
            break;
          case 'ARIMA':
            price = basePrice + (Math.random() - 0.5) * basePrice * volatility * 1.2;
            confidence = 0.88 - (i * 0.004);
            break;
          case 'RandomForest':
            price = basePrice + Math.cos(i * 0.15) * basePrice * 0.04 + (Math.random() - 0.5) * basePrice * volatility;
            confidence = 0.90 - (i * 0.0025);
            break;
          case 'XGBoost':
            price = basePrice + i * basePrice * 0.0005 + Math.sin(i * 0.25) * basePrice * 0.02 + (Math.random() - 0.5) * basePrice * volatility;
            confidence = 0.93 - (i * 0.002);
            break;
        }
        
        const confidenceRange = (1 - confidence) * basePrice * 0.1;
        
        predictions.push({
          date: date.toISOString().split('T')[0],
          price: Math.max(price, 0),
          confidence,
          upperBound: price + confidenceRange,
          lowerBound: Math.max(price - confidenceRange, 0),
          model: modelType
        });
      }
    });
    
    return predictions;
  }, [currentStock, config]);

  // Generate historical data
  const generateHistoricalData = useMemo(() => {
    if (!currentStock) return [];

    const days = parseInt(config.historicalRange.replace(/[MY]/g, '')) * 
                 (config.historicalRange.includes('Y') ? 365 : 30);
    
    return Array.from({ length: Math.min(days, 365) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      const basePrice = currentStock.price;
      const volatility = currentStock.technicalIndicators?.rsi ? (currentStock.technicalIndicators.rsi / 100) * 0.3 : 0.2;
      const trend = Math.sin(i * 0.02) * basePrice * 0.1;
      const noise = (Math.random() - 0.5) * basePrice * volatility;
      
      return {
        date: date.toISOString().split('T')[0],
        price: Math.max(basePrice + trend + noise, 0),
        volume: Math.floor(Math.random() * 1000000) + 100000,
        high: Math.max(basePrice + trend + noise + basePrice * 0.02, 0),
        low: Math.max(basePrice + trend + noise - basePrice * 0.02, 0),
        open: Math.max(basePrice + trend + noise - basePrice * 0.01, 0),
        close: Math.max(basePrice + trend + noise, 0)
      };
    });
  }, [currentStock, config.historicalRange]);

  // Generate model performance metrics
  const generateModelPerformance = useMemo(() => {
    return config.selectedModels.map(modelType => {
      const model = models.find(m => m.type === modelType);
      const baseAccuracy = model?.metrics.accuracy || 85;
      const baseRMSE = model?.metrics.rmse || 0.05;
      
      return {
        model: modelType,
        accuracy: baseAccuracy + (Math.random() - 0.5) * 5,
        rmse: baseRMSE + Math.random() * 0.02,
        mae: baseRMSE * 0.8 + Math.random() * 0.01,
        mape: 2 + Math.random() * 2,
        r2Score: 0.8 + Math.random() * 0.15,
        confidence: 0.85 + Math.random() * 0.1,
        lastUpdated: new Date().toISOString()
      };
    });
  }, [config.selectedModels, models]);

  useEffect(() => {
    setPredictions(generatePredictions);
    setHistoricalData(generateHistoricalData);
    setModelPerformance(generateModelPerformance);
  }, [generatePredictions, generateHistoricalData, generateModelPerformance]);

  const handleStockSearch = async (symbol: string) => {
    await searchStock(symbol);
    setConfig(prev => ({ ...prev, stockSymbol: symbol.toUpperCase() }));
  };

  const handleGenerateForecast = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handleModelToggle = (model: string) => {
    setConfig(prev => ({
      ...prev,
      selectedModels: prev.selectedModels.includes(model)
        ? prev.selectedModels.filter(m => m !== model)
        : [...prev.selectedModels, model]
    }));
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-slate-600">
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getModelColor = (model: string) => {
    const colors = {
      'LSTM': '#3B82F6',
      'Prophet': '#10B981',
      'ARIMA': '#F59E0B',
      'RandomForest': '#8B5CF6',
      'XGBoost': '#EF4444'
    };
    return colors[model as keyof typeof colors] || '#6B7280';
  };

  const getModelIcon = (model: string) => {
    const icons = {
      'LSTM': Brain,
      'Prophet': TrendingUp,
      'ARIMA': BarChart3,
      'RandomForest': Activity,
      'XGBoost': Zap
    };
    return icons[model as keyof typeof icons] || Brain;
  };

  const chartData = [
    ...historicalData.map(item => ({
      ...item,
      type: 'Historical',
      model: 'Historical'
    })),
    ...predictions.map(item => ({
      ...item,
      type: 'Forecast',
      model: item.model
    }))
  ];

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Interactive Forecast Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Advanced ML-powered stock forecasting with multiple models
        </p>
        
        {/* Placeholder for the full implementation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Interactive forecast dashboard implementation will be added here...
          </p>
        </div>
      </div>
    </div>
  );
};

export default InteractiveForecastDashboard; 