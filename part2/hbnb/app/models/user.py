from .basemodel import BaseModel


class User(BaseModel):

    def __init__(self, first_name, last_name, email, is_admin=False):
        super().__init__()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
        self.places = []
        self.reviews = []

    # ----------------------
    # First Name
    # ----------------------
    @property
    def first_name(self):
        return self.__first_name

    @first_name.setter
    def first_name(self, value):
        if not isinstance(value, str):
            raise TypeError("First name must be a string")

        if len(value) > 50:
            raise ValueError("First name must be 50 characters max.")

        self.__first_name = value

    # ----------------------
    # Last Name
    # ----------------------
    @property
    def last_name(self):
        return self.__last_name

    @last_name.setter
    def last_name(self, value):
        if not isinstance(value, str):
            raise TypeError("Last name must be a string")

        if len(value) > 50:
            raise ValueError("Last name must be 50 characters max.")

        self.__last_name = value

    # ----------------------
    # Email
    # ----------------------
    @property
    def email(self):
        return self.__email

    @email.setter
    def email(self, value):
        if not isinstance(value, str):
            raise TypeError("Email must be a string")

        if "@" not in value:
            raise ValueError("Invalid email format")

        self.__email = value

    # ----------------------
    # Is Admin
    # ----------------------
    @property
    def is_admin(self):
        return self.__is_admin

    @is_admin.setter
    def is_admin(self, value):
        if not isinstance(value, bool):
            raise TypeError("Is Admin must be a boolean")

        self.__is_admin = value

    def update(self, data):
        if "first_name" in data:
            self.first_name = data["first_name"]

        if "last_name" in data:
            self.last_name = data["last_name"]

        if "email" in data:
            self.email = data["email"]


    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }
