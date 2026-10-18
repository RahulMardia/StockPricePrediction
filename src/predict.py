
import os
import joblib

from feature_engineering import (
    load_stock_data,
    create_features,
)


TICKER = "AAPL"
RAW_PATH = f"data/raw/{TICKER.lower()}.csv"
MODEL_PATH = "models/best_model.pkl"


def main():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "Model not found. Run src/train.py first."
        )

    if not os.path.exists(RAW_PATH):
        raise FileNotFoundError(
            "Stock data not found. Run src/data_collection.py first."
        )

   
    artifact = joblib.load(MODEL_PATH)

    if artifact["ticker"] != TICKER:
        raise ValueError(
            f"Model is for {artifact['ticker']}, "
            f"not {TICKER}."
        )

    model = artifact["model"]
    feature_columns = artifact["features"]

    
    raw_df = load_stock_data(RAW_PATH)
    feature_df = create_features(
        raw_df,
        include_target=False,
    )

    if feature_df.empty:
        raise ValueError(
            "Not enough historical data to calculate indicators."
        )

    latest = feature_df.iloc[[-1]]
    X_latest = latest[feature_columns]

    prediction = int(model.predict(X_latest)[0])
    probabilities = model.predict_proba(X_latest)[0]

    up_probability = probabilities[
        list(model.classes_).index(1)
    ]

    down_probability = probabilities[
        list(model.classes_).index(0)
    ]

    latest_date = latest.index[-1]
    latest_close = latest["close"].iloc[0]

    print("\n========== STOCK PREDICTION ==========")
    print(f"Stock: {TICKER}")
    print(f"Latest data date: {latest_date.date()}")
    print(f"Latest closing price: ${latest_close:.2f}")
    print(f"Model: {artifact['model_name']}")
    print(
        f"UP probability: {up_probability * 100:.2f}%"
    )
    print(
        f"DOWN probability: {down_probability * 100:.2f}%"
    )
    print(
        "Predicted direction:",
        "UP" if prediction == 1 else "DOWN",
    )
    print("======================================")

    print(
        "\nThis is an experimental model output, "
        "not a guaranteed price movement or trading signal."
    )


if __name__ == "__main__":
    main()
