import sys
from flask import Blueprint, request, jsonify
from bson import ObjectId, errors as bson_errors
from datetime import datetime
import requests
from pymongo.errors import DuplicateKeyError


from db import get_db

bookings_bp = Blueprint('bookings', __name__)
db = get_db()

@bookings_bp.route('/book', methods=['POST'])
def create_booking():
    data = request.get_json()
    
    print("INCOMING BOOKING PAYLOAD:", file=sys.stderr)
    print(data, file=sys.stderr)  # will show in terminal

    email = data.get("userEmail")
    date = data.get("startDate")

    print("MAPPED EMAIL:", email, file=sys.stderr)
    print("MAPPED DATE:", date, file=sys.stderr)
    try:
        # data = request.get_json()
       


        # Required fields for flattened schema
        required_fields = [
            'name', 'email', 'phone',
            'packageId', 'date', 'endDate', 'travelers',
            'paymentMethod', 'amount', 'currency'
        ]
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

        # Validate ObjectId for packageId
        try:
            package_oid = ObjectId(data['packageId'])
        except bson_errors.InvalidId:
            return jsonify({'error': 'Invalid packageId format'}), 400

        # Prepare booking document
        booking_doc = {
            "name": data['name'],
            "email": data['email'],
            "phone": data['phone'],
            "packageId": package_oid,
            "date": data['date'],
            "endDate": data['endDate'],
            "travelers": int(data['travelers']),
            "paymentMethod": data['paymentMethod'],
            "amount": float(data['amount']),
            "currency": data['currency'],
            "createdAt": datetime.utcnow(),
            "paymentId": None,
            "status": "pending"
        }

        result = db["bookings"].insert_one(booking_doc)
        booking_id = str(result.inserted_id)

        # Prepare payment payload
        payment_payload = {
            "bookingId": booking_id,
            "paymentMethod": data['paymentMethod'],
            "amount": data['amount'],
            "currency": data['currency']
        }

        try:
            response = requests.post("http://localhost:5000/api/payments", json=payment_payload)
            response.raise_for_status()
            print('payment initialed')
        except requests.RequestException as e:
            print(f"[Payment Service Error]: {e}")
            return jsonify({"error": f"Failed to process payment: {str(e)}"}), 502

        payment_info = response.json()
        payment_id = payment_info.get("paymentId")

        if not payment_id:
            return jsonify({"error": "Payment service did not return a paymentId"}), 502

        # Update booking with paymentId
        db["bookings"].update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"paymentId": ObjectId(payment_id), "status": "confirmed"}}
        )

        return jsonify({
            "message": "Booking and Payment successful",
            "bookingId": booking_id,
            "paymentId": payment_id
        }), 201
    
    except DuplicateKeyError as dup_err:
        print(f"[Booking API Duplicate Error]: {dup_err}", file=sys.stderr)
        
        # Lookup the conflicting booking
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
        # Fallback generic message if booking not found (unlikely)
        return jsonify({
            "error": "Duplicate booking detected. Contact support."
        }), 409
    
    except Exception as e:
        print(f"[Booking API Error]: {e}")
        # Include actual error message in the response, but ensure it's safe to expose
        return jsonify({'error': f'Internal server error. Contact support.'}), 500