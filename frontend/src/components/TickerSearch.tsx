import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface TickerSearchProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
}

export const TickerSearch: React.FC<TickerSearchProps> = ({ onSearch, isLoading }) => {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-md">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search ticker (e.g. AAPL, NVDA, TSLA, MSFT)..."
          className="w-full pl-10 pr-20 py-2 bg-gray-900/90 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isLoading}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Predict
        </button>
      </div>
    </form>
  );
};
