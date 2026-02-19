'''
place module
'''
from basemodel import BaseModel


class Place(BaseModel):
    def __init__(self, title, description, price, latitude, longitude, owner_id):
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner_id = owner_id
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
        return self._title

    @title.setter
    def title(self, value):
        if not isinstance(value, str):
            raise TypeError("title of the place must be a string")
        super().is_max_length("title", value, 100)
        self._title = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if not isinstance(value, float):
            raise TypeError("please must be a number")
        if float(value) < 0:
            raise TypeError("please must be a positive number")
        self._price = value

    @property
    def latitude(self):
        return self._latitude

    @latitude.setter
    def latitude(self, value):
        if not isinstance(value, float):
            raise ValueError("please enter a number")
        if -90.0 > float(value) > 90.0:
            raise ValueError("please enter a number between -90.0 to 90.0")
        self._latitude = value

    @property
    def longitude(self):
        return self._longitude

    @longitude.setter
    def longitude(self, value):
        if not isinstance(value, float):
            raise ValueError("please enter a number")
        if -180.0 > float(value) > 180.0:
            raise ValueError("please enter a number between -180.0 to 180.0")
        self._longitude = value

    @property
    def owner_id(self):
        return self._owner_id

    @owner_id.setter
    def owner_id(self, value):
        if not isinstance(value, str):
            raise TypeError("Owner ID must be a string")
        if len(value) == 0:
            raise ValueError("Owner ID cannot be empty")

        self._owner_id = value
