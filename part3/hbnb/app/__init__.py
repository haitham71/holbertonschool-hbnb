from flask import Flask
from flask_restx import Api
import os
from config import config
from app.api.v1.users import api as users_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.amenities import api as amenities_ns


def create_app():
    app = Flask(__name__)

    # Determine which config to use (development by default)
    env = os.getenv('FLASK_ENV', 'default')

    # Load the selected configuration
    app.config.from_object(config[env])

    api = Api(app,
              title="HBnB API",
              version="1.0",
              description="HBnB Application API")

    # Register API namespaces
    api.add_namespace(users_ns, path="/api/v1/users")
    api.add_namespace(places_ns, path="/api/v1/places")
    api.add_namespace(reviews_ns, path="/api/v1/reviews")
    api.add_namespace(amenities_ns, path="/api/v1/amenities")

    return app