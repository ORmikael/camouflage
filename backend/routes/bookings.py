import sys
from flask import Blueprint, request, jsonify
from bson import ObjectId, errors as bson_errors
from datetime import datetime
import requests
from pymongo.errors import DuplicateKeyError
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from pymongo import DESCENDING
from functools import wraps
import jwt
from flask import current_app



from db import get_db

bookings_bp = Blueprint('bookings', __name__)
db = get_db()

packages_collection = db["packages"]
bookings_collection = db["bookings"]

# ==============================================================
# 🟩 ROUTE: CREATE A NEW BOOKING AND INITIALIZE PAYMENT
# ==============================================================

@bookings_bp.route('/book', methods=['POST'])
def create_booking():
    data = request.get_json()

    # 🔍 Debugging logs to monitor incoming booking requests
    print("INCOMING BOOKING PAYLOAD:", file=sys.stderr)
    print(data, file=sys.stderr)

    email = data.get("userEmail")
    date = data.get("startDate")
    print("MAPPED EMAIL:", email, file=sys.stderr)
    print("MAPPED DATE:", date, file=sys.stderr)

    try:
        # ---------------------------------------------------------
        # ✅ 1. VALIDATE REQUIRED FIELDS
        # ---------------------------------------------------------
        required_fields = [
            'name', 'email', 'phone',
            'packageId', 'date', 'endDate', 'travelers',
            'amount', 'currency'
        ]
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

        try:
            package_oid = ObjectId(data['packageId'])  # Validate ObjectId
        except bson_errors.InvalidId:
            return jsonify({'error': 'Invalid packageId format'}), 400

        # ---------------------------------------------------------
        # 🗃️ 2. INSERT BOOKING DOCUMENT INTO DATABASE
        # ---------------------------------------------------------
        booking_doc = {
            "name": data['name'],
            "email": data['email'],
            "phone": data['phone'],
            "packageId": package_oid,
            "date": data['date'],
            "endDate": data['endDate'],
            "travelers": int(data['travelers']),
            "amount": float(data['amount']),
            "currency": data['currency'],
            "createdAt": datetime.utcnow(),
            "paymentId": None,
            "status": "pending"
        }

        result = db["bookings"].insert_one(booking_doc)
        print(result)
        booking_id = str(result.inserted_id)

        # ---------------------------------------------------------
        # 💳 3. INITIATE PAYMENT VIA PAYMENT SERVICE
        # ---------------------------------------------------------
        payment_payload = {
            "bookingId": booking_id,
            "amount": data['amount'],
            "currency": data['currency']
        }

        try:
            response = requests.post("http://localhost:5000/api/payments", json=payment_payload)
            response.raise_for_status()
            print('payment initiated')
        except requests.RequestException as e:
            print(f"[Payment Service Error]: {e}")
            return jsonify({"error": f"Failed to process payment: {str(e)}"}), 502

        payment_info = response.json()
        print(f"[Booking]: payment info received from payment endpoint {payment_info}")

        payment_id = payment_info.get("paymentId") #this id is what should be used for the transactionrefence in the payments doc
        redirect_url = payment_info.get("redirect_url")

        if not payment_id:
            return jsonify({"error": "Payment service did not return a paymentId"}), 502

        # ---------------------------------------------------------
        # 🔄 4. UPDATE BOOKING WITH PAYMENT ID AND CONFIRMATION STATUS
        # ---------------------------------------------------------
        db["bookings"].update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"paymentId": ObjectId(payment_id), "status": "Being Processed"}}
        )

        return jsonify({
            "message": "booking submitted for processing, redirecting to payments page ...",
            "bookingId": booking_id,
            "redirect_url": redirect_url,
            "paymentId": payment_id
        }), 201

    # -------------------------------------------------------------
    # ❗ 5. HANDLE DUPLICATE BOOKING SCENARIOS
    # -------------------------------------------------------------
    except DuplicateKeyError as dup_err:
        print(f"[Booking API Duplicate Error]: {dup_err}", file=sys.stderr)

        conflict = db["bookings"].find_one({
            "email": data["email"],
            "date": data["date"],
            "packageId": package_oid
        })
        if conflict:
            status = conflict.get("status")
            if status == "confirmed":
                return jsonify({
                    "error": "A booking for a similar safari already exists. Kindly contact support."
                }), 409
            elif status == "pending":
                return jsonify({
                    "error": "Booking already submitted, pending confirmation. Await status message or contact ICT support at support@camotrailsafai.co.ke for further guidance,"
                }), 409

        return jsonify({
            "error": "Duplicate booking detected. Contact support."
        }), 409

    # -------------------------------------------------------------
    # 🧯 6. HANDLE UNEXPECTED ERRORS
    # -------------------------------------------------------------
    except Exception as e:
        print(f"[Booking API Error]: {e}")
        return jsonify({'error': 'Internal server error. Contact support.'}), 500



