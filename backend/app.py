# app.py

import os, smtplib, logging,re
from user_profile import user_profile_bp
from admin_profile import admin_profile_bp



from bson import ObjectId
from flask import Flask, jsonify,request, Response, send_file
from flask_cors import CORS
from datetime import datetime
from email.message import EmailMessage
from pymongo import errors



from db import get_db  # Import the database connection




app = Flask(__name__)
CORS(app)

#============= Get the database instance ======================

db = get_db()
print("Connected to DB:", db.name)

#===========================  =================================


# Register blueprints
app.register_blueprint(user_profile_bp, url_prefix="/api/profile")
app.register_blueprint(admin_profile_bp)


EMAIL_REGEX = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"


# collection = db["highlights"]
booking_collection = db["bookings"] # Booking collection
booking_collection.create_index([("email", 1), ("date", 1)], unique=True)  # prevent duplicate booking for same date

logging.basicConfig(level=logging.INFO)  # Or use logging.ERROR for prod
logger = logging.getLogger(__name__)

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


# ============================bookings route handler ===============================

# email confirmation 
def send_confirmation_email(to_email, name, travel_date, package):
    msg = EmailMessage()
    msg["Subject"] = "Booking Confirmation - Camouflage Tours"
    msg["From"] = "noreply@camouflage.com"
    msg["To"] = to_email
    msg.set_content(f"""
    Hi {name},

    Your booking for the "{package}" package on {travel_date.strftime('%B %d, %Y')} has been confirmed.

    Thank you for choosing Camouflage Tours!

    Regards,
    Camouflage Team
    """)
    try:
        with smtplib.SMTP('localhost') as smtp:
            smtp.send_message(msg)
    except Exception as e:
        logger.warning(f"Failed to send confirmation email to {to_email}: {e}")


@app.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.get_json()

    required = ["name", "email", "phone", "travelers", "date", "package"]
    if not all(field in data and data[field] for field in required):
        return jsonify({"error": "All required fields must be filled"}), 400

    if not re.match(EMAIL_REGEX, data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    try:
        data["travelers"] = int(data["travelers"])
        if data["travelers"] < 1:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Travelers must be a positive integer"}), 400

    try:
        data["date"] = datetime.strptime(data["date"], "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    try:
        booking_collection.insert_one(data)
        send_confirmation_email(data["email"], data["name"], data["date"], data["package"])
        return jsonify({"message": "Booking successful. Confirmation email sent."}), 200
    except errors.DuplicateKeyError:
        return jsonify({"error": "Booking already exists for this email and date."}), 409
    except Exception as e:
        logger.error(f"Booking insert failed: {e}")
        return jsonify({"error": "Internal server error"}), 500
# highlights route handler
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
@app.route('/api/destinations', methods=['GET'])
def get_destinations():
    destinations = []
    for dest in db["destinations"].find():
        # Convert ObjectId to str if necessary
        dest["_id"] = str(dest["_id"])

        # Resolve the image from the images collection
        if "image_id" in dest:
            image_doc = db["images"].find_one({"_id": ObjectId(dest["image_id"])})
            dest["image"] = image_doc["path"] if image_doc else None
            # Optional: remove the image_id field from response
            del dest["image_id"]
        
        destinations.append(dest)

    return jsonify(destinations)

# packages route handler
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

            # Optional: Remove image_id from response or convert to string
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



if __name__ == '__main__':
    app.run(debug=True)

