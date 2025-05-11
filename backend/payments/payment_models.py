from datetime import datetime
from bson import ObjectId
from db import get_db

db = get_db()
payments_collection = db["payments"] 

def create_payment_document(booking_id, amount, currency, status,
                            transaction_reference, merchant_reference,
                            payment_method, payment_date,
                            ipn_received, updated_at):
    payment_doc = {
        "bookingId": booking_id,
        "amount": amount,
        "currency": currency,
        "status": status,
        "transactionReference": transaction_reference,
        "merchantReference": merchant_reference,
        "paymentMethod": payment_method,
        "paymentDate": payment_date,

        "ipnReceived": ipn_received,
        "updatedAt": updated_at
    }
    # return payments_collection.insert_one(payment_doc).inserted_id
    result = payments_collection.insert_one(payment_doc)
    return str(result.inserted_id)