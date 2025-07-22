import React, { useState } from 'react';
import ModelComparator from '../components/ModelComparator';

const TestPage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('LSTM Neural Network');

  // Sample model data
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
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          ModelComparator Test Page
        </h1>
        
        <ModelComparator
          models={sampleModels}
          selectedStock="AAPL"
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
        />
      </div>
    </div>
  );
};

export default TestPage; 