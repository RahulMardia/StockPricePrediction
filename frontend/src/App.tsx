import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TickerSearch } from './components/TickerSearch';
import { StockOverview } from './components/StockOverview';
import { PredictionCard } from './components/PredictionCard';
import { PriceChart } from './components/PriceChart';
import { IndicatorsPanel } from './components/IndicatorsPanel';
import { ModelMetrics } from './components/ModelMetrics';
import { TrainModal } from './components/TrainModal';
import { fetchStockAnalysis } from './services/api';
import { StockAnalysisResponse } from './types';
import { Loader2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTicker, setCurrentTicker] = useState('AAPL');
  const [data, setData] = useState<StockAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrainModalOpen, setIsTrainModalOpen] = useState(false);

  const loadStockData = async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchStockAnalysis(symbol);
      setData(response);
      setCurrentTicker(response.quote.ticker);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock data. Please verify ticker.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStockData(currentTicker);
  }, []);

  const handleSelectTicker = (ticker: string) => {
    setCurrentTicker(ticker);
    loadStockData(ticker);
  };

  const handleTrainSuccess = (trainedTicker: string) => {
    setCurrentTicker(trainedTicker);
    loadStockData(trainedTicker);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-['Inter',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        currentTicker={currentTicker}
        onSelectTicker={handleSelectTicker}
        onOpenTrainModal={() => setIsTrainModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#111827]/80 p-4 rounded-2xl border border-gray-800 backdrop-blur-sm">
          <TickerSearch onSearch={handleSelectTicker} isLoading={isLoading} />

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <button
              onClick={() => loadStockData(currentTicker)}
              disabled={isLoading}
              title="Refresh Market Data & Inference"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner Skeleton */}
        {isLoading && !data && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Analyzing {currentTicker} Market Structure...</p>
              <p className="text-xs text-gray-400 mt-1">
                Extracting technical indicators, calculating momentum oscillators, and running ML inference.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">Error Loading Stock Data</h3>
              <p className="text-xs text-rose-300 mt-1">{error}</p>
              <button
                onClick={() => loadStockData(currentTicker)}
                className="mt-3 px-3.5 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loaded Data Dashboard */}
        {data && (
          <div className="space-y-6">
            {/* Top Grid: Overview + Prediction */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <StockOverview quote={data.quote} />
              </div>
              <div className="lg:col-span-6">
                <PredictionCard prediction={data.prediction} />
              </div>
            </div>

            {/* Interactive Price Chart with Technical Overlays */}
            <PriceChart history={data.history} ticker={data.quote.ticker} />

            {/* Technical Indicators Deep Dive */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  Technical Indicator Analytics
                </h2>
              </div>
              <IndicatorsPanel indicators={data.indicators} />
            </div>

            {/* Model Benchmarks & Metrics */}
            {data.model_metrics && (
              <ModelMetrics metrics={data.model_metrics} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0E1424] py-6 mt-12 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-300">StockPulse AI</span>
            <span>•</span>
            <span>Python Machine Learning & Technical Analysis</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-gray-400">
            <span className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800">FastAPI</span>
            <span className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800">Scikit-learn</span>
            <span className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800">XGBoost</span>
            <span className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800">React + Vite</span>
            <span className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800">Tailwind CSS</span>
            <span className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800">Yahoo Finance</span>
          </div>
        </div>
      </footer>

      {/* Train Model Modal */}
      <TrainModal
        isOpen={isTrainModalOpen}
        onClose={() => setIsTrainModalOpen(false)}
        defaultTicker={currentTicker}
        onTrainSuccess={handleTrainSuccess}
      />
    </div>
  );
};
