# ===============================
# MEDIA UPLOAD MODULE
# ===============================

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from datetime import datetime
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
from bson import ObjectId
from dotenv import load_dotenv
from googleapiclient.http import MediaIoBaseUpload
from io import BytesIO
from config import PesapalConfig # or wherever your config lives
import sys




import mimetypes
import os

# ===============================
# ENV SETUP & SERVICE INIT
# ===============================

load_dotenv()

media_bp = Blueprint('media', __name__)

# PesapalConfig.MEDIA_BASE_URL = os.getenv('PesapalConfig.MEDIA_BASE_URL')
# FLASK_ENV = os.getenv('FLASK_ENV')
# PesapalConfig.MONGO_URI = os.getenv('PROD_PesapalConfig.MONGO_URI') if FLASK_ENV == 'production' else os.getenv('DEV_PesapalConfig.MONGO_URI')
# PesapalConfig.GOOGLE_CREDENTIALS_PATH = os.getenv("PesapalConfig.GOOGLE_CREDENTIALS_PATH")

if not PesapalConfig.GOOGLE_CREDENTIALS_PATH or not os.path.exists(PesapalConfig.GOOGLE_CREDENTIALS_PATH):
    raise FileNotFoundError("Google credentials file not found or path not set correctly.")

credentials = service_account.Credentials.from_service_account_file(PesapalConfig.GOOGLE_CREDENTIALS_PATH)
drive_service = build('drive', 'v3', credentials=credentials)

client = MongoClient(PesapalConfig.MONGO_URI)
db = client.get_default_database()
media_collection = db.media

# ===============================
# MEDIA STORAGE STRUCTURE
# ===============================

MEDIA_STRUCTURE = {
    "avatar": "camotrails/media/images/avatar",
    "package-img": "camotrails/media/images/packages",
    "destination-img": "camotrails/media/images/destinations",
    "itenary-img": "camotrails/media/images/itenary",
    "pckg-highlights": "camotrails/media/images/packages/highlights",
    "video-documentary": "camotrails/media/videos/documentary",
    "video-highlights": "camotrails/media/videos/highlights",
    "destination-highlights": "camotrails/media/images/destinations/highlights"
}

# ===============================
# GOOGLE DRIVE HELPER FUNCTION
# ===============================

def get_or_create_folder(name, parent_id=None):
    """Create or retrieve a Google Drive folder."""
    query = f"name='{name}' and mimeType='application/vnd.google-apps.folder'"
    if parent_id:
        query += f" and '{parent_id}' in parents"

    response = drive_service.files().list(
        q=query, spaces='drive', fields='files(id, name)'
    ).execute()

    files = response.get('files', [])
    if files:
        print(f"[GDRIVE] Folder found: {name}")
        return files[0]['id']

    file_metadata = {'name': name, 'mimeType': 'application/vnd.google-apps.folder'}
    if parent_id:
        file_metadata['parents'] = [parent_id]

    folder = drive_service.files().create(
        body=file_metadata, fields='id'
    ).execute()
    
    print(f"[GDRIVE] Created new folder: {name}")
    return folder['id']

# ===============================
# IN-MEMORY SHARED FOLDER TRACKING
# ===============================
shared_root_folders = set()

