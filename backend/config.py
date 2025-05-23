


import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class PesapalConfig:
    ENV = os.getenv("FLASK_ENV", "development").lower()
    SECRET_KEY = os.getenv('SECRET_KEY')

    if ENV == "production":
        CONSUMER_KEY = os.getenv("PROD_PESAPAL_CONSUMER_KEY")
        CONSUMER_SECRET = os.getenv("PROD_PESAPAL_CONSUMER_SECRET")
        CALLBACK_URL = os.getenv("PROD_PESAPAL_CALLBACK_URL")
        IPN_URL = os.getenv("PROD_PESAPAL_IPN_URL")
        NOTIFICATION_ID = os.getenv("PROD_PESAPAL_NOTIFICATION_ID")
        BASE_URL = os.getenv("PROD_PESAPAL_URL")
        MEDIA_BASE_URL = os.getenv("PROD_MEDIA_BASE_URL")
        MONGO_URI = os.getenv('PROD_MONGO_URI')
        DB_NAME = os.getenv('PROD_DB_NAME')

    else:
        CONSUMER_KEY = os.getenv("DEV_PESAPAL_CONSUMER_KEY")
        CONSUMER_SECRET = os.getenv("DEV_PESAPAL_CONSUMER_SECRET")
        CALLBACK_URL = os.getenv("DEV_PESAPAL_CALLBACK_URL")
        IPN_URL = os.getenv("DEV_PESAPAL_IPN_URL")
        NOTIFICATION_ID = os.getenv("DEV_PESAPAL_NOTIFICATION_ID")
        BASE_URL = os.getenv("DEV_PESAPAL_URL")
        MEDIA_BASE_URL = os.getenv("DEV_MEDIA_BASE_URL")
        MONGO_URI =os.getenv('DEV_MONGO_URI')
        DB_NAME = os.getenv('DEV_DB_NAME')



    AUTH_URL = f"{BASE_URL}api/Auth/RequestToken"
    SUBMIT_ORDER_URL = f"{BASE_URL}api/Transactions/SubmitOrderRequest"
    GET_STATUS_URL = f"{BASE_URL}api/Transactions/GetTransactionStatus"
    GOOGLE_CREDENTIALS_PATH = os.getenv("GOOGLE_CREDENTIALS_PATH")


 
    EMAIL_HOST = os.environ.get("EMAIL_HOST")
    EMAIL_USER = os.environ.get("EMAIL_USER")
    EMAIL_PASS = os.environ.get("EMAIL_PASS")