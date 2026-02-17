# app/api/user_routes.py

from flask import Blueprint, request, jsonify
from facade.hbnb_facade import HBnBFacade

user_bp = Blueprint('user_bp', __name__, url_prefix='/api/v1/users')
facade = HBnBFacade()

@user_bp.route('/', methods=['GET'])
def get_users():
    """Get list of all users"""
    users = facade.get_all_users()
    return jsonify([user.to_dict() for user in users]), 200

@user_bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a single user by id"""
    user = facade.get_user(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200

@user_bp.route('/', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.json
    try:
        user = facade.create_user(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password=data['password'],
            is_admin=data.get('is_admin', False)
        )
        return jsonify(user.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@user_bp.route('/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user information"""
    data = request.json
    user = facade.update_user(user_id, data)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200
