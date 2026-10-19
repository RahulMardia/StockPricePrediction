
import os
import pandas as pd
import yfinance as yf


def download_stock_data(symbol="AAPL"):
    print(f"Downloading historical data for {symbol}...")

    ticker = yf.Ticker(symbol)
    df = pd.DataFrame()

    # Try longer history first, then fall back if necessary
    for period in ["5y", "2y", "1y"]:
        try:
            print(f"Trying period: {period}")

            df = ticker.history(
                period=period,
                interval="1d",
                auto_adjust=True,
            )

            if not df.empty:
                print(f"Successfully retrieved data for {period}")
                break

        except Exception as error:
            print(f"Request failed for {period}: {error}")

    if df.empty:
        raise ValueError(
            "Yahoo Finance returned no historical data. "
            "Check your connection and try again."
        )

    # Keep the columns required by our ML pipeline
    required_columns = [
        "Open", "High", "Low", "Close", "Volume"
    ]

    missing = set(required_columns) - set(df.columns)

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df = df[required_columns].copy()
    df.index.name = "date"
    df = df.reset_index()

    df.columns = [str(col).lower() for col in df.columns]

    df = df.dropna(
        subset=["date", "open", "high", "low", "close", "volume"]
    )

    os.makedirs("data/raw", exist_ok=True)

    filepath = f"data/raw/{symbol.lower()}.csv"
    df.to_csv(filepath, index=False)

    print(f"\nDownloaded {len(df)} rows")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")
    print(f"Saved to: {filepath}")
    print(df.tail())

    return df


if __name__ == "__main__":
    download_stock_data("AAPL")
