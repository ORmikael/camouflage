import sys
from flask import request, jsonify
from bson import ObjectId, errors as bson_errors
from . import payments_bp
from .models import create_payment_document

@payments_bp.route('/payments', methods=['POST'])
def create_payment():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['bookingId', 'paymentMethod', 'amount', 'currency']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Validate bookingId format
        try:
            booking_oid = ObjectId(data['bookingId'])
        except bson_errors.InvalidId:

            return jsonify({'error': 'Invalid bookingId format'}), 400

        # Create payment document

        payment_id = create_payment_document(
            booking_id=booking_oid,
            paymentMethod=data['paymentMethod'],
            amount=float(data['amount']),
            currency=data['currency']
        )
        print(f"✅ Payment document created with ID: {payment_id}", file=sys.stderr)

        return jsonify({
            'message': 'Payment initiated',
            'paymentId': str(payment_id)
        }), 201

    except Exception as e:
        print(f"🔥 Internal Server Error: {e}", file=sys.stderr)
        return jsonify({
            'error': 'Internal server error. Contact support.',
            'details': str(e)
        }), 500
