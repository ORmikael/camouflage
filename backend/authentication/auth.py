from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from flask_bcrypt import Bcrypt
import jwt
from pymongo import MongoClient
from datetime import timedelta
import sys
from config import PesapalConfig as config
from models.token_balcklist import blacklist_token

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()
client = MongoClient(config.MONGO_URI)
db = client[config.DB_NAME]
users_col = db["users"]
team_col = db["team"]

# ===============================
# SIGNUP ROUTE (Normal Users Only)
# ===============================
@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if users_col.find_one({"email": email}):
            return jsonify({"status": "fail", "message": "Email already in use"}), 409

        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = {
            "name": name,
            "email": email,
            "password": hashed_pw,
            "role": "user",
            "avatar": "/static/images/avatars/janedoe.png",
            "stats": {
            "tours": 0,
            "reviews":0,
            "gems":0,
            "activities": [] ,    
            "highlights": [],   
            "badges": [],
                # Add default stat fields as needed
            }
        }

        result = users_col.insert_one(new_user)

        return jsonify({
            "status": "success",
            "message": "Account created",
            "user_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print(f"[SIGNUP ERROR] {e}", file=sys.stderr)
        return jsonify({"status": "error", "message": "Server error"}), 500


# ===============================
# USER + TEAM LOGIN ROUTE
# ===============================
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        # ===============================
        # SEARCH NORMAL USERS
        # ===============================
        user = users_col.find_one({"email": email})
        if user and bcrypt.check_password_hash(user['password'], password):
            role = user.get("role", "user")
            access_token = create_access_token(
                identity=str(user["_id"]),  # MUST BE STRING
                additional_claims={
                    "role": user.get("role", "user"),
                    "email": user.get("email")  # Optional, if needed downstream
                },
                expires_delta=timedelta(hours=2)
            )
            return jsonify({
                "status": "success",
                "message": "Login successful",
                "token": access_token,
                "user": {
                    "userId":str(user["_id"]),
                    # "name": user["name"],
                    "role": role,
                    # "avatar": user.get("avatar"),
                    # "email": user["email"],
                    # "stats": user.get("stats", {})
                }
            }), 200

        # ===============================
        # SEARCH TEAM COLLECTION
        # ===============================
        staff = team_col.find_one({"email": email})
        if staff and bcrypt.check_password_hash(staff['password'], password):
            role = staff.get("role", "staff")
            access_token = create_access_token(
                identity={"user_id": str(staff["_id"]), "role": role},
                expires_delta=timedelta(hours=2)
            )
            return jsonify({
                "status": "success",
                "message": "Team login successful",
                "token": access_token,
                "user": {
                    "name": staff["name"],
                    "role": role,
                    "avatar": staff.get("avatar"),
                    "title": staff.get("title"),
                    "description": staff.get("description")
                }
            }), 200

        return jsonify({"status": "fail", "message": "Invalid credentials"}), 401

    except Exception as e:
        print(f"[LOGIN] Error: {e}", file=sys.stderr)
        return jsonify({"status": "error", "message": "Server error"}), 500





@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    exp = get_jwt()["exp"]
    blacklist_token(jti, exp)

    return jsonify({"status": "success", "message": "Successfully logged out"}), 200


@auth_bp.route("/auth/verify-token")
def verify_token():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])
        return jsonify({"valid": True, "user_id": payload["sub"]})
    except jwt.ExpiredSignatureError:
        return jsonify({"valid": False, "error": "expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"valid": False, "error": "invalid"}), 401
