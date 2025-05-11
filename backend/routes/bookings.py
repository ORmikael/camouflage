import sys
from flask import Blueprint, request, jsonify
from bson import ObjectId, errors as bson_errors
from datetime import datetime
import requests
from pymongo.errors import DuplicateKeyError

from db import get_db

bookings_bp = Blueprint('bookings', __name__)
db = get_db()

# ==============================================================
# 🟩 ROUTE: CREATE A NEW BOOKING AND INITIALIZE PAYMENT
# ==============================================================

@bookings_bp.route('', methods=['POST'])
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
        print(f"payment info received from payment endpoint {payment_info}")

        payment_id = payment_info.get("paymentId")
        redirect_url = payment_info.get("redirect_url")

        if not payment_id:
            return jsonify({"error": "Payment service did not return a paymentId"}), 502

        # ---------------------------------------------------------
        # 🔄 4. UPDATE BOOKING WITH PAYMENT ID AND CONFIRMATION STATUS
        # ---------------------------------------------------------
        db["bookings"].update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"paymentId": ObjectId(payment_id), "status": "confirmed"}}
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
                    "error": "Booking pending confirmation. Contact support for further guidance."
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

# ==============================================================
# 🔁 UTILITY FUNCTION: UPDATE BOOKING STATUS
# ==============================================================

def update_booking_status(db, booking_id, payment_id, payment_status):
    """
    Updates the booking record with the associated payment ID and status.
    This function is called by the payment updater (from the payment IPN handler).
    """
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
