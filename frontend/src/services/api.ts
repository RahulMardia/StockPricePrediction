import { StockAnalysisResponse, ModelMetricsResponse, TrainResponse } from '../types';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const API_BASE = `${BACKEND_URL}/api`;

export async function fetchStockAnalysis(symbol: string): Promise<StockAnalysisResponse> {
  const url = `${API_BASE}/stock/${encodeURIComponent(symbol.trim().toUpperCase())}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      let detail = `Server error (${res.status})`;
      try {
        const errorData = await res.json();
        detail = errorData.detail || detail;
      } catch {
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          detail = 'Render backend is waking up (cold start takes ~30-50s). Please wait 30 seconds and click Retry.';
        }
      }
      throw new Error(detail);
    }
    return res.json();
  } catch (err: any) {
    if (err.message && !err.message.toLowerCase().includes('failed to fetch')) {
      throw err;
    }
    throw new Error(
      `Cannot connect to backend (${BACKEND_URL || 'local server'}). If on Render, the free instance may be waking up (takes ~30-50s) or check VITE_BACKEND_URL. Click Retry in a moment.`
    );
  }
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
