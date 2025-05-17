
# ===============================
# DATABASE CONNECTION MODULE
# ===============================

from pymongo import MongoClient
from config import PesapalConfig
import os
import certifi
os.environ["SSL_CERT_FILE"] = certifi.where()

def get_db():
    # USE RESOLVED CONFIG VALUES
    mongo_uri = PesapalConfig.MONGO_URI
    db_name = PesapalConfig.DB_NAME

    client = MongoClient(mongo_uri,tls=True, tlsCAFile=certifi.where())  # Force trusted CA bundle
    db = client[db_name]

    return db
