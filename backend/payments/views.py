from datetime import datetime
import sys
from flask import request, jsonify
from bson import ObjectId, errors as bson_errors

from db import get_db
from . import payments_bp
from routes.bookings import update_booking_status
from payments.payment_models import create_payment_document
from payments import pesapal_util as pesapal

# ───────────────────────────────────────────
# INIT DB CONNECTION
# ───────────────────────────────────────────

db = get_db()

# ───────────────────────────────────────────
# 1. HANDLE PAYMENT INITIATION (CREATE ORDER)
# ───────────────────────────────────────────
@payments_bp.route('', methods=['POST'])
def handle_payment():
    db = get_db()
    try:
        # STEP 1: Parse and validate input
        data = request.get_json()
        if 'bookingId' not in data:
            return jsonify({'error': 'Missing required field: bookingId'}), 400

        try:
            booking_oid = ObjectId(data['bookingId'])
        except bson_errors.InvalidId:
            return jsonify({'error': 'Invalid bookingId format'}), 400

        # STEP 2: Verify booking exists
        booking = db['bookings'].find_one({'_id': booking_oid})
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404

        # STEP 3: Create payment document (initial status = Pending)
        payment_id = create_payment_document(
        booking_id=booking_oid,
        amount=booking['amount'],
        currency=booking['currency'],
        status="Pending",                          # Initial status
        transaction_reference=None,                # Will be updated after IPN or status check
        merchant_reference=None,                   # Will be updated after response from Pesapal
        payment_method=None,                       # Will be filled after IPN (e.g., 'MPESA', 'CARD')
        payment_date=datetime.utcnow(),  
        ipn_received=False,                        # Will be updated to True upon IPN reception
        updated_at=datetime.utcnow()               # Timestamp for auditing updates
        )

        print(f"[Payment] Document created: {payment_id}", file=sys.stderr)

        # STEP 4: Submit payment request to Pesapal
        response, error = pesapal.submit_payment_request(payment_id, booking)
        if error:
            return jsonify({'error': 'Failed to initiate payment', 'details': error}), 502

        tracking_id = response.get('order_tracking_id')
        if not tracking_id:
            return jsonify({'error': 'Missing order_tracking_id in response'}), 502

        # STEP 5: Return success response
        if response.get("status") == "200":
            return jsonify({
                "message": "Order created successfully",
                "redirect_url": response.get("redirect_url"),
                "merchant_reference": response.get("merchant_reference"),
                "paymentId": str(payment_id)
            }), 201
        else:
            return jsonify({
                "error": "Failed to create order",
                "details": response
            }), 502

    except Exception as e:
        print(f"🔥 Internal Server Error: {e}", file=sys.stderr)
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

# ───────────────────────────────────────────
# 2. REGISTER IPN CALLBACK URL
# ───────────────────────────────────────────
@payments_bp.route('/register-ipn', methods=['POST'])
def register_ipn():
    data = request.get_json() or {}
    ipn_name = data.get("ipn_name", "Camotrail-IPN")

    response, error = pesapal.register_ipn_url(ipn_name)
    if error:
        return jsonify({"status": "error", "message": str(error)}), 400

    return jsonify({"status": "success", "data": response}), 200

# ───────────────────────────────────────────
# 3. IPN CALLBACK HANDLER FROM PESAPAL
# ───────────────────────────────────────────
@payments_bp.route('/ipn', methods=['POST', 'GET'])
def pesapal_ipn():
    try:
        # STEP 1: Extract IPN payload from GET or POST
        if request.method == 'GET':
            order_tracking_id = request.args.get('OrderTrackingId')
            notification_type = request.args.get('OrderNotificationType')
            merchant_reference = request.args.get('OrderMerchantReference')
        else:
            data = request.get_json(force=True)
            order_tracking_id = data.get('OrderTrackingId')
            notification_type = data.get('OrderNotificationType')
            merchant_reference = data.get('OrderMerchantReference')

        # STEP 2: Validate required fields
        if notification_type != "IPNCHANGE" or not order_tracking_id:
            return jsonify({
                "status": 400,
                "message": "Invalid IPN payload or missing OrderTrackingId"
            }), 400

        # STEP 3: Query Pesapal for transaction status
        status_data, error = pesapal.get_transaction_status(order_tracking_id)
        if error:
            print("[IPN Error]:", error)
            return jsonify({
                "status": 500,
                "message": f"Failed to query status for OrderTrackingId: {order_tracking_id}",
                "error": error
            }), 500

        print("[Pesapal Transaction Status]:", status_data)

        # STEP 4: Update payment + booking
        # update_payment_and_booking(
        #     db=db,
        #     merchant_reference=merchant_reference,
        #     tracking_id=order_tracking_id,
        #     status_data=status_data
        # )

        # STEP 5: Acknowledge IPN success to Pesapal
        return jsonify({
            "OrderNotificationType": "IPNCHANGE",
            "OrderTrackingId": order_tracking_id,
            "OrderMerchantReference": merchant_reference,
            "status": 200
        }), 200

    except Exception as e:
        print("[IPN Exception]:", str(e))
        return jsonify({
            "status": 500,
            "message": "Unhandled exception in IPN handler",
            "error": str(e)
        }), 500

# ───────────────────────────────────────────
# 4. UPDATE PAYMENT & BOOKING 
# ───────────────────────────────────────────
    # handled in the payments view