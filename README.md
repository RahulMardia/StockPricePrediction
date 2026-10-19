# Stock Price Prediction Using Machine Learning

A Python-based machine learning project that uses historical stock market data and technical indicators to predict the next trading day's stock price direction (UP or DOWN).

The project downloads historical data, performs feature engineering, trains multiple machine learning models, compares their performance, and generates predictions using the best model selected during validation.

## Features

- Historical stock data collection using Yahoo Finance.
- Data cleaning and preprocessing using Pandas and NumPy.
- Technical indicator calculation:
  - Simple Moving Average (SMA)
  - Exponential Moving Average (EMA)
  - Relative Strength Index (RSI)
  - Moving Average Convergence Divergence (MACD)
  - Bollinger Bands
- Daily, 5-day, and 10-day return calculations.
- Chronological training, validation, and test splits.
- Comparison of multiple machine learning algorithms.
- Model evaluation using classification metrics.
- Model persistence using Joblib.
- Stock direction prediction using the latest available historical data.

## Machine Learning Models

The project compares the following models:

1. **Logistic Regression** — Baseline classification model.
2. **Random Forest** — Ensemble learning model.
3. **XGBoost** — Gradient boosting classifier.

The best model is selected using validation performance and saved for future predictions.

## Tech Stack

- Python
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- Yahoo Finance (`yfinance`)
- Technical Analysis Library (`ta`)
- Joblib
- Matplotlib

## Project Structure

```text
StockPricePrediction/
│
├── data/
│   ├── raw/
│   │   └── aapl.csv
│   └── processed/
│       └── aapl_features.csv
│
├── models/
│   └── best_model.pkl
│
├── reports/
│   ├── metrics.json
│   └── confusion_matrix.png
│
├── src/
│   ├── download_historical_data.py
│   ├── feature_engineering.py
│   ├── train.py
│   ├── evaluate.py
│   └── predict.py
│
├── requirements.txt
├── README.md
└── .gitignore
```

The generated model, dataset, and report files appear after running the relevant scripts.

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd StockPricePrediction
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```cmd
venv\Scripts\activate.bat
```

### 4. Install dependencies

```bash
python -m pip install -r requirements.txt
```

## Usage

Run the following commands from the project root directory.

### Step 1: Download historical stock data

```bash
python src/download_historical_data.py
```

The default stock is Apple (`AAPL`). The downloaded data is saved to `data/raw/aapl.csv`.

### Step 2: Train and compare models

```bash
python src/train.py
```

This step generates technical indicators, creates the target variable, splits the data chronologically, trains the models, evaluates validation performance, and saves the selected model.

Generated files include:

- `data/processed/aapl_features.csv`
- `models/best_model.pkl`
- `reports/metrics.json`

### Step 3: Evaluate model performance

```bash
python src/evaluate.py
```

This displays the validation and test metrics saved during training.

### Step 4: Generate a prediction

```bash
python src/predict.py
```

The script loads the saved model and predicts whether the next trading day's closing price will be higher or lower than the latest available closing price.

## Target Variable

The model uses a binary classification target:

- `1` — The next trading day's closing price is higher than today's closing price.
- `0` — The next trading day's closing price is equal to or lower than today's closing price.

## Evaluation Metrics

The models are evaluated using:

- **Accuracy:** Overall proportion of correct predictions.
- **Precision:** Proportion of predicted UP days that were actually UP.
- **Recall:** Proportion of actual UP days correctly identified.
- **F1-score:** Harmonic mean of precision and recall.
- **ROC-AUC:** Measures the model's ability to distinguish between the two classes.

The project uses chronological data splits to reduce the risk of future information leaking into model training.

## Limitations

- Historical price patterns do not guarantee future price movements.
- Model performance can change across different market conditions.
- Classification probabilities may not represent calibrated real-world probabilities.
- Yahoo Finance data is used for historical research and is not a guaranteed real-time trading feed.
- The current implementation predicts price direction rather than an exact future price.
- The model has not been established as a profitable trading strategy.

## Future Improvements

- Add additional stocks and configurable ticker selection.
- Improve feature engineering and model selection.
- Implement walk-forward validation.
- Add probability calibration and baseline comparisons.
- Integrate a real-time market data API.
- Develop an interactive dashboard using Streamlit.
- Track prediction performance over time.

## Disclaimer

This project is intended for educational and research purposes only. Its predictions are experimental and should not be treated as financial advice or guaranteed trading signals.

## Author

Developed as a machine learning project to explore historical stock data analysis, technical indicators, and predictive modeling.
