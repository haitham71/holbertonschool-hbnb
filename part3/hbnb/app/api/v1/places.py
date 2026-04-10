from flask_restx import Namespace, Resource, fields
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.facade import HBnBFacade

api = Namespace('places', description='Place operations')
facade = HBnBFacade()

# Models
place_model = api.model('Place', {
    'id': fields.String(readonly=True),
    'title': fields.String(required=True),
    'description': fields.String,
    'price': fields.Float(required=True),
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True),
    'owner_id': fields.String(required=True),
    'max_guests': fields.Integer(required=True),
    'amenities': fields.List(fields.String),
    'created_at': fields.DateTime,
    'updated_at': fields.DateTime
})

place_create_model = api.model('PlaceCreate', {
    'title': fields.String(required=True),
    'description': fields.String,
    'price': fields.Float(required=True),
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True),
    'max_guests': fields.Integer(required=True),
    'amenities': fields.List(fields.String)
})

@api.route('/')
class PlaceList(Resource):
    @jwt_required()
    @api.expect(place_create_model)
    def post(self):
        """Create a new place"""
        data = request.json
        data["owner_id"] = get_jwt_identity()

        success, result = facade.create_place(data)
        if success:
            return result.to_dict(), 201
        api.abort(400, result)

    def get(self):
        """Get all places"""
        places = facade.get_all_places()
        return [p.to_dict() for p in places], 200

@api.route('/<string:place_id>')
class PlaceResource(Resource):
    def get(self, place_id):
        """Get place by ID"""
        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")
        return place.to_dict(), 200

    @jwt_required()
    def put(self, place_id):
        """Update place"""
        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")

        user_id = get_jwt_identity()
        if place.owner_id != user_id:
            api.abort(403, "You can only modify your own place")

        success, result = facade.update_place(place_id, request.json)
        if success:
            return result.to_dict(), 200
        api.abort(400, result)

@api.route('/<string:place_id>/reviews')
class PlaceReviewList(Resource):
    def get(self, place_id):
        """Get all reviews for a place"""
        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")
        return [r.to_dict() for r in place.reviews], 200