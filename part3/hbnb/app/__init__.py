from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api
from flask_jwt_extended import JWTManager
import os
from config import config

from app.api.v1.users import api as users_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.amenities import api as amenities_ns

jwt = JWTManager()
db = SQLAlchemy()


def create_app(config_class=config.DevelopmentConfig):
    #
    # Existent code with app Flask instance
    #
    db.init_app(app)


def create_app():
    app = Flask(__name__)

    env = os.getenv("FLASK_ENV", "default")
    app.config.from_object(config[env])

    jwt.init_app(app)

    api = Api(app,
              title="HBnB API",
              version="1.0",
              description="HBnB Application API")

    api.add_namespace(users_ns, path="/api/v1/users")
    api.add_namespace(places_ns, path="/api/v1/places")
    api.add_namespace(reviews_ns, path="/api/v1/reviews")
    api.add_namespace(amenities_ns, path="/api/v1/amenities")

    return app
