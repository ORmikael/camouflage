# app.py
import os, smtplib, logging,re
from db import get_db  # Import the database connection


from bson import ObjectId
from flask import Flask, jsonify,request, Response, send_file
from flask_cors import CORS
from datetime import datetime
from pymongo import errors
from flask_jwt_extended import JWTManager
import smtplib
from email.message import EmailMessage
from config import PesapalConfig as config




# blueprints
from user_profile import user_profile_bp
from admin_profile import admin_profile_bp
from payments import payments_bp 
from routes.bookings import bookings_bp
from admin_profile.media_util import media_bp  # import blueprint
from authentication.auth import auth_bp
from config import PesapalConfig


import certifi
print("[CERTIFI] Using CA bundle at:", certifi.where())





app = Flask(__name__)
app.config.from_object(PesapalConfig)

CORS(app)
application = app

app.config['JWT_SECRET_KEY'] = app.config.get('SECRET_KEY')  # Make sure SECRET_KEY exists
jwt = JWTManager(app)  # ✅ Must be here

#============= Get the database instance ======================

db = get_db()
print("Connected to DB:", db.name)

#===========================  =================================


# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(user_profile_bp, url_prefix="/api/profile")
# app.register_blueprint(admin_profile_bp)
app.register_blueprint(payments_bp, url_prefix="/api/payments")
app.register_blueprint(bookings_bp, url_prefix="/api")
app.register_blueprint(media_bp, url_prefix='/api/media')  # All routes inside will be prefixed




EMAIL_REGEX = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"


# collection = db["highlights"]
booking_collection = db["bookings"] # Booking collection
booking_collection.create_index([("email", 1), ("date", 1)], unique=True)  # prevent duplicate booking for same date

logging.basicConfig(level=logging.INFO)  # Or use logging.ERROR for prod
logger = logging.getLogger(__name__)



@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Camotrails Safari backend is running."}), 200

@app.route("/api/booking/status", methods=["GET"])
def statusCallback():
    return jsonify({"message": "payment initiated awaiting status update."}), 200


# reviews route handler
@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    reviews = []
    for review in db["reviews"].find({}, {"_id": 0}):
        reviews.append(review)
    return jsonify(reviews)

#  newsletter route handler 
@app.route("/api/newsletter/subscribe", methods=["POST"])
def subscribe_newsletter():
    db = get_db()
    subscribers = db["subscribers"]
    subscribers.create_index("email", unique=True)

    email = request.json.get("email", "").strip()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Invalid email format"}), 400

    if subscribers.find_one({"email": email}):
        return jsonify({"error": "Email already subscribed"}), 409

    subscribers.insert_one({"email": email})
    return jsonify({"message": "Subscribed successfully"}), 200



@app.route('/api/highlights', methods=['GET'])
def get_all_highlights():
    highlights = []
    for item in db["highlights"].find({}, {"_id": 0}):
        # Convert ObjectId to string before appending to highlights
        if "image_id" in item:
            item["image_id"] = str(item["image_id"])  # Convert ObjectId to string

        # Handle image fetching
        if "image_id" in item:
            image_doc = db["images"].find_one({"_id": ObjectId(item["image_id"])}, {"_id": 0, "path": 1})
            if image_doc:
                item["image"] = image_doc["path"]
            else:
                item["image"] = None
        else:
            item["image"] = None

        highlights.append(item)

    return jsonify(highlights)



# destinations route handler
from bson import ObjectId

