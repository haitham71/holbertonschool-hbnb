from flask_restx import Namespace, Resource, fields
from flask import request
from flask_jwt_extended import jwt_required, get_jwt
from app.services.facade import HBnBFacade

api = Namespace('amenities', description='Amenity operations')
facade = HBnBFacade()

# Models
amenity_model = api.model('Amenity', {
    'id': fields.String(readonly=True),
    'name': fields.String(required=True),
    'created_at': fields.DateTime,
    'updated_at': fields.DateTime
})

amenity_create_model = api.model('AmenityCreate', {
    'name': fields.String(required=True)
})

@api.route('/')
class AmenityList(Resource):
    @jwt_required()
    @api.expect(amenity_create_model)
    def post(self):
        """Create a new amenity (admin only)"""
        current_user = get_jwt()
        if not current_user.get('is_admin'):
            api.abort(403, 'Admin privileges required')

        success, result = facade.create_amenity(request.json)
        if success:
            return result.to_dict(), 201
        api.abort(400, result)

    def get(self):
        """Get all amenities"""
        amenities = facade.get_all_amenities()
        return [a.to_dict() for a in amenities], 200

@api.route('/<string:amenity_id>')
class AmenityResource(Resource):
    def get(self, amenity_id):
        """Get amenity by ID"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            api.abort(404, "Amenity not found")
        return amenity.to_dict(), 200

    @jwt_required()
    def put(self, amenity_id):
        """Update amenity"""
        current_user = get_jwt()
        if not current_user.get('is_admin'):
            api.abort(403, 'Admin privileges required')

        success, result = facade.update_amenity(amenity_id, request.json)
        if success:
            return result.to_dict(), 200
        api.abort(400, result)
        
    @jwt_required()
    def delete(self, amenity_id):
        """Delete amenity (admin only)"""
        current_user = get_jwt()
        if not current_user.get('is_admin'):
            api.abort(403, 'Admin privileges required')

        success, result = facade.delete_amenity(amenity_id)
        if success:
            return {"message": "Amenity deleted successfully"}, 200
        api.abort(400, result)