from app.persistence.repository import InMemoryRepository
from app.models.user import User


class HBnBFacade:
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.place_repo = InMemoryRepository()
        self.review_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()

    # ================= USERS =================

    def create_user(self, user_data):
        """
        Create a new user and store it in repository
        """
        user = User(
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            email=user_data["email"],
            is_admin=user_data.get("is_admin", False)
        )
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        """
        Retrieve a user by ID
        """
        return self.user_repo.get(user_id)

    def get_all_users(self):
        """
        Retrieve all users
        """
        return self.user_repo.get_all()

    def update_user(self, user_id, user_data):
        """
        Update an existing user
        """
        user = self.user_repo.get(user_id)
        if not user:
            return None

        if "first_name" in user_data:
            user.first_name = user_data["first_name"]

        if "last_name" in user_data:
            user.last_name = user_data["last_name"]

        if "email" in user_data:
            user.email = user_data["email"]

        if "is_admin" in user_data:
            user.is_admin = user_data["is_admin"]

        return user

    # ================= PLACE (placeholder) =================

    def get_place(self, place_id):
        # Logic will be implemented in later tasks
        return self.place_repo.get(place_id)
