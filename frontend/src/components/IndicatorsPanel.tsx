import React from 'react';
import { IndicatorSummary } from '../types';
import { Activity, Compass, Gauge, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface IndicatorsPanelProps {
  indicators: IndicatorSummary;
}

export const IndicatorsPanel: React.FC<IndicatorsPanelProps> = ({ indicators }) => {
  const rsi = indicators.rsi ?? 50;

  // RSI color calculation
  const getRsiColor = (val: number) => {
    if (val >= 70) return 'text-rose-400';
    if (val <= 30) return 'text-emerald-400';
    return 'text-blue-400';
  };

  const getRsiBadge = (val: number) => {
    if (val >= 70)
      return { text: 'Overbought', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    if (val <= 30)
      return { text: 'Oversold', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    return { text: 'Neutral Momentum', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
  };

  const rsiBadge = getRsiBadge(rsi);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. RSI Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              RSI (14)
            </span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold mono-numbers ${getRsiColor(rsi)}`}>
              {indicators.rsi !== null ? indicators.rsi.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>

          {/* RSI Gauge Bar */}
          <div className="mt-3 relative">
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
              <div className="w-[30%] bg-emerald-500/40" title="Oversold (<30)" />
              <div className="w-[40%] bg-blue-500/40" title="Neutral (30-70)" />
              <div className="w-[30%] bg-rose-500/40" title="Overbought (>70)" />
            </div>
            {/* Marker Indicator */}
            <div
              style={{ left: `${Math.min(Math.max(rsi, 0), 100)}%` }}
              className="absolute -top-1 w-2.5 h-4 bg-white rounded-full shadow-md -translate-x-1/2"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800/80">
          <span
            className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${rsiBadge.bg}`}
          >
            {indicators.rsi_signal}
          </span>
        </div>
      </div>

      {/* 2. MACD Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              MACD (12, 26, 9)
            </span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>

          <div className="space-y-1.5 mono-numbers text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">MACD Line:</span>
              <span className="font-semibold text-gray-200">
                {indicators.macd !== null ? indicators.macd.toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Signal Line:</span>
              <span className="font-semibold text-purple-400">
                {indicators.macd_signal !== null ? indicators.macd_signal.toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Histogram (Diff):</span>
              <span
                className={`font-semibold ${
                  (indicators.macd_diff ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {indicators.macd_diff !== null ? indicators.macd_diff.toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800/80">
          <span
            className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              indicators.macd_signal_direction.includes('Bullish')
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            <span>{indicators.macd_signal_direction}</span>
          </span>
        </div>
      </div>

      {/* 3. Moving Averages Trend */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Moving Averages
            </span>
            <BarChart3 className="w-4 h-4 text-sky-400" />
          </div>

          <div className="space-y-1.5 mono-numbers text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">SMA 20:</span>
              <span className="font-semibold text-sky-400">
                ${indicators.sma_20 !== null ? indicators.sma_20.toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">SMA 50:</span>
              <span className="font-semibold text-amber-400">
                ${indicators.sma_50 !== null ? indicators.sma_50.toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">EMA 20:</span>
              <span className="font-semibold text-purple-400">
                ${indicators.ema_20 !== null ? indicators.ema_20.toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800/80">
          <span
            className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              indicators.sma_trend.includes('Bullish')
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {indicators.sma_trend.includes('Bullish') ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            <span>{indicators.sma_trend}</span>
          </span>
        </div>
      </div>

      {/* 4. Bollinger Bands Card */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Bollinger Bands (20, 2)
            </span>
            <Compass className="w-4 h-4 text-pink-400" />
          </div>

          <div className="space-y-1.5 mono-numbers text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Upper Band:</span>
              <span className="font-semibold text-pink-400">
                ${indicators.bb_high !== null ? indicators.bb_high.toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Middle Band:</span>
              <span className="font-semibold text-gray-200">
                ${indicators.bb_middle !== null ? indicators.bb_middle.toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lower Band:</span>
              <span className="font-semibold text-pink-400">
                ${indicators.bb_low !== null ? indicators.bb_low.toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800/80">
          <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30">
            Volatility Envelope Active
          </span>
        </div>
      </div>
    </div>
  );
};
