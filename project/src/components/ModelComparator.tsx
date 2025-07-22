import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Activity,
  Brain,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface Model {
  name: string;
  type: string;
  accuracy: number;
  mae: number;
  rmse: number;
  mape: number;
  r2Score: number;
  predictions: Array<{
    date: string;
    price: number;
    confidence: number;
  }>;
}

interface ModelComparatorProps {
  models: Model[];
  selectedStock: string;
  selectedModel: string;
  onModelSelect: (modelName: string) => void;
}

const ModelComparator: React.FC<ModelComparatorProps> = ({
  models,
  selectedStock,
  selectedModel,
  onModelSelect
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'mae' | 'rmse' | 'mape' | 'r2Score'>('accuracy');
  const [viewMode, setViewMode] = useState<'bar' | 'radar' | 'comparison'>('bar');

  // Calculate rankings for each metric
  const rankings = useMemo(() => {
    const sortedModels = [...models].sort((a, b) => {
      switch (selectedMetric) {
        case 'accuracy':
        case 'r2Score':
          return b[selectedMetric] - a[selectedMetric];
        case 'mae':
        case 'rmse':
        case 'mape':
          return a[selectedMetric] - b[selectedMetric];
        default:
          return 0;
      }
    });

    return sortedModels.map((model, index) => ({
      ...model,
      rank: index + 1,
      isBest: index === 0
    }));
  }, [models, selectedMetric]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return models.map(model => ({
      name: model.name,
      accuracy: model.accuracy,
      mae: model.mae,
      rmse: model.rmse,
      mape: model.mape,
      r2Score: model.r2Score,
      // Normalize metrics for radar chart (0-100 scale)
      accuracyNorm: model.accuracy,
      maeNorm: Math.max(0, 100 - (model.mae * 1000)), // Lower MAE is better
      rmseNorm: Math.max(0, 100 - (model.rmse * 1000)), // Lower RMSE is better
      mapeNorm: Math.max(0, 100 - model.mape * 10), // Lower MAPE is better
      r2ScoreNorm: model.r2Score * 100
    }));
  }, [models]);

  // Radar chart data
  const radarData = useMemo(() => {
    return [
      { metric: 'Accuracy', ...chartData.reduce((acc, model) => ({ ...acc, [model.name]: model.accuracyNorm }), {}) },
      { metric: 'MAE (Inverse)', ...chartData.reduce((acc, model) => ({ ...acc, [model.name]: model.maeNorm }), {}) },
      { metric: 'RMSE (Inverse)', ...chartData.reduce((acc, model) => ({ ...acc, [model.name]: model.rmseNorm }), {}) },
      { metric: 'MAPE (Inverse)', ...chartData.reduce((acc, model) => ({ ...acc, [model.name]: model.mapeNorm }), {}) },
      { metric: 'R² Score', ...chartData.reduce((acc, model) => ({ ...acc, [model.name]: model.r2ScoreNorm }), {}) }
    ];
  }, [chartData]);

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

  const getMetricInfo = (metric: string) => {
    switch (metric) {
      case 'accuracy':
        return {
          name: 'Accuracy',
          description: 'Percentage of correct predictions',
          unit: '%',
          better: 'higher',
          color: 'text-green-600'
        };
      case 'mae':
        return {
          name: 'MAE',
          description: 'Mean Absolute Error - Average absolute difference between predicted and actual values',
          unit: '',
          better: 'lower',
          color: 'text-red-600'
        };
      case 'rmse':
        return {
          name: 'RMSE',
          description: 'Root Mean Squared Error - Square root of average squared differences',
          unit: '',
          better: 'lower',
          color: 'text-orange-600'
        };
      case 'mape':
        return {
          name: 'MAPE',
          description: 'Mean Absolute Percentage Error - Average percentage error',
          unit: '%',
          better: 'lower',
          color: 'text-purple-600'
        };
      case 'r2Score':
        return {
          name: 'R² Score',
          description: 'Coefficient of determination - How well the model explains variance',
          unit: '',
          better: 'higher',
          color: 'text-blue-600'
        };
      default:
        return { name: '', description: '', unit: '', better: '', color: '' };
    }
  };

  const metricInfo = getMetricInfo(selectedMetric);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(3)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'accuracy':
      case 'mape':
        return `${value.toFixed(1)}%`;
      case 'mae':
      case 'rmse':
        return value.toFixed(3);
      case 'r2Score':
        return value.toFixed(3);
      default:
        return value.toFixed(2);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            📊 Model Performance Comparator
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Detailed error metrics and performance analysis for {selectedStock}
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('bar')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'bar'
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode('radar')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'radar'
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Radar Chart
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'comparison'
                ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Comparison
          </button>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Select Metric</h4>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Info className="h-4 w-4" />
            <span>Better: {metricInfo.better}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {(['accuracy', 'mae', 'rmse', 'mape', 'r2Score'] as const).map((metric) => {
            const info = getMetricInfo(metric);
            return (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMetric === metric
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className={`font-semibold ${info.color}`}>{info.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{info.unit}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="mb-8">
        <div className="h-96">
          {viewMode === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatValue(value, selectedMetric)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={selectedMetric} 
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.name === selectedModel ? '#10B981' : '#3B82F6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'radar' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                {models.map((model, index) => (
                  <Radar
                    key={model.name}
                    name={model.name}
                    dataKey={model.name}
                    stroke={model.name === selectedModel ? '#10B981' : '#3B82F6'}
                    fill={model.name === selectedModel ? '#10B981' : '#3B82F6'}
                    fillOpacity={0.3}
                    strokeWidth={model.name === selectedModel ? 3 : 2}
                  />
                ))}
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'comparison' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {(['accuracy', 'mae', 'rmse', 'mape', 'r2Score'] as const).map((metric) => {
                const info = getMetricInfo(metric);
                const sortedData = [...chartData].sort((a, b) => {
                  if (metric === 'accuracy' || metric === 'r2Score') {
                    return b[metric] - a[metric];
                  }
                  return a[metric] - b[metric];
                });
                
                return (
                  <div key={metric} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <h5 className={`font-semibold ${info.color} mb-3`}>{info.name}</h5>
                    <div className="space-y-2">
                      {sortedData.slice(0, 3).map((model, index) => (
                        <div key={model.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              'bg-orange-500 text-white'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {model.name}
                            </span>
                          </div>
                          <span className={`text-sm font-semibold ${info.color}`}>
                            {formatValue(model[metric], metric)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Performance Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* MAE Rankings */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-red-800 dark:text-red-200">MAE Rankings</h4>
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">MAE</span>
            </div>
          </div>
          <div className="space-y-2">
            {models
              .sort((a, b) => a.mae - b.mae)
              .slice(0, 3)
              .map((model, index) => (
                <div key={model.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {model.mae.toFixed(3)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* RMSE Rankings */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200">RMSE Rankings</h4>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">RMSE</span>
            </div>
          </div>
          <div className="space-y-2">
            {models
              .sort((a, b) => a.rmse - b.rmse)
              .slice(0, 3)
              .map((model, index) => (
                <div key={model.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {model.rmse.toFixed(3)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* MAPE Rankings */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200">MAPE Rankings</h4>
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">MAPE</span>
            </div>
          </div>
          <div className="space-y-2">
            {models
              .sort((a, b) => a.mape - b.mape)
              .slice(0, 3)
              .map((model, index) => (
                <div key={model.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    {model.mape.toFixed(2)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Model</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Accuracy</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">MAE</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">RMSE</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">MAPE</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">R² Score</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Performance</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((model, index) => {
              const isBest = index === 0;
              const getPerformanceColor = (accuracy: number) => {
                if (accuracy >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
                if (accuracy >= 80) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
                if (accuracy >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
                return 'text-red-600 bg-red-100 dark:bg-red-900/30';
              };
              
              return (
                <tr 
                  key={model.name} 
                  className={`border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${
                    isBest ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  } ${model.name === selectedModel ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => onModelSelect(model.name)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      {isBest && <Award className="h-5 w-5 text-yellow-500" />}
                      <span className="font-medium text-gray-900 dark:text-white">{model.name}</span>
                      {isBest && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">Best</span>}
                      {model.name === selectedModel && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-semibold text-gray-900 dark:text-white">{model.accuracy.toFixed(1)}%</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-red-600 dark:text-red-400 font-medium">{model.mae.toFixed(3)}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">{model.rmse.toFixed(3)}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-purple-600 dark:text-purple-400 font-medium">{model.mape.toFixed(2)}%</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-gray-900 dark:text-white font-medium">{model.r2Score.toFixed(3)}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPerformanceColor(model.accuracy)}`}>
                      {model.accuracy >= 90 ? 'Excellent' :
                       model.accuracy >= 80 ? 'Good' :
                       model.accuracy >= 70 ? 'Fair' : 'Poor'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Performance Insights for {selectedStock}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {rankings[0]?.name} shows the best overall performance with {rankings[0]?.accuracy.toFixed(1)}% accuracy. 
              Lower MAE ({rankings[0]?.mae.toFixed(3)}) and RMSE ({rankings[0]?.rmse.toFixed(3)}) values indicate 
              better prediction accuracy. Consider using this model for {selectedStock} predictions.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Explanations */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(['accuracy', 'mae', 'rmse', 'mape', 'r2Score'] as const).map((metric) => {
          const info = getMetricInfo(metric);
          return (
            <div key={metric} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${info.color.replace('text-', 'bg-')}`}></div>
                <h5 className={`font-semibold ${info.color}`}>{info.name}</h5>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{info.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelComparator; 