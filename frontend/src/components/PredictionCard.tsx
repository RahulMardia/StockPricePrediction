import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Cpu } from 'lucide-react';
import { PredictionResult } from '../types';

interface PredictionCardProps {
  prediction: PredictionResult;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
  const isUp = prediction.prediction === 'UP';

  const confidenceColor = {
    High: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }[prediction.confidence] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-xl transition-all ${
        isUp
          ? 'bg-gradient-to-br from-[#0c2419] to-[#0d1829] border-emerald-500/30'
          : 'bg-gradient-to-br from-[#2a1015] to-[#0d1829] border-rose-500/30'
      }`}
    >
      {/* Background Glow */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isUp ? 'bg-emerald-400' : 'bg-rose-400'
        }`}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Next-Day Forecast
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${confidenceColor}`}
            >
              {prediction.confidence} Confidence
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-gray-400">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-gray-300">{prediction.model_name}</span>
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                isUp
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-8 h-8 animate-pulse" />
              ) : (
                <TrendingDown className="w-8 h-8 animate-pulse" />
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">Predicted Direction</div>
              <div
                className={`text-3xl font-black tracking-tight ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? 'PREDICTED UP' : 'PREDICTED DOWN'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 block mb-0.5">Primary Probability</span>
            <span className="text-3xl font-extrabold text-white mono-numbers">
              {isUp ? `${prediction.up_probability}%` : `${prediction.down_probability}%`}
            </span>
          </div>
        </div>

        {/* Probability Split Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium mono-numbers">
            <span className="text-emerald-400 flex items-center space-x-1">
              <span>▲ UP</span>
              <span>{prediction.up_probability}%</span>
            </span>
            <span className="text-rose-400 flex items-center space-x-1">
              <span>{prediction.down_probability}%</span>
              <span>▼ DOWN</span>
            </span>
          </div>

          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex p-0.5">
            <div
              style={{ width: `${prediction.up_probability}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-500"
            />
            <div
              style={{ width: `${prediction.down_probability}%` }}
              className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-r-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Disclaimer / Context */}
        <div className="flex items-start space-x-2 pt-2 border-t border-gray-800/60 text-[11px] text-gray-400 leading-relaxed">
          <AlertCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <span>
            Generated from {prediction.ticker} technical momentum, trend indicators (SMA, RSI, MACD), and historical classification models. For informational/educational purposes only.
          </span>
        </div>
      </div>
    </div>
  );
};