# ===============================
# ROUTE: GET USER BOOKINGS
# ===============================


@bookings_bp.route("/bookings/user", methods=["GET"]) #fetches all the bookings for a particular user 
@jwt_required()
def get_user_bookings():
    jwt_payload = get_jwt()
    role = jwt_payload.get("role")
    email = jwt_payload.get("email")
    user_id = get_jwt_identity()  # ✅ Now a string (user_id)

    print(f"[BOOKINGS] User ID: {user_id} | Role: {role} | Email: {email}", file=sys.stderr)

    try:
       # ===============================
        # [JWT] GET USER IDENTITY PAYLOAD
        # ===============================
        


        if not user_id:
            return jsonify({"status": "fail", "message": "Missing user_id in token"}), 401

        # ===============================
        # [DB] LOOKUP USER EMAIL FROM USERS COLLECTION
        # ===============================
        users_collection = db["users"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})

        if not user:
            return jsonify({
                "status": "fail",
                "message": "User not found"
            }), 404

        email = user.get("email")
        print("[BOOKING]  Resolved email from user_id:", email)

        # ===============================
        # [DB] FETCH BOOKINGS BY EMAIL
        # ===============================
       
        # try:
        #    all_docs = bookings_collection.find()
        #    for i, doc in enumerate(all_docs, start=1):
        #     doc["_id"] = str(doc["_id"])  # Convert ObjectId for readable output
        #     print(f"[BOOKING DOC {i}] {doc}")
        # except Exception as e:
        #      print("[DB DEBUG ERROR]", str(e))

        user_bookings = list(
            bookings_collection.find({"email": email}).sort("date", DESCENDING)
        )

        sanitized_bookings = []

        for i, booking in enumerate(user_bookings):
            clean_doc = sanitize_doc(booking)
            # ===============================
            # LOOKUP: PACKAGE NAME
            # ===============================
            package_id = booking.get("packageId")
            if isinstance(package_id, ObjectId):  # Defensive check
                package = packages_collection.find_one({"_id": package_id})
                if package:
                    clean_doc["trip_name"] = package.get("name", "Unknown Package")
                else:
                    clean_doc["trip_name"] = "Package Not Found"
            else:
                clean_doc["trip_name"] = "Invalid Package ID"
            print(f"[DB] Booking #{i+1}:", clean_doc)
            sanitized_bookings.append(clean_doc)

        print(f"[DB] {len(sanitized_bookings)} bookings found for {email}")

        return jsonify({
            "status": "success",
            "message": "Bookings retrieved",
            "bookings": sanitized_bookings
        }), 200

    except Exception as e:
        print("[BOOKINGS ERROR]", str(e))
        return jsonify({
            "status": "error",
            "message": "Server error"
        }), 500

# ===============================
# CANCEL BOOKING ENDPOINT
# ===============================


