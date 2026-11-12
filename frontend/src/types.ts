export interface StockQuote {
  ticker: string;
  company_name: string;
  current_price: number;
  change: number;
  change_percent: number;
  day_high: number;
  day_low: number;
  open_price: number;
  previous_close: number;
  volume: number;
  latest_date: string;
}

export interface IndicatorSummary {
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_diff: number | null;
  sma_20: number | null;
  sma_50: number | null;
  ema_20: number | null;
  ema_50: number | null;
  bb_high: number | null;
  bb_low: number | null;
  bb_middle: number | null;
  rsi_signal: string;
  macd_signal_direction: string;
  sma_trend: string;
}

export interface PredictionResult {
  ticker: string;
  prediction: 'UP' | 'DOWN';
  direction_code: number;
  up_probability: number;
  down_probability: number;
  confidence: 'High' | 'Moderate' | 'Low';
  model_name: string;
  latest_date: string;
  latest_close: number;
}

export interface HistoricalDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma_20: number | null;
  sma_50: number | null;
  ema_20: number | null;
  ema_50: number | null;
  bb_high: number | null;
  bb_low: number | null;
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
}

export interface ModelMetricDetail {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number | null;
}

export interface ModelMetricsResponse {
  ticker: string;
  selected_model: string;
  validation: Record<string, ModelMetricDetail>;
  test: ModelMetricDetail;
}

export interface StockAnalysisResponse {
  quote: StockQuote;
  prediction: PredictionResult;
  indicators: IndicatorSummary;
  history: HistoricalDataPoint[];
  model_metrics?: ModelMetricsResponse;
}

export interface TrainResponse {
  status: string;
  message: string;
  ticker: string;
  selected_model: string;
  metrics: {
    selected_model: string;
    validation: Record<string, ModelMetricDetail>;
    test: ModelMetricDetail;
  };
}
