import uuid
from .basemodel import BaseModel
from datetime import datetime


class Review(BaseModel):
    """
    Represents a review.
    Can be created in two ways:
    1) Simple review with name (for old tests)
    2) Full review with text, rating, place, and user
    """

    def __init__(self, name=None, text=None, rating=None, place=None, user=None):
        super().__init__()

        # Case 1: simple review (used in some tests)
        if name is not None:
            self.name = name
            return

        # Case 2: full review
        self.text = text
        self.rating = rating
        self.place = place
        self.user = user

    # ---------- Name (for simple test mode) ----------
    @property
    def name(self):
        return getattr(self, "_Review__name", None)

    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("Name must be a string")
        if len(value) > 50:
            raise ValueError("Name must be 50 characters max.")
        self.__name = value

    # ---------- Text ----------
    @property
    def text(self):
        return getattr(self, "_Review__text", None)

    @text.setter
    def text(self, value):
        if not isinstance(value, str):
            raise TypeError("Text must be a string")
        if len(value.strip()) == 0:
            raise ValueError("Text cannot be empty")
        self.__text = value

    # ---------- Rating ----------
    @property
    def rating(self):
        return getattr(self, "_Review__rating", None)

    @rating.setter
    def rating(self, value):
        if not isinstance(value, int):
            raise TypeError("Rating must be an integer")
        if value < 1 or value > 5:
            raise ValueError("Rating must be between 1 and 5")
        self.__rating = value

    # ---------- Serialization ----------
    def to_dict(self):
        if hasattr(self, "_Review__name"):
            return {
                "id": self.id,
                "name": self.name
            }

        return {
            "id": self.id,
            "text": self.text,
            "rating": self.rating,
            "user_id": self.user.id if self.user else None,
            "place_id": self.place.id if self.place else None
        }