# AUTH WRAPPER
def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        print("[AUTH] Checking Authorization header...", file=sys.stderr)
        token = request.headers.get("Authorization")

        if token and token.startswith("Bearer "):
            token = token.split(" ")[1]
            print(f"[AUTH] Extracted token: {token}", file=sys.stderr)
        else:
            print("[AUTH] Token missing or malformed", file=sys.stderr)
            return jsonify({"status": "fail", "message": "Token missing"}), 401

        try:
            print("[AUTH] Decoding token...", file=sys.stderr)
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            print(f"[AUTH] Token decoded: {data}", file=sys.stderr)

            user_id = data.get('sub')
            if not user_id:
                print("[AUTH] 'id' field missing in token payload", file=sys.stderr)
                return jsonify({"status": "fail", "message": "'id' not found in token"}), 401

            user_email = data.get("email")
            if not user_email:
                print("[AUTH] 'email' field missing in token payload", file=sys.stderr)
                return jsonify({"status": "fail", "message": "'email' not found in token"}), 401
            
        except jwt.ExpiredSignatureError:
            print("[AUTH] Token has expired", file=sys.stderr)
            return jsonify({"status": "fail", "message": "Token expired"}), 401
        except jwt.InvalidTokenError as e:
            print(f"[AUTH] Invalid token: {e}", file=sys.stderr)
            return jsonify({"status": "fail", "message": "Invalid token"}), 401
        except Exception as e:
            print(f"[AUTH] Unknown error during token decode: {e}", file=sys.stderr)
            return jsonify({"status": "fail", "message": "Token decode error"}), 401

        print(f"[AUTH] Authenticated user ID: {user_id} EMAIL: {user_email}" , file=sys.stderr)
        return f( *args,user_id=user_id, user_email=user_email, **kwargs)
    return wrapper

# ===============================
# CANCEL BOOKING ROUTE (PATCH)
# ===============================
@bookings_bp.route('/bookings/cancel/<string:booking_id>', methods=['PATCH'])
@token_required
def cancel_booking(booking_id, user_email, user_id):
    try:
        print(f"[CANCEL_BOOKING] Request received to cancel booking: {booking_id} by user: {user_id}")

        # FETCH BOOKING
        booking = bookings_collection.find_one({"_id": ObjectId(booking_id)})
        print(f"[DB] Booking fetched: {booking}")

        if not booking:
            print("[CANCEL_BOOKING] Booking not found")
            return jsonify({"status": "fail", "message": "Booking not found"}), 404

        #  CHECK OWNERSHIP (email-based)
        booking_email = booking.get("email")  # the email tied to the booking
        requester_email = user_email          # from JWT
        
        if str(booking_email).lower() != str(requester_email).lower():
            print(f"[AUTH] Unauthorized attempt by {requester_email} on booking owned by {booking_email}")
            return jsonify({"status": "fail", "message": "Unauthorized to cancel this booking"}), 403
        
        #  CHECK IF ALREADY CANCELLED
        if booking.get("status") == "cancelled":
            print(f"[CANCEL_BOOKING] Booking {booking_id} already cancelled")
            return jsonify({"status": "fail", "message": "Booking already cancelled"}), 400

        # VALIDATE BOOKING DATE
        try:
            booking_date = datetime.strptime(booking.get("date"), "%Y-%m-%d")
        except Exception as parse_err:
            print(f"[CANCEL_BOOKING][PARSE_DATE] Invalid date format in booking: {booking.get('date')}")
            return jsonify({"status": "fail", "message": "Invalid booking date format"}), 400

        if booking_date <= datetime.now():
            print(f"[CANCEL_BOOKING] Attempt to cancel past booking dated: {booking_date}")
            return jsonify({"status": "fail", "message": "Cannot cancel past bookings"}), 400

        # UPDATE STATUS TO CANCELLED
        result = bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": "cancelled"}}
        )
        print(f"[DB] Update result: matched={result.matched_count}, modified={result.modified_count}")

        if result.modified_count == 1:
            return jsonify({"status": "success", "message": "Booking marked as cancelled"}), 200
        else:
            return jsonify({"status": "fail", "message": "No changes made to booking"}), 400

    except Exception as e:
        print(f"[CANCEL_BOOKING][ERROR] Exception occurred: {e}", file=sys.stderr)
        return jsonify({"status": "error", "message": "Server error cancelling booking"}), 500



# helper functions 


def sanitize_doc(doc):
    sanitized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            sanitized[key] = str(value)
        elif isinstance(value, datetime):
            sanitized[key] = value.isoformat()
        else:
            sanitized[key] = value
    return sanitized

# ==============================================================
# 🔁 UTILITY FUNCTION: UPDATE BOOKING STATUS
# ==============================================================

def update_booking_status(db, booking_id, payment_id, payment_status):
    try:
        db["bookings"].update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': {
                'paymentId': str(payment_id),
                'status': payment_status.lower()
            }}
        )
        print(f"[Booking Update] Booking {booking_id} updated with status {payment_status}")
    except Exception as e:
        print(f"[Booking Update Error]: {str(e)}")