# models/user.py

from .basemodel import BaseModel
import re


class User(BaseModel):
    """User model for HBnB application"""

    emails = set()  # To avoid duplicate emails

    def __init__(self, first_name, last_name, email, password, is_admin=False):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.__password = password  # Password is private
        self.is_admin = is_admin
        self.places = []   # Places owned by the user
        self.reviews = []  # Reviews associated with the user

    # ======== Properties with validation ========
    @property
    def first_name(self):
        return self.__first_name

    @first_name.setter
    def first_name(self, value):
        if not isinstance(value, str):
            raise TypeError("First name must be a string")
        if len(value) > 50:
            raise ValueError("First name too long")
        self.__first_name = value

    @property
    def last_name(self):
        return self.__last_name

    @last_name.setter
    def last_name(self, value):
        if not isinstance(value, str):
            raise TypeError("Last name must be a string")
        if len(value) > 50:
            raise ValueError("Last name too long")
        self.__last_name = value

    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, value):
        if not isinstance(value, str):
            raise TypeError("Email must be a string")
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise ValueError("Invalid email format")
        if value in User.emails:
            raise ValueError("Email already exists")
        # Remove old email from set if it exists
        if hasattr(self, "_User__email"):
            User.emails.discard(self.__email)
        self.__email = value
        User.emails.add(value)

    @property
    def password(self):
        """Password cannot be accessed directly from outside"""
        return self.__password

    def check_password(self, password):
        """Verify password without exposing it"""
        return self.__password == password

    @property
    def is_admin(self):
        return self.__is_admin

    @is_admin.setter
    def is_admin(self, value):
        if not isinstance(value, bool):
            raise TypeError("is_admin must be boolean")
        self.__is_admin = value

    # ======== Methods to manage reviews and places ========
    def add_place(self, place):
        self.places.append(place)

    def add_review(self, review):
        self.reviews.append(review)

    def delete_review(self, review):
        if review in self.reviews:
            self.reviews.remove(review)

    # ======== Convert object to dictionary ========
    def to_dict(self):
        """Return user data without the password"""
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_admin": self.is_admin
        }

    # ======== Update modified timestamp ========
    def save(self):
        """Update only the updated_at timestamp"""
        self.updated_at = self._get_current_time()
