import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, X, Loader2 } from 'lucide-react';

interface StockSearchProps {
  onSearch: (symbol: string) => void;
  popularStocks: string[];
  loading?: boolean;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSearch, popularStocks, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentStockSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (symbol: string) => {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (cleanSymbol) {
      onSearch(cleanSymbol);
      setSearchTerm('');
      setShowSuggestions(false);
      
      // Update recent searches
      const updated = [cleanSymbol, ...recentSearches.filter(s => s !== cleanSymbol)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentStockSearches', JSON.stringify(updated));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const filteredPopular = popularStocks.filter(stock => 
    stock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecent = recentSearches.filter(stock => 
    stock.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for stocks (e.g., AAPL, TSLA, GOOGL)..."
            className="w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin" />
          )}
          {searchTerm && !loading && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && (searchTerm || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && filteredRecent.length > 0 && (
              <div className="p-3 border-b border-gray-200 dark:border-slate-600">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Searches</div>
                {filteredRecent.map((stock, index) => (
                  <motion.button
                    key={stock}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSearch(stock)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded text-left transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{stock}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Recent</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Popular Stocks */}
            {filteredPopular.length > 0 && (
              <div className="p-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Popular Stocks</div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredPopular.slice(0, 8).map((stock, index) => (
                    <motion.button
                      key={stock}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(stock)}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded text-left transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{stock}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Popular</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchTerm && filteredPopular.length === 0 && filteredRecent.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="text-sm">No stocks found for "{searchTerm}"</div>
                <div className="text-xs mt-1">Try searching for a different symbol</div>
              </div>
            )}

            {/* Quick Search Button */}
            {searchTerm && (
              <div className="p-3 border-t border-gray-200 dark:border-slate-600">
                <button
                  onClick={() => handleSearch(searchTerm)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Search for "{searchTerm.toUpperCase()}"
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default StockSearch; 