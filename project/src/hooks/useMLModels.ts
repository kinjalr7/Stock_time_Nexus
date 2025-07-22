import { useState, useEffect } from 'react';

export interface ModelPrediction {
  date: string;
  actual?: number;
  predicted: number;
  confidence: number;
}

export interface ModelMetrics {
  accuracy: number;
  rmse: number;
  mae: number;
  mape: number;
  r2Score: number;
  mse: number;
  bias: number;
  variance: number;
  adjustedR2: number;
  aic: number;
  bic: number;
}

export interface ModelComparison {
  name: string;
  type: string;
  accuracy: number;
  rmse: number;
  mae: number;
  mape: number;
  r2Score: number;
  mse: number;
  bias: number;
  variance: number;
  adjustedR2: number;
  aic: number;
  bic: number;
  rank: number;
  performance: 'excellent' | 'good' | 'average' | 'poor';
  confidence: number;
}

export interface ErrorAnalysis {
  modelName: string;
  errors: number[];
  meanError: number;
  stdError: number;
  skewness: number;
  kurtosis: number;
  outliers: number;
}

export interface MLModel {
  name: string;
  type: 'LSTM' | 'Prophet' | 'ARIMA' | 'RandomForest' | 'XGBoost';
  status: 'training' | 'trained' | 'error';
  metrics: ModelMetrics;
  predictions: ModelPrediction[];
  trainingProgress: number;
  lastTrained: string;
  parameters: Record<string, any>;
}

