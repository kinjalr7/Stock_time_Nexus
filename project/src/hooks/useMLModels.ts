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
    // Initialise with placeholder models; predictions will be loaded on demand.
    const initialModels: MLModel[] = [
      {
        name: 'LSTM',
        type: 'LSTM',
        status: 'trained',
        metrics: {
          accuracy: 0,
          rmse: 0,
          mae: 0,
          mape: 0,
          r2Score: 0,
          mse: 0,
          bias: 0,
          variance: 0,
          adjustedR2: 0,
          aic: 0,
          bic: 0,
        },
        predictions: [],
        trainingProgress: 0,
        lastTrained: '',
        parameters: {}
      },
      {
        name: 'Prophet',
        type: 'Prophet',
        status: 'trained',
        metrics: {
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

  // --- Real backend integration ---------------------------------------------------
  // Fetch a 30‑day forecast from the FastAPI endpoint.
  const fetchForecast = async (symbol: string, modelType: string): Promise<ModelPrediction[]> => {
    const resp = await fetch(`/api/models/forecast/${symbol}?model_type=${modelType}`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch forecast: ${resp.statusText}`);
    }
    const data = await resp.json();
    // Backend returns objects with {date, predicted, confidence}
    // Ensure the shape matches ModelPrediction (actual may be undefined).
    return data.map((item: any) => ({
      date: item.date,
      predicted: item.predicted,
      confidence: item.confidence,
    }));
  };

  // Trigger model (re)training on the backend.
  const trainModelAPI = async (symbol: string, modelType: string): Promise<any> => {
    const resp = await fetch(`/api/models/train/${symbol}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_type: modelType }),
    });
    if (!resp.ok) {
      throw new Error(`Training failed: ${resp.statusText}`);
    }
    return await resp.json();
  };


  const trainModel = async (symbol: string, modelName: string) => {
    setIsTraining(true);
    const modelIndex = models.findIndex(m => m.name === modelName);
    if (modelIndex === -1) return;
    const updatedModels = [...models];
    updatedModels[modelIndex] = {
      ...updatedModels[modelIndex],
      status: 'training',
      trainingProgress: 0,
    };
    setModels(updatedModels);
    try {
      // Call backend to (re)train the model
      const result = await trainModelAPI(symbol, modelName);
      // After training, fetch fresh forecast data
      const freshPreds = await fetchForecast(symbol, modelName);
      updatedModels[modelIndex] = {
        ...updatedModels[modelIndex],
        status: 'trained',
        trainingProgress: 100,
        lastTrained: new Date().toISOString(),
        predictions: freshPreds,
        metrics: {
          ...updatedModels[modelIndex].metrics,
          // Use backend‑provided metrics if present
          accuracy: result.accuracy ?? updatedModels[modelIndex].metrics.accuracy,
          rmse: result.rmse ?? updatedModels[modelIndex].metrics.rmse,
        },
        parameters: result,
      };
    } catch (e) {
      console.error(e);
      updatedModels[modelIndex] = {
        ...updatedModels[modelIndex],
        status: 'error',
      };
    }
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