import sys
from flask import Blueprint, request, jsonify
from bson import ObjectId, errors as bson_errors
from datetime import datetime
import requests
from pymongo.errors import DuplicateKeyError
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from pymongo import DESCENDING

from db import get_db

bookings_bp = Blueprint('bookings', __name__)
db = get_db()

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


@bookings_bp.route("/bookings/user", methods=["GET"])
@jwt_required()
def get_user_bookings():
    print("[ROUTE HIT] /bookings/user")  # ✅ This MUST show in your Flask logs
    try:
       # ===============================
        # [JWT] GET USER IDENTITY PAYLOAD
        # ===============================
        user_id = get_jwt_identity()  # ✅ Now a string (user_id)

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
        packages_collection = db["packages"]
        bookings_collection = db["bookings"]
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