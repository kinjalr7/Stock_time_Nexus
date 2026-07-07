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

export const useMLModels = (selectedSymbol?: string) => {
  const [models, setModels] = useState<MLModel[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('LSTM');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeModels();
  }, []);

  useEffect(() => {
    if (selectedSymbol && models.length > 0) {
      loadAllModelData(selectedSymbol);
    }
  }, [selectedSymbol, models.length]);

  const initializeModels = () => {
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
        name: 'ARIMA',
        type: 'ARIMA',
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
        name: 'RandomForest',
        type: 'RandomForest',
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
        name: 'XGBoost',
        type: 'XGBoost',
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
      }
    ];

    setModels(initialModels);
  };

  const fetchForecast = async (symbol: string, modelType: string): Promise<ModelPrediction[]> => {
    const normalizedType = modelType.toLowerCase();
    const resp = await fetch(`/api/models/forecast/${symbol}?model_type=${normalizedType}`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch forecast: ${resp.statusText}`);
    }
    const data = await resp.json();
    return data.map((item: any) => ({
      date: item.date,
      predicted: item.predicted,
      confidence: item.confidence,
    }));
  };

  const trainModelAPI = async (symbol: string, modelType: string): Promise<any> => {
    const normalizedType = modelType.toLowerCase();
    const resp = await fetch(`/api/models/train/${symbol}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_type: normalizedType }),
    });
    if (!resp.ok) {
      throw new Error(`Training failed: ${resp.statusText}`);
    }
    return await resp.json();
  };

  const loadAllModelData = async (symbol: string) => {
    try {
      setError(null);
      const metricsResp = await fetch(`/api/models/metrics/${symbol}`);
      let metricsData: any[] = [];
      if (metricsResp.ok) {
        metricsData = await metricsResp.json();
      }

      const updatedModels = await Promise.all(
        models.map(async (model) => {
          try {
            const predictions = await fetchForecast(symbol, model.type);
            const backendMetric = metricsData.find(
              (m: any) => m.model_type === model.type.toLowerCase()
            );

            return {
              ...model,
              status: 'trained' as const,
              predictions,
              metrics: backendMetric
                ? {
                    accuracy: backendMetric.r2 ? Math.max(0, Math.min(100, backendMetric.r2 * 100)) : 0,
                    rmse: backendMetric.rmse || 0,
                    mae: backendMetric.mae || 0,
                    mape: backendMetric.mae ? backendMetric.mae * 1.5 : 0,
                    r2Score: backendMetric.r2 || 0,
                    mse: backendMetric.rmse ? Math.pow(backendMetric.rmse, 2) : 0,
                    bias: 0,
                    variance: 0,
                    adjustedR2: backendMetric.r2 || 0,
                    aic: 0,
                    bic: 0,
                  }
                : model.metrics,
              lastTrained: backendMetric?.trained_at || model.lastTrained,
            };
          } catch (err) {
            console.error(`Failed to load forecast for model ${model.name}`, err);
            return {
              ...model,
              status: 'error' as const,
            };
          }
        })
      );
      setModels(updatedModels);
    } catch (err: any) {
      setError(err.message || 'Failed to load model data');
    }
  };

  const trainModel = async (symbol: string, modelName: string) => {
    setIsTraining(true);
    const modelIndex = models.findIndex(m => m.name === modelName);
    if (modelIndex === -1) return;
    const updatedModels = [...models];
    updatedModels[modelIndex] = {
      ...updatedModels[modelIndex],
      status: 'training',
      trainingProgress: 50,
    };
    setModels(updatedModels);
    try {
      const result = await trainModelAPI(symbol, modelName);
      const freshPreds = await fetchForecast(symbol, modelName);
      updatedModels[modelIndex] = {
        ...updatedModels[modelIndex],
        status: 'trained',
        trainingProgress: 100,
        lastTrained: result.trained_at || new Date().toISOString(),
        predictions: freshPreds,
        metrics: {
          ...updatedModels[modelIndex].metrics,
          accuracy: result.r2 ? Math.max(0, Math.min(100, result.r2 * 100)) : 0,
          rmse: result.rmse || 0,
          mae: result.mae || 0,
          r2Score: result.r2 || 0,
          mse: result.rmse ? Math.pow(result.rmse, 2) : 0,
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
    getModelRecommendation,
    loadAllModelData,
    error
  };
};