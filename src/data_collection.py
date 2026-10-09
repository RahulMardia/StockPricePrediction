import os
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

BASE_URL = "https://www.alphavantage.co/query"

def download_stock_data(symbol):
    print(f"Downloading data for {symbol}....")

    params = {
        "function":"TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": API_KEY,
        "datatype":"json"
    }

    response = requests.get(BASE_URL,params)
    response.raise_for_status()

    data = response.json()

    if "Time Series (Daily)" not in data:
        print("API Error:")
        print(data)
        return None

    time_series = data["Time Series (Daily)"]

    df = pd.DataFrame.from_dict(
        time_series,
        orient="index"
    )

    df.index = pd.to_datetime(df.index)

    df = df.sort_index()

    df.columns = [
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
    download_stock_data("RELIANCE.BSE")
