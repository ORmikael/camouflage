from datetime import datetime
from bson import ObjectId
from db import get_db

def create_payment_document(booking_id, paymentMethod, amount, currency):
    db = get_db()
    payments = db["payments"]

    payment_data = {
        "bookingId": ObjectId(booking_id),
        "paymentMethod": paymentMethod,
        "status": "Pending",
        "amount": amount,
        "currency": currency,
        "transactionReference": None,
        "paymentDate":  datetime.utcnow(),
    }

    result = payments.insert_one(payment_data)
    return str(result.inserted_id)
