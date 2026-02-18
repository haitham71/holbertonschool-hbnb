'''
place module
'''
from .basemodel import BaseModel


class Place(BaseModel):
    def __init__(self, title, description, price, latitude, longitude, owner):
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner
        self.reviews = []  # List to store related reviews
        self.amenities = []  # List to store related amenities

    def add_review(self, review):
        """Add a review to the place."""
        self.reviews.append(review)

    def add_amenity(self, amenity):
        """Add an amenity to the place."""
        self.amenities.append(amenity)

    @property
    def title(self):
        return self.title

    @title.setter
    def title(self, value):
        if not isinstance(value, str):
            raise ("title of the place must be a string")
        super().is_max_length("{value}", value, 100)
        self.title = value

    @property
    def description(self):
        return self.description

    @description.setter
    def description(self, value):
        self.description = value

    @property
    def price(self):
        return self.price

    @price.setter
    def price(self, value):
        if not isinstance(value, float) and value < 0:
            raise ("please must be a positive number")
        self.price = value

    @property
    def latitude(self):
        return self.latitude

    @latitude.setter
    def latitude(self, value):
        if not isinstance(value, float) and -90.0 <= value <= 90.0:
            raise ("please enter a number between -90.0 to 90.0")
        self.latitude = value

    @property
    def longitude(self):
        return self.longitude

    @longitude.setter
    def longitude(self, value):
        if not isinstance(value, float) and -180.0 <= value <= 180.0:
            raise ("please enter a number between -180.0 to 180.0")
        self.latitude = value

    @property
    def owner(self):
        return self.owner

    @owner.setter
    def owner(self, value):
        if not isinstance(value, bool):
            raise ("owner must be bool")
        self.__owner = value
