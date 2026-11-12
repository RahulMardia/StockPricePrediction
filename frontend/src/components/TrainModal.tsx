import React, { useState } from 'react';
import { X, Cpu, CheckCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { trainModel } from '../services/api';
import { TrainResponse } from '../types';

interface TrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTicker: string;
  onTrainSuccess: (newTicker: string) => void;
}

export const TrainModal: React.FC<TrainModalProps> = ({
  isOpen,
  onClose,
  defaultTicker,
  onTrainSuccess,
}) => {
  const [ticker, setTicker] = useState(defaultTicker);
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState<TrainResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartTraining = async () => {
    if (!ticker.trim()) return;
    setIsTraining(true);
    setError(null);
    setResult(null);

    try {
      const response = await trainModel(ticker.trim().toUpperCase());
      setResult(response);
      onTrainSuccess(response.ticker);
    } catch (err: any) {
      setError(err.message || 'Training failed. Please check the ticker symbol.');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Machine Learning Training Studio</h3>
              <p className="text-xs text-gray-400">Train & compare ensemble models on market data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isTraining}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Target Stock Symbol
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL, NVDA, TSLA, MSFT"
                disabled={isTraining}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm uppercase"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Downloads up to 5 years of daily data from Yahoo Finance, computes all 17 technical indicators, and trains Logistic Regression, Random Forest, and XGBoost.
            </p>
          </div>

          {/* Model Pipelines Overview */}
          <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800/80 space-y-2 text-xs">
            <span className="font-semibold text-gray-300 block">Training Pipeline Stages:</span>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>1. Fetch & clean chronological OHLCV price series</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>2. Compute 17 Momentum, Trend & Volatility Features</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>3. TimeSeries Chronological Split (70% Train, 15% Val, 15% Test)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>4. Train & Benchmark Logistic Regression, Random Forest & XGBoost</span>
              </li>
            </ul>
          </div>

          {/* Training in Progress Indicator */}
          {isTraining && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center space-x-3 text-blue-300 text-xs animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin shrink-0 text-blue-400" />
              <div>
                <p className="font-semibold text-white">Training models in progress...</p>
                <p className="text-[11px] text-blue-300">
                  Fitting models, running cross-validation, and selecting the highest-performing model.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Training Failed</p>
                <p className="text-[11px]">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {result && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3 text-emerald-300 text-xs">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Training Complete!</p>
                <p className="text-[11px] text-gray-300 mb-2">{result.message}</p>
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/20 text-[11px] font-semibold text-emerald-300">
                  Selected Best Algorithm: <span className="text-white">{result.selected_model}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-gray-800 bg-gray-900/40 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isTraining}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleStartTraining}
            disabled={isTraining || !ticker.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Training...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Start Training Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
