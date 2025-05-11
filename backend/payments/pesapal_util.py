from bson import ObjectId
import requests
from config import PesapalConfig as pesapal_config
from datetime import datetime
from db import get_db
from routes.bookings import update_booking_status  # ⬅️ Import here




db = get_db()

def get_access_token():
    try:
        response = requests.post(
            pesapal_config.AUTH_URL,
            headers={"Content-Type": "application/json"},
            json={
                "consumer_key": pesapal_config.CONSUMER_KEY,
                "consumer_secret": pesapal_config.CONSUMER_SECRET
            }
        )
        response.raise_for_status()
        return response.json().get("token")
    except requests.RequestException as e:
        print(f"[Pesapal Auth Error]: {e}")
        print(f"consumer_key:{ pesapal_config.CONSUMER_KEY},consumer_secret:{ pesapal_config.CONSUMER_SECRET}" )
        return None

def submit_payment_request(payment_id, booking_doc):
    access_token = get_access_token()
    if not access_token:
        return None, "Failed to authenticate with Pesapal"

    payload = {
        "id": str(payment_id),
        "currency": booking_doc["currency"],
        "amount": booking_doc["amount"],
        "description": f"Tour booking for {booking_doc['name']}",
        "callback_url": pesapal_config.CALLBACK_URL,
        "notification_id": pesapal_config.NOTIFICATION_ID,
        "billing_address": {
            "email_address": booking_doc["email"],
            "phone_number": booking_doc["phone"],
            "country_code": "KE",
            "first_name": booking_doc["name"].split()[0],
            "last_name": booking_doc["name"].split()[-1],
        }
    }

    try:
        response = requests.post(
            pesapal_config.SUBMIT_ORDER_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=payload
        )

        pesapal_payment_res = response.json()
        print("[Pesapal SubmitOrder Response]", pesapal_payment_res)
        print('initial payment update function called')
        update_payment_post_initiation(db, payment_id, pesapal_payment_res)


        response.raise_for_status()
        return response.json(), None
    except requests.RequestException as e:
        return None, str(e)


#  function to register ipn for serve to server communications btwn api.camotrail( backend server) and the pesapal gateway
def register_ipn_url(url_name="default"):
    access_token = get_access_token()
    if not access_token:
        return None, "Failed to authenticate with Pesapal"

    payload = {
        "url": pesapal_config.IPN_URL,
        "ipn_notification_type": "POST",
        "ipn_url_name": url_name
    }

    try:
        response = requests.post(
            f"{pesapal_config.BASE_URL}api/URLSetup/RegisterIPN",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=payload
        )
        response.raise_for_status()
        return response.json(), None
    except requests.RequestException as e:
        print(f"[Pesapal IPN Registration Error]: {e}")
        return None, str(e)


# get transaction status after the ipn notification from pesapal gateway
def get_transaction_status(order_tracking_id):
    access_token = get_access_token()
    if not access_token:
        return None, "Failed to authenticate with Pesapal"

    url = f"{pesapal_config.GET_STATUS_URL}?orderTrackingId={order_tracking_id}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        status_data = response.json()
        

        transaction_reference = status_data["order_tracking_id"]
        ipn_response=status_data 
        print("second payments update function called ")
        update_payment_post_ipn(db, transaction_reference, ipn_response)

        # Optionally handle or log key fields here
        if status_data.get("status") == "200":
            return status_data, None
        else:
            return None, f"Non-success status in response: {status_data.get('status')}"
        

    except requests.RequestException as e:
        print(f"[Pesapal Status Error]: {e}")
        return None, str(e)

def update_payment_post_initiation(db, payment_id, pesapal_payment_res):
    print("\n" + "="*60)
    print(f"[START] Initial Payment Update: Payment ID = {payment_id}")
    print("="*60)

    try:
        update_fields = {
            "merchantReference": pesapal_payment_res["merchant_reference"],
            "transactionReference": pesapal_payment_res["order_tracking_id"],
            "updatedAt": datetime.utcnow()
        }

        result = db["payments"].update_one(
            {"_id": ObjectId(payment_id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            print(f"[⚠️ Warning] No document matched with _id: {payment_id}")
        elif result.modified_count == 0:
            print(f"[ℹ️ Info] Document matched but no fields were changed (values may already be set).")
        else:
            print(f"[✅ Success] Document with ID {payment_id} updated successfully.")

        print(f"\n[Initial Payments Update Completed] for Payment ID: {payment_id}")

    except Exception as e:
        print(f"[❌ Exception] Update failed: {str(e)}")

    print("\n[🔎 Payload Used for Update]:")
    print(pesapal_payment_res)
    print("="*60 + "\n")


# ==============================================================
# 🟧 FUNCTION: UPDATE PAYMENT DOC FROM IPN NOTIFICATION
# ==============================================================


def update_payment_post_ipn(db, transaction_reference, ipn_response):
    try:
        update_fields = {
            "status": ipn_response.get("payment_status_description"),
            "paymentMethod": ipn_response.get("payment_method"),
            "confirmation_code": ipn_response.get("confirmation_code"),
            "paymentDate": ipn_response.get("created_date"),
            "ipnReceived": True,
            "updatedAt": datetime.utcnow()
        }

        # Update the payment document
        db["payments"].update_one(
            {"transactionReference": transaction_reference},
            {"$set": update_fields}
        )

        print(f"[IPN Update] Payment with txn {transaction_reference} updated from IPN")

        # Fetch bookingId to propagate status
        payment_doc = db["payments"].find_one({"transactionReference": transaction_reference})
        if payment_doc and "bookingId" in payment_doc:
            update_booking_status(
                db=db,
                booking_id=payment_doc["bookingId"],
                payment_id=payment_doc.get("_id"),
                payment_status=ipn_response.get("payment_status_description", "unknown")
            )
        else:
            print(f"[Booking Link Missing] No bookingId found for txn {transaction_reference}")

    except Exception as e:
        print(f"[IPN Update Exception]: {str(e)}")
