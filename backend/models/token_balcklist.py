from flask import current_app
from pymongo import MongoClient
from datetime import datetime

def get_db():
    client = MongoClient(current_app.config["MONGO_URI"])
    return client[current_app.config["DB_NAME"]]

def blacklist_token(jti, exp_timestamp):
    db = get_db()
    db.jwt_blacklist.insert_one({
        "jti": jti,
        "expires_at": datetime.utcfromtimestamp(exp_timestamp)
    })

def is_token_blacklisted(jti):
    db = get_db()
    return db.jwt_blacklist.find_one({"jti": jti}) is not None
