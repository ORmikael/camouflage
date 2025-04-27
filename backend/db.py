# db.py
from pymongo import MongoClient
import os

# Replace with your MongoDB URI (local or from Atlas)
def get_db():
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(mongo_uri)
    db = client["highlights"]
    return db