# ===============================
# UPLOAD ENDPOINT
# ===============================
@media_bp.route('/upload', methods=['POST'])
def upload_media():
    print("[UPLOAD] Request received")
    media_class = request.form.get("media_class")
    uploaded_by = request.form.get("uploaded_by")
    file = request.files.get("file")

    if not media_class or media_class not in MEDIA_STRUCTURE:
        return jsonify({"status": "error", "message": "Invalid media class"}), 400

    if not file:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    # ===============================
    # CREATE GOOGLE DRIVE FOLDER STRUCTURE
    # ===============================
    path_parts = MEDIA_STRUCTURE[media_class].split('/')
    parent_id = None
    full_path = ""
    for part in path_parts:
        full_path = f"{full_path}/{part}" if full_path else part
        parent_id = get_or_create_folder(part, parent_id)

        # SHARE ROOT ONCE ONLY
        if full_path == "camotrails" and full_path not in shared_root_folders and uploaded_by:
            try:
                share_with_user(parent_id, uploaded_by)
                shared_root_folders.add(full_path)
            except Exception as share_err:
                print(f"[ERROR] Could not share root folder: {share_err}")

    # ===============================
    # PREPARE UPLOAD DIRECTLY FROM MEMORY
    # ===============================
    filename = secure_filename(file.filename)
    extension = filename.rsplit('.', 1)[-1].lower()
    mime_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'

    try:
        file_stream = BytesIO(file.read())
        media = MediaIoBaseUpload(file_stream, mimetype=mime_type)

        uploaded_file = drive_service.files().create(
            body={'name': filename, 'parents': [parent_id]},
            media_body=media,
            fields='id'
        ).execute()

        file_id = uploaded_file.get('id')
        print(f"[GDRIVE] File uploaded with ID: {file_id}")

    except Exception as e:
        print(f"[ERROR] Upload failed: {e}")
        return jsonify({"status": "error", "message": "Upload failed"}), 500

    # ===============================
    # DB SAVE
    # ===============================
    media_doc = {
        "type": "video" if 'video' in mime_type else "image",
        "class": media_class,
        "file_id": file_id,
        "filename": filename,
        "extension": extension,
        "mime": mime_type,
        "uploaded_by": uploaded_by,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        insert_result = media_collection.insert_one(media_doc)
        media_doc["_id"] = str(insert_result.inserted_id)
        print(f"[DB] Media document inserted with _id: {media_doc['_id']}")
    except Exception as e:
        print(f"[ERROR] Failed to insert media doc into DB: {e}")
        return jsonify({"status": "error", "message": "Database error"}), 500

    return jsonify({
        "status": "success",
        "message": "File uploaded successfully",
        "file_url": f"{PesapalConfig.MEDIA_BASE_URL}{file_id}",
        "media": media_doc
    })


# ===============================
# SHARE MEDIA FILE ROOT DIR TO PERSONAL ACC // LATER SWAP FOR ORG GGL ACC IN PRODUCTION
# ===============================
def share_with_user(file_id, email):
    """Share Google Drive file/folder with a user."""
    permission = {
        'type': 'user',
        'role': 'writer',
        'emailAddress': email #THE EMAIL IS RECEIVED FROM THE UPLOADED BY FEILD FROM THE FRONT END FORM SUBMISSION ... SWAP THIS FOR AND ENV VAR FOR AN ABSLUTE ACC WHERE ALL MEDIA WILL BE SHARED IN PROCUCTON
    }
    try:
        drive_service.permissions().create(
            fileId=file_id,
            body=permission,
            fields='id'
        ).execute()
        print(f"[GDRIVE] Shared folder {file_id} with {email}")
    except Exception as e:
        print(f"[ERROR] Failed to share folder: {e}")


# ===============================
# MEDIA FILE URL BUILDER
# ===============================

def build_media_url(file_id: str) -> str:
    """
    Generates a full Google Drive embed URL from file ID using app config.

    Args:
        file_id (str): Unique file ID from Google Drive.

    Returns:
        str: Full URL for use as src in frontend <img> or <video> tag.
    """

    return f"{PesapalConfig.MEDIA_BASE_URL}{file_id}"


# ===============================
# 1. GET SINGLE MEDIA EMBED LINK
# ===============================
@media_bp.route('/embed', methods=['GET'])
def get_media_embed():
    # --------------------------
    # VALIDATE INPUT
    # --------------------------
    file_id = request.args.get('file_id')
    if not file_id:
        return jsonify({"status": "fail", "message": "Missing file_id"}), 400

    # --------------------------
    # BUILD URL
    # --------------------------
    media_url = build_media_url(file_id)
    if not media_url:
        return jsonify({"status": "fail", "message": "Unable to generate media URL"}), 500

    # --------------------------
    # RETURN SUCCESS
    # --------------------------
    return jsonify({
        "status": "success",
        "media_url": media_url,
        "message": "Media URL ready for frontend"
    }), 200


# ===============================
# 2. GET ALL MEDIA WITH EMBED URLS
# ===============================
@media_bp.route('/all', methods=['GET'])
def get_all_media():
    try:
        # --------------------------
        # FETCH ALL MEDIA DOCS
        # --------------------------
        media_docs = list(media_collection.find({}))

        # --------------------------
        # BUILD RESPONSE DATA
        # --------------------------
        result = []
        for doc in media_docs:
            file_id = doc.get("file_id")
            media_url = build_media_url(file_id)

            result.append({
                "id": str(doc.get("_id")),
                "file_id": file_id,
                "filename": doc.get("filename"),
                "type": doc.get("type"),
                "class": doc.get("class"),
                "mime": doc.get("mime"),
                "uploaded_by": doc.get("uploaded_by"),
                "created_at": doc.get("created_at"),
                "media_url": media_url
            })

        # --------------------------
        # RETURN SUCCESS RESPONSE
        # --------------------------
        return jsonify({
            "status": "success",
            "count": len(result),
            "media": result,
            "message": "All media retrieved successfully"
        }), 200

    except Exception as e:
        print(f"[MEDIA_FETCH_ERROR] {e}", file=sys.stderr)
        return jsonify({
            "status": "fail",
            "message": "Error fetching media from database"
        }), 500