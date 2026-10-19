import os
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

BASE_URL = "https://www.alphavantage.co/query"

def download_stock_data(symbol):
    print(f"Downloading data for {symbol}....")

    if not API_KEY:
        raise ValueError(
            "API key missing. Check your .env file."
        )
    
    params = {
        "function":"TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": API_KEY,
        "datatype":"json",
        "outputsize": "full",
    }

    response = requests.get(BASE_URL,params,timeout=30)
    response.raise_for_status()

    data = response.json()
    if "Error Message" in data:
        raise ValueError(data["Error Message"])

    if "Note" in data:
        raise ValueError(
            f"API rate limit message: {data['Note']}"
        )

    if "Information" in data:
        raise ValueError(data["Information"])

    time_series = data.get("Time Series (Daily)")

    if not time_series:
        raise ValueError(
            f"No stock data returned. Response: {data}"
        )

    df = pd.DataFrame.from_dict(
        time_series,
        orient="index"
    )

    df.index = pd.to_datetime(df.index)

    df = df.sort_index()

    df = df.reset_index()

    df.rename(columns={"index": "Date"}, inplace=True)

    df.columns = [
        "Date",
        "open",
        "high",
        "low",
        "close",
        "volume"
    ]

    os.makedirs("data/raw", exist_ok=True)

    filename = symbol.replace(".","_").lower()

    filepath = f"data/raw/{filename}.csv"

    df.to_csv(filepath)

    print(f"Downloaded {len(df)} rows")
    print(f"Saved to: {filepath}")

    return df

if __name__ == "__main__":
    download_stock_data("AAPL")
