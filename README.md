# StockPulse AI - Stock Price Direction Predictor Web App

A full-stack, machine learning-powered web application that uses historical stock market data and technical indicators to forecast the next trading day's stock price direction (**UP** or **DOWN**).

The app features an interactive **React + TypeScript + Tailwind CSS** frontend with TradingView-style financial charts and a high-performance **FastAPI** backend supporting on-demand stock inference, technical indicator calculation, and automated model re-training.

---

## 🌟 Key Features

- **Live Market Data & Ticker Lookup**: Search and analyze any stock ticker (e.g. `AAPL`, `MSFT`, `NVDA`, `TSLA`, `GOOGL`, `AMZN`) via Yahoo Finance with local disk caching and offline fallback.
- **Direction & Confidence Forecasting**: Predicts next-day direction with exact class probabilities (UP % vs DOWN %) and confidence ratings.
- **Interactive Candlestick & Volume Charts**: Powered by TradingView's Lightweight Charts with overlay toggles for:
  - 20-day & 50-day Simple Moving Averages (SMA)
  - 20-day Exponential Moving Average (EMA)
  - Bollinger Bands (20-day, 2 standard deviations)
- **Deep Technical Indicator Analytics**: Real-time signal interpretation for:
  - Relative Strength Index (RSI 14) with Overbought/Oversold zones
  - Moving Average Convergence Divergence (MACD, Signal, Histogram)
  - Moving Average Trends (Bullish/Bearish crossover signals)
  - Volatility Range Envelopes
- **Machine Learning Benchmark & Studio**:
  - Compares **Logistic Regression**, **Random Forest**, and **XGBoost** with chronological train/validation/test splits (70/15/15).
  - Displays validation metrics: Accuracy, Precision, Recall, F1-Score, and ROC-AUC.
  - Interactive **Train Models** studio modal to fit and benchmark models dynamically on any ticker.

---

## 🏗 Architecture & Tech Stack

```text
StockPricePrediction/
├── backend/
│   ├── app.py                     # FastAPI application & API endpoints
│   ├── schemas.py                 # Pydantic request & response models
│   └── services/
│       ├── stock_service.py       # Data retrieval & 17 technical indicators (ta)
│       └── ml_service.py          # ML inference, pipeline evaluation & training
│
├── frontend/
│   ├── src/
│   │   ├── components/            # UI components (Chart, Prediction, Overview, etc.)
│   │   ├── services/api.ts        # Typed API client
│   │   ├── types.ts               # Shared TypeScript interfaces
│   │   ├── App.tsx                # Main dashboard view
│   │   └── index.css              # Custom styling & Tailwind directives
│   ├── dist/                      # Pre-built production bundle served by FastAPI
│   ├── package.json
│   └── vite.config.ts
│
├── models/                        # Persisted joblib model artifacts
│   └── best_model.pkl
├── reports/                       # Validation & benchmark metrics
│   └── metrics.json
├── data/                          # Raw & processed historical datasets
├── run_app.py                     # One-click launcher script
└── requirements.txt
```

### Technologies

- **Backend**: Python 3.12, FastAPI, Uvicorn, Scikit-learn, XGBoost, Pandas, NumPy, TA (Technical Analysis library), YFinance, Joblib.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, TradingView Lightweight Charts.

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have Python 3.10+ and Node.js 18+ installed on your system.

### 2. Environment Setup

Activate your Python virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

---

## 🏃 Running the Application

### Option A: One-Click Run (Serves Backend & Built Frontend)

Run the Python launcher script:

```bash
python run_app.py
```

- **Web App**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option B: Development Mode (Hot Reloading)

If you are developing the frontend and backend simultaneously:

1. **Start the FastAPI backend** in one terminal:
   ```bash
   python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
   ```

2. **Start the Vite frontend dev server** in another terminal:
   ```bash
   cd frontend
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173). Vite will automatically proxy API requests to port 8000.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint. |
| `GET` | `/api/stock/{symbol}` | Full analysis payload (Quote, Prediction, Indicators, History, Model Metrics). |
| `GET` | `/api/stock/{symbol}/prediction` | Next-day direction (UP/DOWN) and class probability scores. |
| `GET` | `/api/stock/{symbol}/history` | Historical candlestick data with technical indicator overlays. |
| `GET` | `/api/models/metrics?ticker=AAPL` | Validation and test benchmark metrics for all algorithms. |
| `POST` | `/api/models/train` | Triggers on-demand training of models for any stock ticker. |

---

## ⚠️ Disclaimer

This application is built for research, educational, and informational purposes only. The predictions generated by the machine learning models reflect statistical pattern analysis of historical data and do not constitute financial advice or guaranteed trading signals.
