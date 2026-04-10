from flask_restx import Namespace, Resource, fields
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.facade import HBnBFacade
from app.models.place_image import PlaceImage
from app.models.basemodel import db

api = Namespace('places', description='Place operations')
facade = HBnBFacade()

# Models

place_image_model = api.model('PlaceImage', {
    'id': fields.String(readonly=True),
    'place_id': fields.String,
    'image_url': fields.String(required=True)
})

place_model = api.model('Place', {
    'id': fields.String(readonly=True),
    'title': fields.String(required=True),
    'description': fields.String,
    'price': fields.Float(required=True),
    'latitude': fields.Float(required=True),
    'longitude': fields.Float(required=True),
    'owner_id': fields.String(required=True),
    'max_guests': fields.Integer(required=True),
    'images': fields.List(fields.Nested(place_image_model)),
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
    'image_url': fields.String,
    'images': fields.List(fields.String),
    'max_guests': fields.Integer(required=True),
    'amenities': fields.List(fields.String)
})

place_image_create_model = api.model('PlaceImageCreate', {
    'image_url': fields.String(required=True)
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
    
@api.route('/<string:place_id>/images')
class PlaceImageList(Resource):
    def get(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")
        return [img.to_dict() for img in place.images], 200

    @jwt_required()
    @api.expect(place_image_create_model, validate=True)
    def post(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")

        user_id = get_jwt_identity()
        if place.owner_id != user_id:
            api.abort(403, "You can only modify your own place")

        data = request.json
        image = PlaceImage(place_id=place_id, image_url=data['image_url'])
        db.session.add(image)
        db.session.commit()
        return image.to_dict(), 201
    
@api.route('/images/<string:image_id>')
class PlaceImageResource(Resource):
    @jwt_required()
    def delete(self, image_id):
        image = PlaceImage.query.get(image_id)
        if not image:
            api.abort(404, "Image not found")

        place = facade.get_place(image.place_id)
        user_id = get_jwt_identity()
        if not place or place.owner_id != user_id:
            api.abort(403, "You can only modify your own place")

        db.session.delete(image)
        db.session.commit()
        return {"message": "Image deleted successfully"}, 200