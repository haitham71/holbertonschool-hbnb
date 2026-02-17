import uuid
from datetime import datetime


class User():
    def __init__(self, first_name, last_name, email, password):
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.__password__ = password
        self.is_admin = False
        self.is_owner = False
        self.reviews = [] #List to store reviews
        self.places = [] #List to store places user can hold (if owner)
        