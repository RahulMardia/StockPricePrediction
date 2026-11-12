import os
import sys
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure root directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.schemas import (
    StockAnalysisResponse,
    PredictionResult,
    ModelMetricsResponse,
    HistoricalDataPoint,
    TrainRequest,
    TrainResponse,
)
from backend.services.stock_service import (
    fetch_stock_raw_data,
    calculate_indicators,
    get_quote_info,
    get_indicator_summary,
    format_chart_history,
)
from backend.services.ml_service import (
    predict_stock,
    train_ticker_model,
    get_model_metrics,
)

app = FastAPI(
    title="Stock Price Direction Prediction API",
    description="Machine learning-powered stock prediction API using technical indicators and ensemble models.",
    version="1.0.0",
)

# CORS setup for Vite frontend dev server and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Stock Price Prediction API",
        "version": "1.0.0",
    }


@app.get("/api/stock/{symbol}", response_model=StockAnalysisResponse)
def get_stock_analysis(symbol: str):
    """Fetch complete stock analysis: quote, prediction, technical indicators, chart history, and model metrics."""
    try:
        raw_df = fetch_stock_raw_data(symbol, period="2y")
        feature_df = calculate_indicators(raw_df, include_target=False)

        quote = get_quote_info(symbol, raw_df)
        indicators = get_indicator_summary(feature_df)
        history = format_chart_history(raw_df, feature_df)
        prediction = predict_stock(symbol, feature_df)

        try:
            metrics = get_model_metrics(symbol)
        except Exception:
            metrics = None

        return StockAnalysisResponse(
            quote=quote,
            prediction=prediction,
            indicators=indicators,
            history=history,
            model_metrics=metrics,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process stock analysis: {str(e)}")


@app.get("/api/stock/{symbol}/history", response_model=list[HistoricalDataPoint])
def get_stock_history(symbol: str):
    """Retrieve historical OHLCV data with technical indicator overlays."""
    try:
        raw_df = fetch_stock_raw_data(symbol, period="2y")
        feature_df = calculate_indicators(raw_df, include_target=False)
        return format_chart_history(raw_df, feature_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stock/{symbol}/prediction", response_model=PredictionResult)
def get_stock_prediction(symbol: str):
    """Get direction prediction (UP/DOWN) and probability distribution for next trading day."""
    try:
        raw_df = fetch_stock_raw_data(symbol, period="1y")
        feature_df = calculate_indicators(raw_df, include_target=False)
        return predict_stock(symbol, feature_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/models/metrics", response_model=ModelMetricsResponse)
def get_metrics_endpoint(ticker: str = Query("AAPL", description="Ticker symbol")):
    """Get classification metrics for Logistic Regression, Random Forest, and XGBoost."""
    try:
        return get_model_metrics(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/models/train", response_model=TrainResponse)
def train_model_endpoint(req: TrainRequest):
    """Train new models on the latest historical data for the given ticker."""
    try:
        res = train_ticker_model(req.ticker)
        return TrainResponse(
            status="success",
            message=f"Model successfully trained and saved for {req.ticker.upper()}!",
            ticker=req.ticker.upper(),
            selected_model=res["selected_model"],
            metrics=res,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


# Serve static frontend in production if built
frontend_dist = os.path.join(BASE_DIR, "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=True)
