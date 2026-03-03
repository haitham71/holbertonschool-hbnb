from app.persistence.repository import InMemoryRepository
from app.models.user import User
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.review import Review


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
        existing_user = self.user_repo.get_by_attribute(
            "email", user_data["email"])
        if existing_user:
            raise ValueError("Email already registered")

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

        if "email" in user_data:
            existing_user = self.user_repo.get_by_attribute(
                "email", user_data["email"])
            if existing_user and existing_user.id != user_id:
                raise ValueError("Email already registered by another user")
            user.email = user_data["email"]

        if "first_name" in user_data:
            user.first_name = user_data["first_name"]

        if "last_name" in user_data:
            user.last_name = user_data["last_name"]

        if "email" in user_data:
            user.email = user_data["email"]

        if "is_admin" in user_data:
            user.is_admin = user_data["is_admin"]

        user.update_timestamp()

        return user

    # ================= PLACE =================

    def create_place(self, place_data):
        """
        Create a new place after validating owner and amenities.
        """

        owner = self.user_repo.get(place_data["owner_id"])
        if not owner:
            raise ValueError("Owner not found")

        place = Place(
            title=place_data["title"],
            description=place_data.get("description", ""),
            price=place_data["price"],
            latitude=place_data["latitude"],
            longitude=place_data["longitude"],
            owner=owner
        )

        amenity_ids = place_data.get("amenities", [])
        for amenity_id in amenity_ids:
            amenity = self.amenity_repo.get(amenity_id)
            if not amenity:
                raise ValueError("Amenity not found")
            place.add_amenity(amenity)

        self.place_repo.add(place)

        owner.places.append(place)

        return place

    def get_place(self, place_id):
        """
        Retrieve a place by ID.
        """
        return self.place_repo.get(place_id)

    def get_all_places(self):
        """
        Retrieve all places.
        """
        return self.place_repo.get_all()

    def update_place(self, place_id, place_data):
        """
        Update place information.
        """
        place = self.place_repo.get(place_id)
        if not place:
            return None

        if "title" in place_data:
            place.title = place_data["title"]

        if "description" in place_data:
            place.description = place_data["description"]

        if "price" in place_data:
            place.price = place_data["price"]

        if "latitude" in place_data:
            place.latitude = place_data["latitude"]

        if "longitude" in place_data:
            place.longitude = place_data["longitude"]

        if "amenities" in place_data:
            place.amenities = []
            for amenity_id in place_data["amenities"]:
                amenity = self.amenity_repo.get(amenity_id)
                if not amenity:
                    raise ValueError("Amenity not found")
                place.add_amenity(amenity)

        return place

    # ================= AMENITIES =================

    def create_amenity(self, amenity_data):
        amenity = Amenity(name=amenity_data["name"])
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            return None

        if "name" in amenity_data:
            amenity.name = amenity_data["name"]

        return amenity


# ================= REVIEW =================

    def create_review(self, review_data):
        user = self.user_repo.get(review_data["user_id"])
        if not user:
            raise ValueError("User not found")

        place = self.place_repo.get(review_data["place_id"])
        if not place:
            raise ValueError("Place not found")

        review = Review(
            text=review_data["text"],
            rating=review_data["rating"],
            user=user,
            place=place
        )

        self.review_repo.add(review)

        user.reviews.append(review)
        place.reviews.append(review)

        return review

    def get_review(self, review_id):
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        place = self.place_repo.get(place_id)
        if not place:
            return None
        return place.reviews

    def update_review(self, review_id, review_data):
        review = self.review_repo.get(review_id)
        if not review:
            return None

        review.update(review_data)
        return review

    def delete_review(self, review_id):
        review = self.review_repo.get(review_id)
        if not review:
            return None

    # Remove from user and place
        review.user.reviews.remove(review)
        review.place.reviews.remove(review)

        self.review_repo.delete(review_id)
        return True
