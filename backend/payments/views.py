import sys
from flask import request, jsonify
from bson import ObjectId, errors as bson_errors

from db import get_db
from . import payments_bp
from payments.models import create_payment_document
from payments import pesapal_util as pesapal



db = get_db()

@payments_bp.route('/payments', methods=['POST'])
def handle_payment():
    db = get_db()

    try:
        data = request.get_json()
        if 'bookingId' not in data:
            return jsonify({'error': 'Missing required field: bookingId'}), 400

        try:
            booking_oid = ObjectId(data['bookingId'])
        except bson_errors.InvalidId:
            return jsonify({'error': 'Invalid bookingId format'}), 400

        booking = db['bookings'].find_one({'_id': booking_oid})
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404

        # Step 1: Create payment document (initial status = Pending)
        payment_id = create_payment_document(
            booking_id=booking_oid,
            amount=booking['amount'],
            currency=booking['currency']
        )

        print(f" Payment document created: {payment_id}", file=sys.stderr)

        # Step 2: Submit to Pesapal (hosted payment page)
        response, error = pesapal.submit_payment_request(payment_id, booking)
        if error:
            return jsonify({'error': 'Failed to initiate payment', 'details': error}), 502

        tracking_id = response.get('order_tracking_id')
        if not tracking_id:
            return jsonify({'error': 'Missing order_tracking_id in response'}), 502

        # Step 3: Get transaction status & details
        status_data, status_err = pesapal.get_transaction_status(tracking_id)
        details_data, details_err = pesapal.get_transaction_details(tracking_id)

        if status_err or details_err:
            return jsonify({
                'error': 'Failed to retrieve transaction metadata',
                'status_error': status_err,
                'details_error': details_err
            }), 502

        payment_status = status_data.get('payment_status', 'Pending')
        payment_method = details_data.get('payment_method', None)  # Optional

        # Step 4: Update payment document
        update_fields = {
            'transactionReference': tracking_id,
            'status': payment_status
        }
        if payment_method:
            update_fields['paymentMethod'] = payment_method

        db["payments"].update_one({'_id': payment_id}, {'$set': update_fields})

        # Step 5: Update booking
        db["bookings"].update_one(
            {'_id': booking_oid},
            {'$set': {
                'paymentId': str(payment_id),
                'status': payment_status.lower()
            }}
        )

        return jsonify({
            'message': 'Payment initiated',
            'paymentId': str(payment_id),
            'transactionReference': tracking_id,
            'status': payment_status,
            'redirect_url': response.get('redirect_url')
        }), 201

    except Exception as e:
        print(f"🔥 Internal Server Error: {e}", file=sys.stderr)
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500
