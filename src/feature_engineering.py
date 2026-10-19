
import pandas as pd
import numpy as np

from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands


FEATURE_COLUMNS = [
    "Return_1D",
    "Return_5D",
    "Return_10D",
    "SMA_20",
    "SMA_50",
    "EMA_20",
    "EMA_50",
    "RSI",
    "MACD",
    "MACD_Signal",
    "MACD_Diff",
    "BB_High",
    "BB_Low",
    "BB_Middle",
    "High_Low_Range",
    "Open_Close_Range",
    "Volume_Change",
]


def load_stock_data(filepath):
    df = pd.read_csv(filepath)

    # Handle the extra index column written by to_csv()
    df = df.loc[
        :, ~df.columns.str.startswith("Unnamed:")
    ]

    # Support both raw Alpha Vantage names and renamed columns
    df = df.rename(columns={
        "1. open": "open",
        "2. high": "high",
        "3. low": "low",
        "4. close": "close",
        "5. volume": "volume",
        "Date": "date",
    })

    # Normalize column names
    df.columns = [col.lower().strip() for col in df.columns]

    required = [
        "date", "open", "high", "low", "close", "volume"
    ]

    missing = set(required) - set(df.columns)

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df["date"] = pd.to_datetime(df["date"], utc=True)

    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = (
        df.dropna(subset=required)
        .drop_duplicates(subset=["date"])
        .sort_values("date")
        .set_index("date")
    )

    return df


def create_features(df, include_target=True):
    df = df.copy()

    # Returns
    df["Return_1D"] = df["close"].pct_change(1)
    df["Return_5D"] = df["close"].pct_change(5)
    df["Return_10D"] = df["close"].pct_change(10)

    # Trend indicators
    df["SMA_20"] = SMAIndicator(
        df["close"], window=20
    ).sma_indicator()

    df["SMA_50"] = SMAIndicator(
        df["close"], window=50
    ).sma_indicator()

    df["EMA_20"] = EMAIndicator(
        df["close"], window=20
    ).ema_indicator()

    df["EMA_50"] = EMAIndicator(
        df["close"], window=50
    ).ema_indicator()

    # Momentum indicators
    df["RSI"] = RSIIndicator(
        df["close"], window=14
    ).rsi()

    macd = MACD(df["close"])

    df["MACD"] = macd.macd()
    df["MACD_Signal"] = macd.macd_signal()
    df["MACD_Diff"] = macd.macd_diff()

    # Volatility indicators
    bb = BollingerBands(
        df["close"], window=20, window_dev=2
    )

    df["BB_High"] = bb.bollinger_hband()
    df["BB_Low"] = bb.bollinger_lband()
    df["BB_Middle"] = bb.bollinger_mavg()

    # Price relationships
    df["High_Low_Range"] = (
        df["high"] - df["low"]
    ) / df["close"]

    df["Open_Close_Range"] = (
        df["close"] - df["open"]
    ) / df["open"]

    df["Volume_Change"] = df["volume"].pct_change()

    # Target: Will the next trading day's close be higher?
    if include_target:
        df["Target"] = (
            df["close"].shift(-1) > df["close"]
        ).astype(int)

    df = df.replace([np.inf, -np.inf], np.nan)

    # Drop rows where indicators cannot yet be calculated
    df = df.dropna(subset=FEATURE_COLUMNS)

    # For training, the final row has no known future outcome
    if include_target:
        df = df.iloc[:-1]

    return df