export const useMLModels = () => {
  const [models, setModels] = useState<MLModel[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('LSTM');

  useEffect(() => {
    initializeModels();
  }, []);

  const initializeModels = () => {
    const initialModels: MLModel[] = [
      {
        name: 'LSTM',
        type: 'LSTM',
        status: 'trained',
        metrics: {
          accuracy: 94.2,
          rmse: 0.032,
          mae: 0.024,
          mape: 1.8,
          r2Score: 0.89,
          mse: 0.001024,
          bias: 0.002,
          variance: 0.0008,
          adjustedR2: 0.885,
          aic: -245.6,
          bic: -238.2
        },
        predictions: generatePredictions('LSTM'),
        trainingProgress: 100,
        lastTrained: new Date(Date.now() - 3600000).toISOString(),
        parameters: {
          epochs: 100,
          batchSize: 32,
          learningRate: 0.001,
          hiddenUnits: 50,
          dropout: 0.2
        }
      },
      {
        name: 'Prophet',
        type: 'Prophet',
        status: 'trained',
        metrics: {
          accuracy: 89.7,
          rmse: 0.045,
          mae: 0.031,
          mape: 2.3,
          r2Score: 0.82,
          mse: 0.002025,
          bias: 0.005,
          variance: 0.0012,
          adjustedR2: 0.815,
          aic: -198.4,
          bic: -191.8
        },
        predictions: generatePredictions('Prophet'),
        trainingProgress: 100,
        lastTrained: new Date(Date.now() - 7200000).toISOString(),
        parameters: {
          seasonalityMode: 'multiplicative',
          changepoints: 25,
          seasonalityPriorScale: 10,
          holidaysPriorScale: 10
        }
      },
      {
        name: 'ARIMA',
        type: 'ARIMA',
        status: 'trained',
        metrics: {
          accuracy: 85.3,
          rmse: 0.052,
          mae: 0.038,
          mape: 2.9,
          r2Score: 0.76,
          mse: 0.002704,
          bias: 0.008,
          variance: 0.0015,
          adjustedR2: 0.755,
          aic: -165.2,
          bic: -158.9
        },
        predictions: generatePredictions('ARIMA'),
        trainingProgress: 100,
        lastTrained: new Date(Date.now() - 10800000).toISOString(),
        parameters: {
          p: 2,
          d: 1,
          q: 2,
          seasonal: true,
          seasonalOrder: [1, 1, 1, 12]
        }
      },
      {
        name: 'RandomForest',
        type: 'RandomForest',
        status: 'trained',
        metrics: {
          accuracy: 91.5,
          rmse: 0.038,
          mae: 0.028,
          mape: 2.1,
          r2Score: 0.85,
          mse: 0.001444,
          bias: 0.003,
          variance: 0.0009,
          adjustedR2: 0.845,
          aic: -212.8,
          bic: -205.4
        },
        predictions: generatePredictions('RandomForest'),
        trainingProgress: 100,
        lastTrained: new Date(Date.now() - 5400000).toISOString(),
        parameters: {
          nEstimators: 100,
          maxDepth: 10,
          minSamplesSplit: 2,
          minSamplesLeaf: 1,
          randomState: 42
        }
      },
      {
        name: 'XGBoost',
        type: 'XGBoost',
        status: 'trained',
        metrics: {
          accuracy: 92.8,
          rmse: 0.035,
          mae: 0.026,
          mape: 1.9,
          r2Score: 0.87,
          mse: 0.001225,
          bias: 0.002,
          variance: 0.0007,
          adjustedR2: 0.865,
          aic: -228.5,
          bic: -221.1
        },
        predictions: generatePredictions('XGBoost'),
        trainingProgress: 100,
        lastTrained: new Date(Date.now() - 1800000).toISOString(),
        parameters: {
          nEstimators: 200,
          maxDepth: 6,
          learningRate: 0.1,
          subsample: 0.8,
          colsampleBytree: 0.8
        }
      }
    ];

    setModels(initialModels);
  };

  const generatePredictions = (modelType: string): ModelPrediction[] => {
    const basePrice = 180;
    const predictions: ModelPrediction[] = [];
    
    // Historical data with actual values
    for (let i = -30; i < 0; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const noise = (Math.random() - 0.5) * 10;
      const trend = i * 0.1;
      const actual = basePrice + trend + noise;
      const predicted = actual + (Math.random() - 0.5) * 2; // Small prediction error
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        actual,
        predicted,
        confidence: 0.8 + Math.random() * 0.15
      });
    }
    
    // Future predictions
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const trend = i * 0.2;
      const seasonality = Math.sin(i * 0.2) * 2;
      const noise = (Math.random() - 0.5) * 5;
      
      let modelBias = 0;
      switch (modelType) {
        case 'LSTM':
          modelBias = Math.sin(i * 0.1) * 3;
          break;
        case 'Prophet':
          modelBias = i * 0.1;
          break;
        case 'ARIMA':
          modelBias = (Math.random() - 0.5) * 2;
          break;
        case 'RandomForest':
          modelBias = Math.cos(i * 0.15) * 2;
          break;
        case 'XGBoost':
          modelBias = i * 0.05 + Math.sin(i * 0.2);
          break;
      }
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted: basePrice + trend + seasonality + noise + modelBias,
        confidence: 0.9 - (i * 0.01) // Confidence decreases over time
      });
    }
    
    return predictions;
  };

  const trainModel = async (modelName: string, parameters?: Record<string, any>) => {
    setIsTraining(true);
    
    const modelIndex = models.findIndex(m => m.name === modelName);
    if (modelIndex === -1) return;
    
    const updatedModels = [...models];
    updatedModels[modelIndex] = {
      ...updatedModels[modelIndex],
      status: 'training',
      trainingProgress: 0
    };
    setModels(updatedModels);
    
    // Simulate training progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      updatedModels[modelIndex].trainingProgress = progress;
      setModels([...updatedModels]);
    }
    
    // Update model with new results
    updatedModels[modelIndex] = {
      ...updatedModels[modelIndex],
      status: 'trained',
      trainingProgress: 100,
      lastTrained: new Date().toISOString(),
      predictions: generatePredictions(modelName),
      metrics: {
        ...updatedModels[modelIndex].metrics,
        accuracy: Math.min(95, updatedModels[modelIndex].metrics.accuracy + Math.random() * 2 - 1)
      },
      parameters: parameters || updatedModels[modelIndex].parameters
    };
    
    setModels([...updatedModels]);
    setIsTraining(false);
  };

  const compareModels = (): ModelComparison[] => {
    const comparisons = models.map(model => ({
      name: model.name,
      type: model.type,
      accuracy: model.metrics.accuracy,
      rmse: model.metrics.rmse,
      mae: model.metrics.mae,
      mape: model.metrics.mape,
      r2Score: model.metrics.r2Score,
      mse: model.metrics.mse,
      bias: model.metrics.bias,
      variance: model.metrics.variance,
      adjustedR2: model.metrics.adjustedR2,
      aic: model.metrics.aic,
      bic: model.metrics.bic,
      rank: 0,
      performance: 'average' as const,
      confidence: 0.85 + Math.random() * 0.1
    }));

    // Calculate ranks based on accuracy
    comparisons.sort((a, b) => b.accuracy - a.accuracy);
    comparisons.forEach((comp, index) => {
      comp.rank = index + 1;
      if (comp.accuracy >= 90) comp.performance = 'excellent';
      else if (comp.accuracy >= 85) comp.performance = 'good';
      else if (comp.accuracy >= 80) comp.performance = 'average';
      else comp.performance = 'poor';
    });

    return comparisons;
  };

  const getDetailedComparison = (metric: keyof ModelMetrics) => {
    const comparisons = compareModels();
    return comparisons.map(comp => ({
      name: comp.name,
      value: comp[metric],
      rank: comp.rank,
      performance: comp.performance
    }));
  };

  const getErrorAnalysis = (modelName: string): ErrorAnalysis => {
    const model = models.find(m => m.name === modelName);
    if (!model) return { modelName, errors: [], meanError: 0, stdError: 0, skewness: 0, kurtosis: 0, outliers: 0 };

    const errors = model.predictions
      .filter(p => p.actual !== undefined)
      .map(p => (p.actual! - p.predicted) / p.actual! * 100);

    const meanError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    const variance = errors.reduce((sum, err) => sum + Math.pow(err - meanError, 2), 0) / errors.length;
    const stdError = Math.sqrt(variance);
    
    const skewness = errors.reduce((sum, err) => sum + Math.pow((err - meanError) / stdError, 3), 0) / errors.length;
    const kurtosis = errors.reduce((sum, err) => sum + Math.pow((err - meanError) / stdError, 4), 0) / errors.length - 3;
    
    const outliers = errors.filter(err => Math.abs(err - meanError) > 2 * stdError).length;

    return {
      modelName,
      errors,
      meanError,
      stdError,
      skewness,
      kurtosis,
      outliers
    };
  };

  const getModelRecommendation = (stockSymbol: string, timeframe: string) => {
    const comparisons = compareModels();
    const bestModel = comparisons[0];
    
    return {
      recommendedModel: bestModel.name,
      confidence: bestModel.confidence,
      reasoning: `Based on ${stockSymbol} ${timeframe} analysis, ${bestModel.name} shows the highest accuracy (${bestModel.accuracy.toFixed(1)}%) with the lowest error metrics.`,
      alternatives: comparisons.slice(1, 3).map(m => ({
        name: m.name,
        accuracy: m.accuracy,
        advantage: m.accuracy > 90 ? 'High accuracy' : m.rmse < 0.04 ? 'Low RMSE' : 'Balanced performance'
      }))
    };
  };

  const getBestModel = () => {
    return models.reduce((best, current) => 
      current.metrics.accuracy > best.metrics.accuracy ? current : best
    );
  };

  return {
    models,
    isTraining,
    selectedModel,
    setSelectedModel,
    trainModel,
    compareModels,
    getBestModel,
    getDetailedComparison,
    getErrorAnalysis,
    getModelRecommendation
  };
};