def convert_objectid_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, list):
        return [convert_objectid_to_str(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: convert_objectid_to_str(v) for k, v in obj.items()}
    else:
        return obj

@app.route('/api/destinations', methods=['GET'])
def get_destinations():
    destinations = []
    for dest in db["destinations"].find():
        # Convert all ObjectId in the entire document to string recursively
        dest = convert_objectid_to_str(dest)

        # Resolve the main image_id if present (optional, you already converted to str)
        if "image_id" in dest:
            image_doc = db["images"].find_one({"_id": ObjectId(dest["image_id"])})
            dest["image"] = image_doc["path"] if image_doc else None
            del dest["image_id"]

        # Optionally, resolve nested details.related[].image_id to image path (if you want)
        if "details" in dest and "related" in dest["details"]:
            for rel in dest["details"]["related"]:
                if "image_id" in rel:
                    image_doc = db["images"].find_one({"_id": ObjectId(rel["image_id"])})
                    rel["image"] = image_doc["path"] if image_doc else None
                    del rel["image_id"]

        # Similarly for details.highlights[].image_id
        if "details" in dest and "highlights" in dest["details"]:
            for highlight in dest["details"]["highlights"]:
                if "image_id" in highlight:
                    image_doc = db["images"].find_one({"_id": ObjectId(highlight["image_id"])})
                    highlight["image"] = image_doc["path"] if image_doc else None
                    del highlight["image_id"]

        destinations.append(dest)

    return jsonify(destinations)


# packages route handler ( returns all packages in the databse as part of the response)
@app.route('/api/packages/', methods=['GET'])
def get_packages():
    packages = []

    for pkg in db["packages"].find():
        # Convert package _id and image_id to string if they exist
        pkg["_id"] = str(pkg["_id"])
        if "image_id" in pkg:
            try:
                image_obj_id = ObjectId(pkg["image_id"])
                image = db["images"].find_one({"_id": image_obj_id})
                pkg["image"] = image["path"] if image and "path" in image else None
            except Exception:
                pkg["image"] = None

            #  convert image_id from response to string
            pkg["image_id"] = str(pkg["image_id"])
        else:
            pkg["image"] = None

        packages.append(pkg)

    return jsonify(packages)


#  package itenary route handler 
@app.route('/api/packages/<package_id>', methods=['GET'])
def get_package_by_id(package_id):
    try:
        package = db["packages"].find_one({"_id": ObjectId(package_id)})
        if not package:
            return jsonify({"error": "Package not found"}), 404

        # Convert fields to string and add image path
        package["_id"] = str(package["_id"])
        if "image_id" in package:
            try:
                image_obj_id = ObjectId(package["image_id"])
                image = db["images"].find_one({"_id": image_obj_id})
                package["image"] = image["path"] if image and "path" in image else None
                package["image_id"] = str(package["image_id"])
            except Exception:
                package["image"] = None
        else:
            package["image"] = None

        return jsonify(package)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500





# CONFIGURABLE PATHS
VIDEO_DIR = 'static/videos'
THUMBNAIL_DIR = 'static/images/thumbnails'

@app.route("/api/videos")
def get_videos():
    videos = []
    for filename in os.listdir(VIDEO_DIR):
        if filename.endswith(".mp4"):
            base_name = os.path.splitext(filename)[0].replace("-", " ").lower().replace(" ", "-")
            title = base_name.replace("-", " ").title()

            # Dynamically find the thumbnail with matching image extension
            thumbnail_file = next(
                (f"{base_name}.{ext}" for ext in ['jpg', 'png', 'jpeg']
                 if os.path.exists(os.path.join(THUMBNAIL_DIR, f"{base_name}.{ext}"))),
                None
            )

            if thumbnail_file:
                video = {
                    "src": f"/{VIDEO_DIR}/{filename}",
                    "thumbnail": f"/{THUMBNAIL_DIR}/{thumbnail_file}",
                    "title": title
                }
                videos.append(video)
            else:
                print(f"Warning: Thumbnail not found for video {filename}")
    print(videos)
    return jsonify(videos)






@app.route("/api/videos/<path:filename>", methods=["GET"])
def stream_video(filename):
    file_path = os.path.join(VIDEO_DIR, filename)

    if not os.path.exists(file_path):
        return "File not found", 404

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get('Range', None)

    if range_header:
        # Parse range header
        byte1, byte2 = 0, None
        m = range_header.replace("bytes=", "").split("-")
        if m[0]:
            byte1 = int(m[0])
        if len(m) > 1 and m[1]:
            byte2 = int(m[1])

        byte2 = byte2 if byte2 is not None else file_size - 1
        length = byte2 - byte1 + 1

        with open(file_path, 'rb') as f:
            f.seek(byte1)
            data = f.read(length)

        response = Response(data,
                            status=206,
                            mimetype='video/mp4',
                            headers={
                                'Content-Range': f'bytes {byte1}-{byte2}/{file_size}',
                                'Accept-Ranges': 'bytes',
                                'Content-Length': str(length),
                            })
    else:
        # Fallback: send full video
        response = send_file(file_path, mimetype='video/mp4')

    return response


@app.route('/api/team/top-management', methods=['GET'])
@app.route('/api/team/management', methods=['GET'])
def get_top_management():
    """
    Fetches team members whose role is 'management'.
    """
    docs = db["team"].find(
        {'role': 'management'},
        {'_id': 0}
    )
    return jsonify(list(docs)), 200


@app.route('/api/team/staff', methods=['GET'])
def get_other_staff():
    """
    Fetches team members whose role is 'staff'.
    """
    docs = db["team"].find(
        {'role': 'staff'},
        {'_id': 0}
    )
    return jsonify(list(docs)), 200


# ===============================
# CONTACT FORM EMAIL API
# ===============================
@app.route("/api/inquiry", methods=["POST"])
def send_inquiry():
    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        address = data.get("address")
        message = data.get("message")

        msg = EmailMessage()
        msg["Subject"] = f"Inquiry from {name}"
        msg["From"] = email
        msg["To"] = "info@camotrailsafari.co.ke"

        msg.set_content(
            f"""New inquiry received:\n
            Name: {name}
            Email: {email}
            Phone: {phone}
            Address: {address}
            Message: {message}
            """
        )

        # SMTP SEND LOGIC (example using Gmail SMTP)
        with smtplib.SMTP_SSL(config.EMAIL_HOST, 465) as smtp:
            smtp.login(config.EMAIL_USER, config.EMAIL_PASS)
            smtp.send_message(msg)

        return jsonify({"status": "success", "message": "Message sent successfully!"}), 200

    except Exception as e:
        print(f"[ERROR][INQUIRY] {e}")
        return jsonify({"status": "error", "message": "Failed to send message"}), 500


if __name__ == '__main__':
    app.run(debug=True)

