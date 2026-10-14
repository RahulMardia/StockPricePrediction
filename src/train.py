
import os
import json
import joblib
import pandas as pd

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

from feature_engineering import (
    load_stock_data,
    create_features,
    FEATURE_COLUMNS,
)


TICKER = "AAPL"
RAW_PATH = f"data/raw/{TICKER.lower()}.csv"


def calculate_metrics(model, X, y):
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)[:, 1]

    return {
        "accuracy": round(accuracy_score(y, predictions), 4),
        "precision": round(
            precision_score(y, predictions, zero_division=0), 4
        ),
        "recall": round(
            recall_score(y, predictions, zero_division=0), 4
        ),
        "f1": round(
            f1_score(y, predictions, zero_division=0), 4
        ),
        "roc_auc": (
            round(roc_auc_score(y, probabilities), 4)
            if y.nunique() == 2 else None
        ),
    }


def main():
    if not os.path.exists(RAW_PATH):
        raise FileNotFoundError(
            f"{RAW_PATH} not found. Run data_collection.py first."
        )

    raw_df = load_stock_data(RAW_PATH)
    df = create_features(raw_df)

    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    df.to_csv(
        f"data/processed/{TICKER.lower()}_features.csv"
    )

    if len(df) < 60:
        raise ValueError(
            f"Only {len(df)} usable rows remain. "
            "Download more historical data before training."
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
        raise ValueError(
            "Training data contains only one target class."
        )

    models = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(
                max_iter=2000, class_weight="balanced"
            )),
        ]),

        "Random Forest": RandomForestClassifier(
            n_estimators=300,
            max_depth=5,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=42,
        ),

        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=3,
            learning_rate=0.03,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42,
        ),
    }

    validation_results = {}

    for name, model in models.items():
        model.fit(X_train, y_train)

        metrics = calculate_metrics(model, X_val, y_val)
        validation_results[name] = metrics

        print(f"\n{name} — Validation")
        print(metrics)

    # Choose the model with the best validation ROC-AUC
    # If ROC-AUC is unavailable, use F1 as a fallback.
    def selection_score(item):
        metrics = item[1]
        if metrics["roc_auc"] is not None:
            return metrics["roc_auc"]
        return metrics["f1"]

    best_name = max(
        validation_results.items(),
        key=selection_score,
    )[0]

    best_model = models[best_name]

    # Evaluate on the untouched test set
    test_metrics = calculate_metrics(
        best_model, X_test, y_test
    )

    print(f"\nSelected model: {best_name}")
    print("Final test metrics:")
    print(test_metrics)

    artifact = {
        "model": best_model,
        "features": FEATURE_COLUMNS,
        "ticker": TICKER,
        "model_name": best_name,
    }

    joblib.dump(artifact, "models/best_model.pkl")

    with open("reports/metrics.json", "w") as f:
        json.dump({
            "validation": validation_results,
            "selected_model": best_name,
            "test": test_metrics,
        }, f, indent=4)

    print("\nSaved model: models/best_model.pkl")
    print("Saved metrics: reports/metrics.json")


if __name__ == "__main__":
    main()
