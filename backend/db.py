
# # ===============================
# # DATABASE CONNECTION MODULE
# # ===============================



import os
import certifi
from pymongo import MongoClient
from config import PesapalConfig
os.environ["SSL_CERT_FILE"] = certifi.where()


# ===============================
# ENVIRONMENT SETUP
# ===============================
ENV = os.environ.get("FLASK_ENV", "development").lower()

# ===============================
# DATABASE CONNECTION
# ===============================
def get_db():  
    # USE RESOLVED CONFIG VALUES
    mongo_uri = PesapalConfig.MONGO_URI
    db_name = PesapalConfig.DB_NAME
    try:
        if ENV == "production":
            print("[DB] Production mode - using TLS connection")
            client = MongoClient(
                mongo_uri,
                tls=True,
                tlsCAFile=certifi.where()
            )
        else:
            print("[DB] Development mode - using local non-TLS connection")
            client = MongoClient(mongo_uri)
    
        db = client[db_name]
        booking_collection = db["bookings"]
    
        # ===============================
        # ENSURE UNIQUE BOOKING INDEX
        # ===============================
        booking_collection.create_index(
            [("email", 1), ("date", 1)],
            unique=True
        )
    
        print(f"[DB] Connected to DB: {db.name}")
    
    except Exception as e:
        print(f"[DB] Connection error: {e}")
    return db