from flask import Flask
from flask_restx import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from config import config
from app.models.basemodel import db

jwt = JWTManager()

def create_app(config_name=None):
    app = Flask(__name__)

    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    app.config.from_object(config[config_name])

    jwt.init_app(app)
    db.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.api.v1.users import api as users_ns
    from app.api.v1.places import api as places_ns
    from app.api.v1.reviews import api as reviews_ns
    from app.api.v1.amenities import api as amenities_ns

    api = Api(
        app,
        title="HBnB API",
        version="1.0",
        description="HBnB Application API"
    )

    api.add_namespace(users_ns, path="/api/v1/users")
    api.add_namespace(places_ns, path="/api/v1/places")
    api.add_namespace(reviews_ns, path="/api/v1/reviews")
    api.add_namespace(amenities_ns, path="/api/v1/amenities")

    with app.app_context():
        db.create_all()

    return app