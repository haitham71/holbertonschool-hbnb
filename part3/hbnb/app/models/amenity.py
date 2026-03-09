from .basemodel import BaseModel


class Amenity(BaseModel):
    """
    Represents an amenity (e.g., WiFi, Parking, Pool)
    """

    def __init__(self, name):
        super().__init__()
        self.name = name

    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("Name must be a string")

        if len(value) > 50:
            raise ValueError("Name must be 50 characters max.")

        if len(value.strip()) == 0:
            raise ValueError("Name cannot be empty")

        self.__name = value

    def update(self, data):
        if "name" in data:
            self.name = data["name"]

    # ----------------------
    # Serialization
    # ----------------------

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name
        }
