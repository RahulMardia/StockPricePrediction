import datetime
import pandas as pd
import numpy as np
import yfinance as yf
from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands

from backend.schemas import (
    StockQuote,
    IndicatorSummary,
    HistoricalDataPoint,
)

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


def fetch_stock_raw_data(symbol: str, period: str = "2y") -> pd.DataFrame:
    """Fetch daily OHLCV data from Yahoo Finance with local disk cache and seed fallback."""
    import os
    symbol_clean = symbol.upper().strip()
    cache_path = os.path.join("data", "raw", f"{symbol_clean.lower()}.csv")
    seed_path = os.path.join("data", "seeds", f"{symbol_clean.lower()}.csv")
    fallback_aapl = os.path.join("data", "seeds", "aapl.csv")
    df = pd.DataFrame()

    # Strategy 1: yf.Ticker history
    try:
        ticker = yf.Ticker(symbol_clean)
        df = ticker.history(period=period, interval="1d", auto_adjust=True)

        if df.empty:
            for fallback_period in ["1y", "6mo"]:
                try:
                    df = ticker.history(period=fallback_period, interval="1d", auto_adjust=True)
                    if not df.empty:
                        break
                except Exception:
                    continue
    except Exception as e:
        print(f"yfinance ticker history warning for {symbol_clean}: {e}")

    # Strategy 2: yf.download fallback
    if df.empty:
        try:
            print(f"Attempting yf.download for {symbol_clean}...")
            df = yf.download(symbol_clean, period=period, auto_adjust=True, progress=False)
            if isinstance(df.columns, pd.MultiIndex):
                # Flatten multi-index columns if returned
                df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]
        except Exception as e:
            print(f"yf.download warning for {symbol_clean}: {e}")

    # Strategy 3: Local cached raw file
    if df.empty and os.path.exists(cache_path):
        print(f"Loading cached stock data from {cache_path}")
        df = pd.read_csv(cache_path)
        if "Unnamed: 0" in df.columns:
            df = df.drop(columns=["Unnamed: 0"])

    # Strategy 4: Packaged seed file
    if df.empty and os.path.exists(seed_path):
        print(f"Loading seed stock data from {seed_path}")
        df = pd.read_csv(seed_path)
        if "Unnamed: 0" in df.columns:
            df = df.drop(columns=["Unnamed: 0"])

    # Strategy 5: Default fallback to AAPL seed if all else fails
    if df.empty and os.path.exists(fallback_aapl):
        print(f"Using default seed data from {fallback_aapl}")
        df = pd.read_csv(fallback_aapl)
        if "Unnamed: 0" in df.columns:
            df = df.drop(columns=["Unnamed: 0"])

    # Cache successful online fetch
    if not df.empty and not os.path.exists(cache_path):
        os.makedirs(os.path.join("data", "raw"), exist_ok=True)
        try:
            df.to_csv(cache_path)
        except Exception:
            pass

    if df.empty:
        raise ValueError(
            f"No market data found for ticker '{symbol}'. "
            "Please check your internet connection or verify the ticker symbol."
        )

    if "date" not in [str(c).lower() for c in df.columns] and df.index.name != "date":
        df = df.reset_index()

    # Normalize column names to lowercase
    df.columns = [str(col).lower() for col in df.columns]
    if "date" not in df.columns:
        if "index" in df.columns:
            df = df.rename(columns={"index": "date"})

    # Required columns
    required = ["date", "open", "high", "low", "close", "volume"]
    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"Market data is missing required columns: {missing}")

    df["date"] = pd.to_datetime(df["date"], utc=True)
    df = (
        df.dropna(subset=required)
        .drop_duplicates(subset=["date"])
        .sort_values("date")
        .set_index("date")
    )
    return df


def calculate_indicators(df: pd.DataFrame, include_target: bool = False) -> pd.DataFrame:
    """Calculate all technical indicators matching the ML pipeline."""
    data = df.copy()

    # Simple Moving Averages
    data["SMA_20"] = SMAIndicator(close=data["close"], window=20).sma_indicator()
    data["SMA_50"] = SMAIndicator(close=data["close"], window=50).sma_indicator()

    # Exponential Moving Averages
    data["EMA_20"] = EMAIndicator(close=data["close"], window=20).ema_indicator()
    data["EMA_50"] = EMAIndicator(close=data["close"], window=50).ema_indicator()

    # RSI
    data["RSI"] = RSIIndicator(close=data["close"], window=14).rsi()

    # MACD
    macd = MACD(close=data["close"], window_slow=26, window_fast=12, window_sign=9)
    data["MACD"] = macd.macd()
    data["MACD_Signal"] = macd.macd_signal()
    data["MACD_Diff"] = macd.macd_diff()

    # Bollinger Bands
    bb = BollingerBands(close=data["close"], window=20, window_dev=2)
    data["BB_High"] = bb.bollinger_hband()
    data["BB_Low"] = bb.bollinger_lband()
    data["BB_Middle"] = bb.bollinger_mavg()

    # Returns & Volatility
    data["Return_1D"] = data["close"].pct_change(1)
    data["Return_5D"] = data["close"].pct_change(5)
    data["Return_10D"] = data["close"].pct_change(10)
    data["High_Low_Range"] = (data["high"] - data["low"]) / data["close"]
    data["Open_Close_Range"] = (data["close"] - data["open"]) / data["open"]
    data["Volume_Change"] = data["volume"].pct_change()

    if include_target:
        data["Target"] = (data["close"].shift(-1) > data["close"]).astype(int)
        data = data.dropna()
    else:
        # Drop rows where indicators cannot be computed (first 50 rows)
        data = data.dropna(subset=FEATURE_COLUMNS)

    return data


