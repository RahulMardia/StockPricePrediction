"""
Launcher script to run the Stock Price Prediction Web App.
This serves the FastAPI backend and built React frontend on http://localhost:8000
"""

import os
import sys
import webbrowser
import uvicorn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def main():
    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"

    print("=" * 60)
    print("🚀 Starting StockPulse AI Web Application")
    print("=" * 60)
    print(f"Server URL:         {url}")
    print(f"Interactive API Docs: {url}/docs")
    print(f"Health Check:       {url}/api/health")
    print("=" * 60)
    print("Press Ctrl+C to stop the server.\n")

    # Open browser automatically after a short delay
    try:
        webbrowser.open(url)
    except Exception:
        pass

    uvicorn.run("backend.app:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
