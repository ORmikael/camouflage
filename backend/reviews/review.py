from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from pymongo import DESCENDING

from db import get_db  # Ensure `db` is imported from your main app context

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")
db = get_db()

# ==========================================
# FETCH REVIEWS (GET)
# ==========================================
@reviews_bp.route("/fetch", methods=["GET"])
def fetch_reviews():
    reviews = []

    try:
        for review in db["reviews"].find({}, {"_id": 0}).sort("created_at", DESCENDING):
            reviews.append(review)
        
        return jsonify({
            "status": "success",
            "message": "Reviews fetched successfully",
            "data": reviews
        }), 200

    except Exception as e:
        print(f"[REVIEWS][FETCH] Exception: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to fetch reviews"
        }), 500


# ==========================================
# CREATE REVIEW (POST)
# ==========================================
@reviews_bp.route("/create", methods=["POST"])
def create_review():
    try:
        data = request.get_json()
        user_id = data.get("user_id")

        # VALIDATE REQUIRED FIELDS
        if not user_id or not ObjectId.is_valid(user_id):
            return jsonify({"status": "error", "message": "Valid user_id is required"}), 400

        text = data.get("text")
        rating = data.get("rating")

        if not text or not rating:
            return jsonify({"status": "error", "message": "Text and rating are required"}), 400

        # ==========================================
        # DATABASE / SERVICE OPERATIONS
        # ==========================================
        user = db["users"].find_one({"_id": ObjectId(user_id)})

        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404

        review_doc = {
            "user_id": user_id,
            "name": user["name"],
            "email": user["email"],
            "avatar": user.get("avatar", "/static/images/avatars/default.jpg"),
            "text": text,
            "rating": rating,
            "created_at": datetime.utcnow()
        }

        db["reviews"].insert_one(review_doc)

        return jsonify({
            "status": "success",
            "message": "Review created successfully"
        }), 201

    except Exception as e:
        print(f"[REVIEWS][CREATE] Exception: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to create review"
        }), 500
