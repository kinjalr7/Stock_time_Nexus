import React, { useState } from 'react';
import ModelComparator from './ModelComparator';

const ModelComparatorDemo: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('LSTM Neural Network');

  // Sample model data for demonstration
  const sampleModels = [
    {
      name: 'LSTM Neural Network',
      type: 'LSTM',
      accuracy: 94.2,
      mae: 0.023,
      rmse: 0.031,
      mape: 2.1,
      r2Score: 0.892,
      predictions: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 150 + (Math.random() - 0.5) * 10,
        confidence: 0.7 + Math.random() * 0.3
      }))
    },
    {
      name: 'Prophet Forecasting',
      type: 'Prophet',
      accuracy: 91.8,
      mae: 0.031,
      rmse: 0.038,
      mape: 2.8,
      r2Score: 0.845,
      predictions: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 150 + (Math.random() - 0.5) * 10,
        confidence: 0.7 + Math.random() * 0.3
      }))
    },
    {
      name: 'ARIMA Model',
      type: 'ARIMA',
      accuracy: 88.5,
      mae: 0.038,
      rmse: 0.045,
      mape: 3.2,
      r2Score: 0.798,
      predictions: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 150 + (Math.random() - 0.5) * 10,
        confidence: 0.7 + Math.random() * 0.3
      }))
    },
    {
      name: 'Random Forest',
      type: 'RandomForest',
      accuracy: 89.7,
      mae: 0.035,
      rmse: 0.042,
      mape: 2.9,
      r2Score: 0.823,
      predictions: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 150 + (Math.random() - 0.5) * 10,
        confidence: 0.7 + Math.random() * 0.3
      }))
    },
    {
      name: 'XGBoost Ensemble',
      type: 'XGBoost',
      accuracy: 92.1,
      mae: 0.029,
      rmse: 0.036,
      mape: 2.4,
      r2Score: 0.867,
      predictions: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 150 + (Math.random() - 0.5) * 10,
        confidence: 0.7 + Math.random() * 0.3
      }))
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Model Performance Comparator Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive demonstration of the ModelComparator component with comprehensive error metrics visualization.
          </p>
        </div>

        {/* ModelComparator Component */}
        <ModelComparator
          models={sampleModels}
          selectedStock="AAPL"
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
        />

        {/* Usage Instructions */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚀 How to Use ModelComparator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• <strong>Multiple View Modes:</strong> Bar chart, radar chart, and comparison views</li>
                <li>• <strong>Metric Selection:</strong> Toggle between Accuracy, MAE, RMSE, MAPE, and R² Score</li>
                <li>• <strong>Interactive Rankings:</strong> Click on models to select and compare</li>
                <li>• <strong>Performance Insights:</strong> Automated analysis and recommendations</li>
                <li>• <strong>Detailed Metrics Table:</strong> Comprehensive performance comparison</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Error Metrics Explained</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• <strong>MAE:</strong> Mean Absolute Error - Average prediction error</li>
                <li>• <strong>RMSE:</strong> Root Mean Squared Error - Penalizes larger errors more</li>
                <li>• <strong>MAPE:</strong> Mean Absolute Percentage Error - Error as percentage</li>
                <li>• <strong>R² Score:</strong> Coefficient of determination - Model fit quality</li>
                <li>• <strong>Accuracy:</strong> Overall prediction accuracy percentage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelComparatorDemo; 