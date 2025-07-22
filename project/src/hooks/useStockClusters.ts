import { useState, useEffect } from 'react';

export interface ClusterStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  beta: number;
  pe: number;
  similarity: number;
  features: {
    volatility: number;
    momentum: number;
    volume_trend: number;
    price_trend: number;
    correlation: number;
  };
}

export interface StockCluster {
  id: string;
  name: string;
  description: string;
  color: string;
  stocks: ClusterStock[];
  characteristics: string[];
  avgReturn: number;
  avgVolatility: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const useStockClusters = () => {
  const [clusters, setClusters] = useState<StockCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [searchStock, setSearchStock] = useState<string>('');
  const [recommendations, setRecommendations] = useState<ClusterStock[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateClusters();
  }, []);

  const generateClusters = () => {
    const clusterData: StockCluster[] = [
      {
        id: 'tech-growth',
        name: 'Tech Growth Leaders',
        description: 'High-growth technology companies with strong momentum',
        color: '#3B82F6',
        characteristics: [
          'High revenue growth',
          'Strong R&D investment',
          'Market leadership',
          'Innovation focus',
          'High volatility'
        ],
        avgReturn: 15.2,
        avgVolatility: 28.5,
        riskLevel: 'High',
        stocks: [
          {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            sector: 'Technology',
            price: 182.52,
            change: 2.34,
            changePercent: 1.30,
            marketCap: 2800000000000,
            volume: 45000000,
            beta: 1.25,
            pe: 28.5,
            similarity: 0.95,
            features: {
              volatility: 0.25,
              momentum: 0.78,
              volume_trend: 0.65,
              price_trend: 0.82,
              correlation: 0.88
            }
          },
          {
            symbol: 'MSFT',
            name: 'Microsoft Corporation',
            sector: 'Technology',
            price: 378.85,
            change: 3.42,
            changePercent: 0.91,
            marketCap: 2700000000000,
            volume: 32000000,
            beta: 1.15,
            pe: 32.1,
            similarity: 0.92,
            features: {
              volatility: 0.22,
              momentum: 0.75,
              volume_trend: 0.58,
              price_trend: 0.79,
              correlation: 0.85
            }
          },
          {
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            sector: 'Technology',
            price: 142.38,
            change: -1.25,
            changePercent: -0.87,
            marketCap: 1800000000000,
            volume: 28000000,
            beta: 1.35,
            pe: 25.8,
            similarity: 0.89,
            features: {
              volatility: 0.28,
              momentum: 0.72,
              volume_trend: 0.62,
              price_trend: 0.76,
              correlation: 0.82
            }
          },
          {
            symbol: 'NVDA',
            name: 'NVIDIA Corporation',
            sector: 'Technology',
            price: 485.20,
            change: 12.45,
            changePercent: 2.63,
            marketCap: 1200000000000,
            volume: 55000000,
            beta: 1.68,
            pe: 65.2,
            similarity: 0.87,
            features: {
              volatility: 0.35,
              momentum: 0.92,
              volume_trend: 0.88,
              price_trend: 0.95,
              correlation: 0.79
            }
          }
        ]
      },
      {
        id: 'ev-automotive',
        name: 'Electric Vehicle Revolution',
        description: 'Companies leading the electric vehicle transformation',
        color: '#10B981',
        characteristics: [
          'EV technology focus',
          'Sustainable energy',
          'Manufacturing scale',
          'Battery innovation',
          'Government support'
        ],
        avgReturn: 22.8,
        avgVolatility: 45.2,
        riskLevel: 'High',
        stocks: [
          {
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            sector: 'Automotive',
            price: 248.91,
            change: 5.67,
            changePercent: 2.33,
            marketCap: 780000000000,
            volume: 85000000,
            beta: 2.15,
            pe: 58.4,
            similarity: 0.98,
            features: {
              volatility: 0.48,
              momentum: 0.85,
              volume_trend: 0.92,
              price_trend: 0.88,
              correlation: 0.91
            }
          },
          {
            symbol: 'RIVN',
            name: 'Rivian Automotive',
            sector: 'Automotive',
            price: 18.45,
            change: 0.85,
            changePercent: 4.82,
            marketCap: 18000000000,
            volume: 25000000,
            beta: 2.85,
            pe: -12.5,
            similarity: 0.82,
            features: {
              volatility: 0.65,
              momentum: 0.72,
              volume_trend: 0.78,
              price_trend: 0.65,
              correlation: 0.75
            }
          },
          {
            symbol: 'LCID',
            name: 'Lucid Group Inc.',
            sector: 'Automotive',
            price: 4.25,
            change: 0.15,
            changePercent: 3.66,
            marketCap: 8500000000,
            volume: 18000000,
            beta: 3.25,
            pe: -8.2,
            similarity: 0.79,
            features: {
              volatility: 0.72,
              momentum: 0.68,
              volume_trend: 0.75,
              price_trend: 0.62,
              correlation: 0.72
            }
          }
        ]
      },
      {
        id: 'dividend-aristocrats',
        name: 'Dividend Aristocrats',
        description: 'Stable companies with consistent dividend payments',
        color: '#F59E0B',
        characteristics: [
          'Consistent dividends',
          'Stable earnings',
          'Low volatility',
          'Mature business',
          'Strong cash flow'
        ],
        avgReturn: 8.5,
        avgVolatility: 15.2,
        riskLevel: 'Low',
        stocks: [
          {
            symbol: 'JNJ',
            name: 'Johnson & Johnson',
            sector: 'Healthcare',
            price: 165.80,
            change: 0.45,
            changePercent: 0.27,
            marketCap: 420000000000,
            volume: 8000000,
            beta: 0.68,
            pe: 18.5,
            similarity: 0.94,
            features: {
              volatility: 0.12,
              momentum: 0.45,
              volume_trend: 0.35,
              price_trend: 0.52,
              correlation: 0.88
            }
          },
          {
            symbol: 'PG',
            name: 'Procter & Gamble',
            sector: 'Consumer Goods',
            price: 158.25,
            change: 0.85,
            changePercent: 0.54,
            marketCap: 380000000000,
            volume: 6500000,
            beta: 0.55,
            pe: 24.2,
            similarity: 0.91,
            features: {
              volatility: 0.10,
              momentum: 0.42,
              volume_trend: 0.32,
              price_trend: 0.48,
              correlation: 0.85
            }
          },
          {
            symbol: 'KO',
            name: 'The Coca-Cola Company',
            sector: 'Beverages',
            price: 62.15,
            change: 0.25,
            changePercent: 0.40,
            marketCap: 270000000000,
            volume: 12000000,
            beta: 0.62,
            pe: 26.8,
            similarity: 0.88,
            features: {
              volatility: 0.14,
              momentum: 0.38,
              volume_trend: 0.28,
              price_trend: 0.45,
              correlation: 0.82
            }
          }
        ]
      },
      {
        id: 'fintech-disruptors',
        name: 'FinTech Disruptors',
        description: 'Companies revolutionizing financial services',
        color: '#8B5CF6',
        characteristics: [
          'Digital payments',
          'Blockchain technology',
          'Mobile banking',
          'AI-driven services',
          'Regulatory challenges'
        ],
        avgReturn: 18.7,
        avgVolatility: 38.5,
        riskLevel: 'High',
        stocks: [
          {
            symbol: 'SQ',
            name: 'Block Inc.',
            sector: 'Financial Technology',
            price: 78.45,
            change: 2.15,
            changePercent: 2.82,
            marketCap: 45000000000,
            volume: 15000000,
            beta: 1.85,
            pe: 42.5,
            similarity: 0.93,
            features: {
              volatility: 0.42,
              momentum: 0.78,
              volume_trend: 0.72,
              price_trend: 0.75,
              correlation: 0.86
            }
          },
          {
            symbol: 'PYPL',
            name: 'PayPal Holdings',
            sector: 'Financial Technology',
            price: 68.25,
            change: 1.85,
            changePercent: 2.79,
            marketCap: 78000000000,
            volume: 18000000,
            beta: 1.45,
            pe: 18.2,
            similarity: 0.89,
            features: {
              volatility: 0.35,
              momentum: 0.72,
              volume_trend: 0.68,
              price_trend: 0.71,
              correlation: 0.83
            }
          }
        ]
      },
      {
        id: 'biotech-innovation',
        name: 'Biotech Innovation',
        description: 'Biotechnology companies developing breakthrough treatments',
        color: '#EF4444',
        characteristics: [
          'Drug development',
          'Clinical trials',
          'Patent protection',
          'High R&D costs',
          'Regulatory approval'
        ],
        avgReturn: 25.4,
        avgVolatility: 52.8,
        riskLevel: 'High',
        stocks: [
          {
            symbol: 'MRNA',
            name: 'Moderna Inc.',
            sector: 'Biotechnology',
            price: 95.80,
            change: 3.25,
            changePercent: 3.51,
            marketCap: 38000000000,
            volume: 8500000,
            beta: 1.95,
            pe: 8.5,
            similarity: 0.91,
            features: {
              volatility: 0.58,
              momentum: 0.82,
              volume_trend: 0.75,
              price_trend: 0.78,
              correlation: 0.79
            }
          },
          {
            symbol: 'BNTX',
            name: 'BioNTech SE',
            sector: 'Biotechnology',
            price: 108.45,
            change: 4.85,
            changePercent: 4.68,
            marketCap: 26000000000,
            volume: 2800000,
            beta: 2.15,
            pe: 6.2,
            similarity: 0.87,
            features: {
              volatility: 0.62,
              momentum: 0.85,
              volume_trend: 0.72,
              price_trend: 0.81,
              correlation: 0.76
            }
          }
        ]
      }
    ];

    setClusters(clusterData);
    if (clusterData.length > 0) {
      setSelectedCluster(clusterData[0].id);
    }
  };

