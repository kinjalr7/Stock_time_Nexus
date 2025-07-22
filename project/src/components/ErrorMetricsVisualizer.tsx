import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3,
  PieChart,
  Scatter,
  LineChart,
  Download,
  Info,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { ModelComparison, ErrorAnalysis } from '../hooks/useMLModels';

interface ErrorMetricsVisualizerProps {
  comparisons: ModelComparison[];
  selectedModel: string;
  errorAnalysis: ErrorAnalysis;
}

const ErrorMetricsVisualizer: React.FC<ErrorMetricsVisualizerProps> = ({
  comparisons,
  selectedModel,
  errorAnalysis
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'mae' | 'rmse' | 'mape'>('mae');
  const [viewType, setViewType] = useState<'chart' | 'table' | 'distribution'>('chart');

  const metricConfig = {
    mae: { label: 'Mean Absolute Error (MAE)', color: '#F59E0B', description: 'Average absolute difference between predicted and actual values' },
    rmse: { label: 'Root Mean Square Error (RMSE)', color: '#EF4444', description: 'Square root of the average squared differences' },
    mape: { label: 'Mean Absolute Percentage Error (MAPE)', color: '#8B5CF6', description: 'Average percentage difference between predicted and actual values' }
  };

  const sortedComparisons = useMemo(() => {
    return [...comparisons].sort((a, b) => a[selectedMetric] - b[selectedMetric]);
  }, [comparisons, selectedMetric]);

  const errorDistribution = useMemo(() => {
    const bins = Array.from({ length: 8 }, (_, i) => {
      const min = -4 + i;
      const max = -4 + i + 1;
      const count = errorAnalysis.errors.filter(e => e >= min && e < max).length;
      return { 
        range: `${min}% to ${max}%`, 
        count, 
        percentage: (count / errorAnalysis.errors.length) * 100,
        center: (min + max) / 2 
      };
    });
    return bins;
  }, [errorAnalysis.errors]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const getPerformanceLevel = (value: number, metric: string) => {
    const thresholds = {
      mae: { excellent: 0.02, good: 0.04, average: 0.06 },
      rmse: { excellent: 0.03, good: 0.05, average: 0.07 },
      mape: { excellent: 1.5, good: 2.5, average: 3.5 }
    };
    
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (value <= threshold.excellent) return 'excellent';
    if (value <= threshold.good) return 'good';
    if (value <= threshold.average) return 'average';
    return 'poor';
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'average': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'poor': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Metrics Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Comprehensive analysis of prediction errors and model performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Metric Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(metricConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* View Type Toggle */}
        <div className="flex space-x-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
          {[
            { key: 'chart', label: 'Chart', icon: BarChart3 },
            { key: 'table', label: 'Table', icon: PieChart },
            { key: 'distribution', label: 'Distribution', icon: Scatter }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewType(key as any)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === key
                  ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Metric Description */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {metricConfig[selectedMetric].label}
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                {metricConfig[selectedMetric].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Content */}
      {viewType === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Error Metrics Comparison Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {metricConfig[selectedMetric].label} Comparison
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedComparisons}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey={selectedMetric} fill={metricConfig[selectedMetric].color} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Levels */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Levels</h4>
            <div className="space-y-3">
              {sortedComparisons.map((model, index) => {
                const performance = getPerformanceLevel(model[selectedMetric], selectedMetric);
                const PerformanceIcon = performance === 'excellent' || performance === 'good' ? CheckCircle : XCircle;
                
                return (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-600"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{model.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{model.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {model[selectedMetric].toFixed(selectedMetric === 'mape' ? 1 : 3)}
                          {selectedMetric === 'mape' ? '%' : ''}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {metricConfig[selectedMetric].label.split(' ')[0]}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(performance)}`}>
                        <PerformanceIcon className="h-3 w-3 inline mr-1" />
                        {performance}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewType === 'table' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Error Metrics Table</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-600">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Model</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">MAE</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">RMSE</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">MAPE (%)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Bias</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Variance</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Performance</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((model, index) => {
                  const maePerformance = getPerformanceLevel(model.mae, 'mae');
                  const rmsePerformance = getPerformanceLevel(model.rmse, 'rmse');
                  const mapePerformance = getPerformanceLevel(model.mape, 'mape');
                  
                  return (
                    <tr key={model.name} className="border-b border-gray-100 dark:border-slate-700">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{model.name}</td>
                      <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                        {model.mae.toFixed(3)}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                        {model.rmse.toFixed(3)}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                        {model.mape.toFixed(1)}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                        {model.bias.toFixed(3)}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700 dark:text-gray-300">
                        {model.variance.toFixed(3)}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(maePerformance)}`}>
                            MAE: {maePerformance}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(rmsePerformance)}`}>
                            RMSE: {rmsePerformance}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(mapePerformance)}`}>
                            MAPE: {mapePerformance}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewType === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Error Distribution Histogram */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Error Distribution for {selectedModel}</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="range" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" name="Frequency" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error Statistics */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Error Statistics</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {errorAnalysis.meanError.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Mean Error</div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {errorAnalysis.stdError.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Std Deviation</div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {errorAnalysis.skewness.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Skewness</div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {errorAnalysis.kurtosis.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Kurtosis</div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <div className="font-medium text-red-900 dark:text-red-100">
                      {errorAnalysis.outliers} Outliers Detected
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-200">
                      {((errorAnalysis.outliers / errorAnalysis.errors.length) * 100).toFixed(1)}% of predictions
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Error Analysis Summary
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-200">
                      {errorAnalysis.skewness > 0 ? 'Right-skewed' : 'Left-skewed'} distribution with 
                      {errorAnalysis.kurtosis > 0 ? ' heavy' : ' light'} tails
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorMetricsVisualizer; 