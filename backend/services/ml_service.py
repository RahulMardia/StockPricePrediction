import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from xgboost import XGBClassifier

from backend.schemas import (
    PredictionResult,
    ModelMetricsResponse,
    ModelMetricDetail,
)
from backend.services.stock_service import (
    FEATURE_COLUMNS,
    fetch_stock_raw_data,
    calculate_indicators,
)

MODELS_DIR = "models"
REPORTS_DIR = "reports"


def get_model_artifact_path(ticker: str) -> str:
    ticker_specific = os.path.join(MODELS_DIR, f"{ticker.lower()}_model.pkl")
    if os.path.exists(ticker_specific):
        return ticker_specific
    default_model = os.path.join(MODELS_DIR, "best_model.pkl")
    if os.path.exists(default_model):
        return default_model
    return ""


def calculate_metrics(model, X, y):
    predictions = model.predict(X)
    try:
        probabilities = model.predict_proba(X)[:, 1]
    except Exception:
        probabilities = None

    roc_auc = None
    if probabilities is not None and y.nunique() == 2:
        try:
            roc_auc = round(float(roc_auc_score(y, probabilities)), 4)
        except Exception:
            pass

    return {
        "accuracy": round(float(accuracy_score(y, predictions)), 4),
        "precision": round(float(precision_score(y, predictions, zero_division=0)), 4),
        "recall": round(float(recall_score(y, predictions, zero_division=0)), 4),
        "f1": round(float(f1_score(y, predictions, zero_division=0)), 4),
        "roc_auc": roc_auc,
    }


def train_ticker_model(ticker: str) -> dict:
    """Train ML models (Logistic Regression, Random Forest, XGBoost) for a ticker and save the best."""
    ticker_upper = ticker.upper().strip()
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)

    raw_df = fetch_stock_raw_data(ticker_upper, period="5y")
    df = calculate_indicators(raw_df, include_target=True)

    if len(df) < 80:
        raise ValueError(
            f"Insufficient historical data ({len(df)} rows). At least 80 trading days are needed."
        )

    X = df[FEATURE_COLUMNS]
    y = df["Target"]

    n = len(df)
    train_end = int(n * 0.70)
    val_end = int(n * 0.85)

    X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
    X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
    X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

    if y_train.nunique() < 2:
        raise ValueError("Training data contains only a single class label.")

    models = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42)),
        ]),
        "Random Forest": RandomForestClassifier(
            n_estimators=100, max_depth=5, min_samples_split=10, random_state=42
        ),
        "XGBoost": XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.05,
            eval_metric="logloss",
            random_state=42,
        ),
    }

    validation_results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        validation_results[name] = calculate_metrics(model, X_val, y_val)

    # Pick the best model based on validation F1 score, fallback to accuracy
    best_name = max(
        validation_results,
        key=lambda m: (validation_results[m]["f1"], validation_results[m]["accuracy"]),
    )
    best_model = models[best_name]

    test_metrics = calculate_metrics(best_model, X_test, y_test)

    artifact = {
        "ticker": ticker_upper,
        "model_name": best_name,
        "model": best_model,
        "features": FEATURE_COLUMNS,
        "validation_metrics": validation_results,
        "test_metrics": test_metrics,
    }

    model_path = os.path.join(MODELS_DIR, f"{ticker_upper.lower()}_model.pkl")
    joblib.dump(artifact, model_path)

    metrics_payload = {
        "ticker": ticker_upper,
        "selected_model": best_name,
        "validation": validation_results,
        "test": test_metrics,
    }

    report_path = os.path.join(REPORTS_DIR, f"{ticker_upper.lower()}_metrics.json")
    with open(report_path, "w") as f:
        json.dump(metrics_payload, f, indent=4)

    return metrics_payload


def predict_stock(ticker: str, feature_df: pd.DataFrame) -> PredictionResult:
    """Generate next-day direction prediction using trained model."""
    ticker_upper = ticker.upper().strip()
    model_path = get_model_artifact_path(ticker_upper)

    # If no model exists at all, train one on-the-fly
    if not model_path:
        train_ticker_model(ticker_upper)
        model_path = get_model_artifact_path(ticker_upper)

    artifact = joblib.load(model_path)
    model = artifact["model"]
    feature_cols = artifact["features"]
    model_name = artifact.get("model_name", "Machine Learning Model")

    if feature_df.empty:
        raise ValueError("Not enough historical data to generate features for prediction.")

    latest = feature_df.iloc[[-1]]
    X_latest = latest[feature_cols]

    prediction = int(model.predict(X_latest)[0])

    try:
        probabilities = model.predict_proba(X_latest)[0]
        classes = list(model.classes_)
        up_idx = classes.index(1) if 1 in classes else 0
        down_idx = classes.index(0) if 0 in classes else 1
        up_prob = round(float(probabilities[up_idx]) * 100, 1)
        down_prob = round(float(probabilities[down_idx]) * 100, 1)
    except Exception:
        up_prob = 60.0 if prediction == 1 else 40.0
        down_prob = 100.0 - up_prob

    # Confidence tiering
    highest_prob = max(up_prob, down_prob)
    if highest_prob >= 65.0:
        confidence = "High"
    elif highest_prob >= 55.0:
        confidence = "Moderate"
    else:
        confidence = "Low"

    latest_date_str = latest.index[-1].strftime("%Y-%m-%d")
    latest_close = round(float(latest["close"].iloc[0]), 2)

    return PredictionResult(
        ticker=ticker_upper,
        prediction="UP" if prediction == 1 else "DOWN",
        direction_code=prediction,
        up_probability=up_prob,
        down_probability=down_prob,
        confidence=confidence,
        model_name=model_name,
        latest_date=latest_date_str,
        latest_close=latest_close,
    )


def get_model_metrics(ticker: str) -> ModelMetricsResponse:
    """Retrieve model metrics for given ticker or general best model."""
    ticker_upper = ticker.upper().strip()
    report_path = os.path.join(REPORTS_DIR, f"{ticker_upper.lower()}_metrics.json")

    data = None
    if os.path.exists(report_path):
        with open(report_path, "r") as f:
            data = json.load(f)
    elif os.path.exists(os.path.join(REPORTS_DIR, "metrics.json")):
        with open(os.path.join(REPORTS_DIR, "metrics.json"), "r") as f:
            data = json.load(f)
            data["ticker"] = "AAPL"

    if not data:
        # Train and return
        data = train_ticker_model(ticker_upper)

    validation_map = {}
    for m_name, metrics in data.get("validation", {}).items():
        validation_map[m_name] = ModelMetricDetail(**metrics)

    test_metrics = ModelMetricDetail(**data.get("test", {}))

    return ModelMetricsResponse(
        ticker=data.get("ticker", ticker_upper),
        selected_model=data.get("selected_model", "Selected Model"),
        validation=validation_map,
        test=test_metrics,
    )
