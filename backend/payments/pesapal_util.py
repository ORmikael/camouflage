import requests
from config import PesapalConfig as pesapal_config

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
        print("[Pesapal SubmitOrder Response]", response.json())
        response.raise_for_status()
        return response.json(), None
    except requests.RequestException as e:
        return None, str(e)

def get_transaction_status(order_tracking_id):
    access_token = get_access_token()
    if not access_token:
        return None, "Failed to authenticate with Pesapal"

    url = f"{pesapal_config.GET_STATUS_URL}?orderTrackingId={order_tracking_id}"

    try:
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        response.raise_for_status()
        return response.json(), None
    except requests.RequestException as e:
        print(f"[Pesapal Status Error]: {e}")
        return None, str(e)

def get_transaction_details(order_tracking_id):
    access_token = get_access_token()
    if not access_token:
        return None, "Failed to authenticate with Pesapal"

    url = f"{pesapal_config.GET_DETAILS_URL}?orderTrackingId={order_tracking_id}"

    try:
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {access_token}"}
        )
        response.raise_for_status()
        return response.json(), None
    except requests.RequestException as e:
        print(f"[Pesapal Details Error]: {e}")
        return None, str(e)

# callback function to api.camotrail( backend server) with response from the pesapal gateway
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
            f"{pesapal_config.BASE_URL}/v3/api/URLSetup/RegisterIPN",
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
