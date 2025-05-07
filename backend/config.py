import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Base config structure
class PesapalConfig:
    FLASK_ENV = os.getenv("PESAPAL_ENV", "development").lower()
    CONSUMER_KEY = os.getenv("PESAPAL_CONSUMER_KEY")
    CONSUMER_SECRET = os.getenv("PESAPAL_CONSUMER_SECRET")
    CALLBACK_URL = os.getenv("PESAPAL_CALLBACK_URL")
    IPN_URL = os.getenv("PESAPAL_IPN_URL")
    NOTIFICATION_ID = os.getenv("PESAPAL_NOTIFICATION_ID")

    BASE_URL = os.getenv("PESAPAL_PROD_URL") if FLASK_ENV == "production" else os.getenv("PESAPAL_DEV_URL")

    AUTH_URL = f"{BASE_URL}/pesapalv3/api/Auth/RequestToken"
    SUBMIT_ORDER_URL = f"{BASE_URL}/pesapalv3/api//Transactions/SubmitOrderRequest"
    GET_STATUS_URL = f"{BASE_URL}/pesapalv3/api/Transactions/GetTransactionStatus"
    GET_DETAILS_URL = f"{BASE_URL}/pesapalv3/api//Transactions/GetTransactionDetails"
