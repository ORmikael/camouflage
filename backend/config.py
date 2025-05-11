


import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class PesapalConfig:
    ENV = os.getenv("FLASK_ENV", "development").lower()

    if ENV == "production":
        CONSUMER_KEY = os.getenv("PROD_PESAPAL_CONSUMER_KEY")
        CONSUMER_SECRET = os.getenv("PROD_PESAPAL_CONSUMER_SECRET")
        CALLBACK_URL = os.getenv("PROD_PESAPAL_CALLBACK_URL")
        IPN_NOTIFICATION_URL = os.getenv("PROD_PESAPAL_IPN_URL")
        NOTIFICATION_ID = os.getenv("PROD_PESAPAL_NOTIFICATION_ID")
        BASE_URL = os.getenv("PROD_PESAPAL_URL")
    else:
        CONSUMER_KEY = os.getenv("DEV_PESAPAL_CONSUMER_KEY")
        CONSUMER_SECRET = os.getenv("DEV_PESAPAL_CONSUMER_SECRET")
        CALLBACK_URL = os.getenv("DEV_PESAPAL_CALLBACK_URL")
        IPN_URL = os.getenv("DEV_PESAPAL_IPN_URL")
        NOTIFICATION_ID = os.getenv("DEV_PESAPAL_NOTIFICATION_ID")
        BASE_URL = os.getenv("DEV_PESAPAL_URL")


    AUTH_URL = f"{BASE_URL}api/Auth/RequestToken"
    SUBMIT_ORDER_URL = f"{BASE_URL}api/Transactions/SubmitOrderRequest"
    GET_STATUS_URL = f"{BASE_URL}api/Transactions/GetTransactionStatus"

 
