import os
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv(ALPHA_VANTAGE_API_KEY)

BASE_URL = "https://www.alphavantage.co/query"