import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StockQuote } from '../types';

interface StockOverviewProps {
  quote: StockQuote;
}

export const StockOverview: React.FC<StockOverviewProps> = ({ quote }) => {
  const isPositive = quote.change >= 0;

  return (
    <div className="bg-[#111827] border border-gray-800/80 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Company & Price */}
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">{quote.ticker}</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 font-medium">
              NASDAQ / NYSE
            </span>
            <span className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-xs">
              {quote.company_name}
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold text-white mono-numbers">
              ${quote.current_price.toFixed(2)}
            </span>
            <div
              className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-sm font-semibold mono-numbers ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isPositive ? '+' : ''}
                {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                {quote.change_percent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-900/60 p-3 rounded-xl border border-gray-800/60 text-xs">
          <div>
            <span className="text-gray-400 block mb-0.5">Day Range</span>
            <span className="font-semibold text-gray-200 mono-numbers">
              ${quote.day_low.toFixed(2)} - ${quote.day_high.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Open</span>
            <span className="font-semibold text-gray-200 mono-numbers">
              ${quote.open_price.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Prev Close</span>
            <span className="font-semibold text-gray-200 mono-numbers">
              ${quote.previous_close.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Volume</span>
            <span className="font-semibold text-gray-200 mono-numbers">
              {quote.volume.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