  const findSimilarStocks = (targetSymbol: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const allStocks = clusters.flatMap(cluster => cluster.stocks);
      const targetStock = allStocks.find(stock => stock.symbol === targetSymbol);
      
      if (targetStock) {
        // Calculate similarity based on features
        const similar = allStocks
          .filter(stock => stock.symbol !== targetSymbol)
          .map(stock => ({
            ...stock,
            similarity: calculateSimilarity(targetStock.features, stock.features)
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 10);
        
        setRecommendations(similar);
      }
      
      setLoading(false);
    }, 1000);
  };

  const calculateSimilarity = (features1: any, features2: any): number => {
    const keys = Object.keys(features1);
    let similarity = 0;
    
    keys.forEach(key => {
      const diff = Math.abs(features1[key] - features2[key]);
      similarity += (1 - diff);
    });
    
    return Math.max(0, similarity / keys.length);
  };

  const getClusterAnalysis = (clusterId: string) => {
    const cluster = clusters.find(c => c.id === clusterId);
    if (!cluster) return null;
    
    const totalMarketCap = cluster.stocks.reduce((sum, stock) => sum + stock.marketCap, 0);
    const avgPE = cluster.stocks.reduce((sum, stock) => sum + stock.pe, 0) / cluster.stocks.length;
    const avgBeta = cluster.stocks.reduce((sum, stock) => sum + stock.beta, 0) / cluster.stocks.length;
    
    return {
      ...cluster,
      totalMarketCap,
      avgPE,
      avgBeta,
      stockCount: cluster.stocks.length
    };
  };

  const searchStocks = (query: string) => {
    if (!query) return [];
    
    const allStocks = clusters.flatMap(cluster => cluster.stocks);
    return allStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    clusters,
    selectedCluster,
    setSelectedCluster,
    searchStock,
    setSearchStock,
    recommendations,
    loading,
    findSimilarStocks,
    getClusterAnalysis,
    searchStocks
  };
};