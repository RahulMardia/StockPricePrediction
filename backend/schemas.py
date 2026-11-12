from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class StockQuote(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    change: float
    change_percent: float
    day_high: float
    day_low: float
    open_price: float
    previous_close: float
    volume: int
    latest_date: str


class IndicatorSummary(BaseModel):
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_diff: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_20: Optional[float] = None
    ema_50: Optional[float] = None
    bb_high: Optional[float] = None
    bb_low: Optional[float] = None
    bb_middle: Optional[float] = None
    rsi_signal: str  # "Overbought", "Oversold", "Neutral"
    macd_signal_direction: str  # "Bullish", "Bearish", "Neutral"
    sma_trend: str  # "Bullish (Golden)", "Bearish (Death)", "Neutral"


class PredictionResult(BaseModel):
    ticker: str
    prediction: str  # "UP" or "DOWN"
    direction_code: int  # 1 or 0
    up_probability: float  # e.g. 58.4
    down_probability: float  # e.g. 41.6
    confidence: str  # "High", "Moderate", "Low"
    model_name: str
    latest_date: str
    latest_close: float


class HistoricalDataPoint(BaseModel):
    time: str  # "YYYY-MM-DD"
    open: float
    high: float
    low: float
    close: float
    volume: int
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    ema_20: Optional[float] = None
    ema_50: Optional[float] = None
    bb_high: Optional[float] = None
    bb_low: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    macd_signal: Optional[float] = None


class ModelMetricDetail(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: Optional[float] = None


class ModelMetricsResponse(BaseModel):
    ticker: str
    selected_model: str
    validation: Dict[str, ModelMetricDetail]
    test: ModelMetricDetail


class StockAnalysisResponse(BaseModel):
    quote: StockQuote
    prediction: PredictionResult
    indicators: IndicatorSummary
    history: List[HistoricalDataPoint]
    model_metrics: Optional[ModelMetricsResponse] = None


class TrainRequest(BaseModel):
    ticker: str


class TrainResponse(BaseModel):
    status: str
    message: str
    ticker: str
    selected_model: str
    metrics: Dict[str, Any]
