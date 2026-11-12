import { StockAnalysisResponse, ModelMetricsResponse, TrainResponse } from '../types';

const API_BASE = '/api';

export async function fetchStockAnalysis(symbol: string): Promise<StockAnalysisResponse> {
  const res = await fetch(`${API_BASE}/stock/${encodeURIComponent(symbol.trim().toUpperCase())}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to fetch stock data' }));
    throw new Error(errorData.detail || `Server error: ${res.status}`);
  }
  return res.json();
}

export async function fetchModelMetrics(symbol: string = 'AAPL'): Promise<ModelMetricsResponse> {
  const res = await fetch(`${API_BASE}/models/metrics?ticker=${encodeURIComponent(symbol)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch model metrics');
  }
  return res.json();
}

export async function trainModel(symbol: string): Promise<TrainResponse> {
  const res = await fetch(`${API_BASE}/models/train`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticker: symbol.trim().toUpperCase() }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Training failed' }));
    throw new Error(err.detail || `Training failed with status ${res.status}`);
  }

  return res.json();
}
