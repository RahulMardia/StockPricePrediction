import React from 'react';
import { TrendingUp, Cpu, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTicker: string;
  onSelectTicker: (ticker: string) => void;
  onOpenTrainModal: () => void;
}

const POPULAR_TICKERS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN'];

export const Navbar: React.FC<NavbarProps> = ({
  currentTicker,
  onSelectTicker,
  onOpenTrainModal,
}) => {
  return (
    <header className="border-b border-gray-800 bg-[#0E1424]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">StockPulse</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                  AI ML
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Machine Learning Market Direction</p>
            </div>
          </div>

          {/* Quick Tickers */}
          <div className="hidden md:flex items-center space-x-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            {POPULAR_TICKERS.map((symbol) => {
              const isActive = currentTicker === symbol;
              return (
                <button
                  key={symbol}
                  onClick={() => onSelectTicker(symbol)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {symbol}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenTrainModal}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-medium shadow-md shadow-indigo-500/20 transition-all border border-indigo-400/20 hover:scale-[1.02]"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Train Models</span>
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
