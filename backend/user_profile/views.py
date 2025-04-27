from flask import request, jsonify
from . import user_profile_bp
from db import get_db
from bson import ObjectId

@user_profile_bp.route('/usr', methods=['GET'])
def get_user_profile():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    try:
        object_id = ObjectId(user_id)
    except Exception:
        return jsonify({'error': 'Invalid user ID format'}), 400

    db = get_db()
    user = db.users.find_one({'_id': object_id})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_data = {
    'name': user.get('name'),
    'role': user.get('role'),
    'avatar': user.get('avatar'),
    'stats': {
        'tours': user.get('stats', {}).get('tours', 0),
        'reviews': user.get('stats', {}).get('reviews', 0),
        'gems': user.get('stats', {}).get('gems', 0),
        'highlights': user.get('stats', {}).get('highlights', []),
        'activities': user.get('stats', {}).get('activities', [])

    },
    'email': user.get('email', '')  # optional, in case you plan to include it later
}


    return jsonify(user_data), 200