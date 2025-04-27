from flask import Blueprint

user_profile_bp = Blueprint('user_profile', __name__, url_prefix='/api/profile/usr')

from . import views
