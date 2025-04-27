from flask import Blueprint

admin_profile_bp = Blueprint('admin_profile', __name__, url_prefix='/api/profile/admin')

from . import views
