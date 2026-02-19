from .basemodel import BaseModel


class Place(BaseModel):
    """
    This class represents a place in the system.
    A place has an owner (User) and can contain multiple amenities.
    """

    def __init__(self, title, description, price, latitude, longitude, owner):
        # Generate id, created_at, updated_at from BaseModel
        super().__init__()

        # Basic place information
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude

        # The user object who owns this place
        self.owner = owner

        # List of Amenity objects
        self.amenities = []


    @property
    def title(self):
        return self.__title

    @title.setter
    def title(self, value):
        # Make sure title is a string
        if not isinstance(value, str):
            raise TypeError("Title must be a string")

        # Title should not be empty
        if len(value.strip()) == 0:
            raise ValueError("Title cannot be empty")

        self.__title = value



    @property
    def price(self):
        return self.__price

    @price.setter
    def price(self, value):
        # Price must be a number
        if not isinstance(value, (int, float)):
            raise TypeError("Price must be a number")

        # Price must be positive
        if value <= 0:
            raise ValueError("Price must be greater than 0")

        self.__price = value


    @property
    def latitude(self):
        return self.__latitude

    @latitude.setter
    def latitude(self, value):
        # Latitude must be numeric
        if not isinstance(value, (int, float)):
            raise TypeError("Latitude must be a number")

        # Latitude range check
        if value < -90 or value > 90:
            raise ValueError("Latitude must be between -90 and 90")

        self.__latitude = value


    @property
    def longitude(self):
        return self.__longitude

    @longitude.setter
    def longitude(self, value):
        # Longitude must be numeric
        if not isinstance(value, (int, float)):
            raise TypeError("Longitude must be a number")

        # Longitude range check
        if value < -180 or value > 180:
            raise ValueError("Longitude must be between -180 and 180")

        self.__longitude = value


    def add_amenity(self, amenity):
        """
        Add an Amenity object to this place.
        """
        self.amenities.append(amenity)


    def to_dict(self):
        """
        Convert the place object to a dictionary.
        This is what the API will return as JSON.
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "owner": self.owner.to_dict(),  # include owner info
            "amenities": [a.to_dict() for a in self.amenities]
        }
