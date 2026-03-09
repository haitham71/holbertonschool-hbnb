from .basemodel import BaseModel
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


class User(BaseModel):

    def __init__(self, first_name, last_name, email, password, is_admin=False):
        super().__init__()

        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin

        # Store password securely
        self.password_hash = None
        self.set_password(password)

        self.places = []
        self.reviews = []

    # ----------------------
    # Password handling
    # ----------------------
    def set_password(self, password):
        """
        Hash and store the password securely
        """
        if not isinstance(password, str):
            raise TypeError("Password must be a string")

        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")

        self.password_hash = bcrypt.generate_password_hash(
            password).decode("utf-8")

    def check_password(self, password):
        """
        Check if provided password matches the stored hash
        """
        return bcrypt.check_password_hash(self.password_hash, password)

    # ----------------------
    # First Name
    # ----------------------
    @property
    def first_name(self):
        return self._first_name

    @first_name.setter
    def first_name(self, value):
        if not isinstance(value, str):
            raise TypeError("First name must be a string")

        if len(value.strip()) == 0:
            raise ValueError("First name cannot be empty")

        if len(value) > 50:
            raise ValueError("First name must be 50 characters max.")

        self._first_name = value

    # ----------------------
    # Last Name
    # ----------------------
    @property
    def last_name(self):
        return self._last_name

    @last_name.setter
    def last_name(self, value):
        if not isinstance(value, str):
            raise TypeError("Last name must be a string")

        if len(value.strip()) == 0:
            raise ValueError("Last name cannot be empty")

        if len(value) > 50:
            raise ValueError("Last name must be 50 characters max.")

        self._last_name = value

    # ----------------------
    # Email
    # ----------------------
    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, value):
        if not isinstance(value, str):
            raise TypeError("Email must be a string")

        if "@" not in value:
            raise ValueError("Invalid email format")

        self._email = value

    # ----------------------
    # Is Admin
    # ----------------------
    @property
    def is_admin(self):
        return self._is_admin

    @is_admin.setter
    def is_admin(self, value):
        if not isinstance(value, bool):
            raise TypeError("Is Admin must be a boolean")

        self._is_admin = value

    def update(self, data):
        if "first_name" in data:
            self.first_name = data["first_name"]

        if "last_name" in data:
            self.last_name = data["last_name"]

        if "email" in data:
            self.email = data["email"]

    def to_dict(self):
        """
        Return user data without password
        """
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }