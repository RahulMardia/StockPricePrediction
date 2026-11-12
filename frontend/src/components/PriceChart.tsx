import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickData, LineData, HistogramData } from 'lightweight-charts';
import { HistoricalDataPoint } from '../types';
import { Layers, Maximize2 } from 'lucide-react';

interface PriceChartProps {
  history: HistoricalDataPoint[];
  ticker: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ history, ticker }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Overlay toggles
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showEMA20, setShowEMA20] = useState(false);
  const [showBB, setShowBB] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current || history.length === 0) return;

    // Clear previous canvas if re-rendering
    chartContainerRef.current.innerHTML = '';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 440,
      layout: {
        background: { color: '#111827' },
        textColor: '#9CA3AF',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      crosshair: {
        mode: 1,
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
    });

    chartRef.current = chart;

    // 1. Candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    const candleData: CandlestickData[] = history.map((d) => ({
      time: d.time as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    candleSeries.setData(candleData);

    // 2. Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData: HistogramData[] = history.map((d) => ({
      time: d.time as any,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
    }));
    volumeSeries.setData(volumeData);

    // 3. SMA 20 Overlay
    if (showSMA20) {
      const sma20Series = chart.addLineSeries({
        color: '#38BDF8', // Sky blue
        lineWidth: 2,
        title: 'SMA 20',
      });
      const sma20Data: LineData[] = history
        .filter((d) => d.sma_20 !== null)
        .map((d) => ({ time: d.time as any, value: d.sma_20! }));
      sma20Series.setData(sma20Data);
    }

    // 4. SMA 50 Overlay
    if (showSMA50) {
      const sma50Series = chart.addLineSeries({
        color: '#F59E0B', // Amber
        lineWidth: 2,
        title: 'SMA 50',
      });
      const sma50Data: LineData[] = history
        .filter((d) => d.sma_50 !== null)
        .map((d) => ({ time: d.time as any, value: d.sma_50! }));
      sma50Series.setData(sma50Data);
    }

    // 5. EMA 20 Overlay
    if (showEMA20) {
      const ema20Series = chart.addLineSeries({
        color: '#A855F7', // Purple
        lineWidth: 2,
        title: 'EMA 20',
      });
      const ema20Data: LineData[] = history
        .filter((d) => d.ema_20 !== null)
        .map((d) => ({ time: d.time as any, value: d.ema_20! }));
      ema20Series.setData(ema20Data);
    }

    // 6. Bollinger Bands
    if (showBB) {
      const bbHighScore = chart.addLineSeries({
        color: '#EC4899', // Pink
        lineWidth: 1,
        lineStyle: 2, // Dashed
        title: 'BB High',
      });
      const bbLowScore = chart.addLineSeries({
        color: '#EC4899',
        lineWidth: 1,
        lineStyle: 2,
        title: 'BB Low',
      });

      const bbHighData: LineData[] = history
        .filter((d) => d.bb_high !== null)
        .map((d) => ({ time: d.time as any, value: d.bb_high! }));
      const bbLowData: LineData[] = history
        .filter((d) => d.bb_low !== null)
        .map((d) => ({ time: d.time as any, value: d.bb_low! }));

      bbHighScore.setData(bbHighData);
      bbLowScore.setData(bbLowData);
    }

    chart.timeScale().fitContent();

    // Resize listener
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [history, showSMA20, showSMA50, showEMA20, showBB]);

  const resetView = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-xl">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-800/80">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold text-white tracking-wide">
            {ticker} Price Chart & Indicators
          </span>
          <span className="text-xs text-gray-400 ml-2">(Last 250 Trading Days)</span>
        </div>

        {/* Toggle Overlays */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              showSMA20
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              showSMA50
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            SMA 50
          </button>
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              showEMA20
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            EMA 20
          </button>
          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              showBB
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Bollinger Bands
          </button>

          <button
            onClick={resetView}
            title="Reset Zoom"
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors ml-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div ref={chartContainerRef} className="w-full relative rounded-xl overflow-hidden" />
    </div>
  );
};
