from flask_restx import Namespace, Resource, fields
from flask import request
from app.services import facade

api = Namespace('users', description='User operations')


user_model = api.model('User', {
    "id": fields.String(readonly=True),
    "first_name": fields.String(required=True),
    "last_name": fields.String(required=True),
    "email": fields.String(required=True),
    "is_admin": fields.Boolean
})


@api.route('/')
class UserList(Resource):

    @api.marshal_list_with(user_model)
    def get(self):
        users = facade.get_all_users()
        return [u.to_dict() for u in users], 200

    @api.expect(user_model, validate=True)
    @api.marshal_with(user_model, code=201)
    def post(self):
        try:
            user = facade.create_user(request.json)
            return user.to_dict(), 201
        except (TypeError, ValueError) as e:
            api.abort(400, str(e))


@api.route('/<string:user_id>')
class UserResource(Resource):

    @api.marshal_with(user_model)
    def get(self, user_id):
        user = facade.get_user(user_id)
        if not user:
            api.abort(404, "User not found")
        return user.to_dict(), 200

    @api.expect(user_model, validate=True)
    @api.marshal_with(user_model)
    def put(self, user_id):
        try:
            user = facade.update_user(user_id, request.json)
            if not user:
                api.abort(404, "User not found")
            return user.to_dict(), 200
        except (TypeError, ValueError) as e:
            api.abort(400, str(e))