def get_quote_info(symbol: str, raw_df: pd.DataFrame) -> StockQuote:
    """Extract quote details from yfinance ticker and recent dataframe."""
    ticker_upper = symbol.upper().strip()
    latest_row = raw_df.iloc[-1]
    prev_row = raw_df.iloc[-2] if len(raw_df) > 1 else latest_row

    current_price = round(float(latest_row["close"]), 2)
    prev_close = round(float(prev_row["close"]), 2)
    change = round(current_price - prev_close, 2)
    change_pct = round((change / prev_close) * 100, 2) if prev_close != 0 else 0.0

    company_name = ticker_upper
    try:
        yf_ticker = yf.Ticker(ticker_upper)
        info = yf_ticker.info or {}
        company_name = info.get("shortName") or info.get("longName") or ticker_upper
    except Exception:
        pass

    latest_date_str = raw_df.index[-1].strftime("%Y-%m-%d")

    return StockQuote(
        ticker=ticker_upper,
        company_name=company_name,
        current_price=current_price,
        change=change,
        change_percent=change_pct,
        day_high=round(float(latest_row["high"]), 2),
        day_low=round(float(latest_row["low"]), 2),
        open_price=round(float(latest_row["open"]), 2),
        previous_close=prev_close,
        volume=int(latest_row["volume"]),
        latest_date=latest_date_str,
    )


def get_indicator_summary(feature_df: pd.DataFrame) -> IndicatorSummary:
    """Get the latest indicator values and signal interpretations."""
    if feature_df.empty:
        return IndicatorSummary(
            rsi_signal="Neutral",
            macd_signal_direction="Neutral",
            sma_trend="Neutral",
        )

    latest = feature_df.iloc[-1]

    def _val(col):
        v = latest.get(col)
        return round(float(v), 2) if pd.notnull(v) else None

    rsi_val = _val("RSI")
    macd_val = _val("MACD")
    macd_sig = _val("MACD_Signal")
    sma_20 = _val("SMA_20")
    sma_50 = _val("SMA_50")

    # Interpret signals
    rsi_signal = "Neutral"
    if rsi_val is not None:
        if rsi_val >= 70:
            rsi_signal = "Overbought (Potential Reversal Down)"
        elif rsi_val <= 30:
            rsi_signal = "Oversold (Potential Reversal Up)"
        else:
            rsi_signal = "Neutral Momentum"

    macd_dir = "Neutral"
    if macd_val is not None and macd_sig is not None:
        if macd_val > macd_sig:
            macd_dir = "Bullish (MACD above Signal)"
        else:
            macd_dir = "Bearish (MACD below Signal)"

    sma_trend = "Neutral"
    if sma_20 is not None and sma_50 is not None:
        if sma_20 > sma_50:
            sma_trend = "Bullish Trend (SMA 20 > SMA 50)"
        else:
            sma_trend = "Bearish Trend (SMA 20 < SMA 50)"

    return IndicatorSummary(
        rsi=rsi_val,
        macd=macd_val,
        macd_signal=macd_sig,
        macd_diff=_val("MACD_Diff"),
        sma_20=sma_20,
        sma_50=sma_50,
        ema_20=_val("EMA_20"),
        ema_50=_val("EMA_50"),
        bb_high=_val("BB_High"),
        bb_low=_val("BB_Low"),
        bb_middle=_val("BB_Middle"),
        rsi_signal=rsi_signal,
        macd_signal_direction=macd_dir,
        sma_trend=sma_trend,
    )


def format_chart_history(df: pd.DataFrame, feature_df: pd.DataFrame) -> list[HistoricalDataPoint]:
    """Combine raw price and calculated indicators for candlestick charts."""
    combined = df.copy()

    # Join indicator columns
    for col in ["SMA_20", "SMA_50", "EMA_20", "EMA_50", "BB_High", "BB_Low", "RSI", "MACD", "MACD_Signal"]:
        if col in feature_df.columns:
            combined[col] = feature_df[col]

    # Limit to the last 250 trading days for snappy frontend rendering
    combined = combined.tail(250)

    result = []
    for dt, row in combined.iterrows():
        def _safe_float(key):
            val = row.get(key)
            if pd.notnull(val):
                return round(float(val), 2)
            return None

        time_str = dt.strftime("%Y-%m-%d") if hasattr(dt, "strftime") else str(dt)[:10]
        result.append(
            HistoricalDataPoint(
                time=time_str,
                open=round(float(row["open"]), 2),
                high=round(float(row["high"]), 2),
                low=round(float(row["low"]), 2),
                close=round(float(row["close"]), 2),
                volume=int(row["volume"]),
                sma_20=_safe_float("SMA_20"),
                sma_50=_safe_float("SMA_50"),
                ema_20=_safe_float("EMA_20"),
                ema_50=_safe_float("EMA_50"),
                bb_high=_safe_float("BB_High"),
                bb_low=_safe_float("BB_Low"),
                rsi=_safe_float("RSI"),
                macd=_safe_float("MACD"),
                macd_signal=_safe_float("MACD_Signal"),
            )
        )
    return result
