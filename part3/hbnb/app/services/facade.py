from app.models.user import User
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.review import Review
from app.models.place_image import PlaceImage
from app.services.repositories import (
    UserRepository,
    PlaceRepository,
    ReviewRepository,
    AmenityRepository
)
from app import db


class HBnBFacade:
    def __init__(self):
        self.user_repository = UserRepository()
        self.place_repository = PlaceRepository()
        self.review_repository = ReviewRepository()
        self.amenity_repository = AmenityRepository()

    # ================= USERS =================
    def create_user(self, user_data):
        try:
            if self.get_user_by_email(user_data.get('email')):
                return False, "Email already registered"

            user = User(**user_data)
            self.user_repository.add(user)
            return True, user
        except (TypeError, ValueError) as e:
            return False, str(e)

    def get_user(self, user_id):
        return self.user_repository.get(user_id)

    def get_all_users(self):
        return self.user_repository.get_all()

    def get_user_by_email(self, email):
        return self.user_repository.get_user_by_email(email)

    def update_user(self, user_id, user_data):
        try:
            user = self.user_repository.get(user_id)
            if not user:
                return False, 'User not found'

            if 'email' in user_data:
                existing = self.get_user_by_email(user_data['email'])
                if existing and existing.id != user_id:
                    return False, 'Email already used by another user'

            user.update(user_data)
            db.session.commit()
            return True, user
        except (ValueError, TypeError) as e:
            return False, str(e)

    # ================= AMENITIES =================
    def create_amenity(self, amenity_data):
        try:
            if self.get_amenity_by_name(amenity_data.get('name')):
                return False, "Amenity name already exists"

            amenity = Amenity(**amenity_data)
            self.amenity_repository.add(amenity)
            return True, amenity
        except (TypeError, ValueError) as e:
            return False, str(e)

    def get_amenity(self, amenity_id):
        return self.amenity_repository.get(amenity_id)

    def get_all_amenities(self):
        return self.amenity_repository.get_all()

    def get_amenity_by_name(self, name):
        return self.amenity_repository.get_amenity_by_name(name)

    def update_amenity(self, amenity_id, amenity_data):
        try:
            amenity = self.amenity_repository.get(amenity_id)
            if not amenity:
                return False, 'Amenity not found'

            if 'name' in amenity_data:
                existing = self.get_amenity_by_name(amenity_data['name'])
                if existing and existing.id != amenity_id:
                    return False, 'Amenity name already exists'

            amenity.update(amenity_data)
            db.session.commit()
            return True, amenity
        except (ValueError, TypeError) as e:
            return False, str(e)

    # ================= PLACES =================
    def create_place(self, place_data):
        try:
            owner_id = place_data.get('owner_id')
            owner = self.user_repository.get(owner_id)
            if not owner:
                return False, "Owner not found"

            amenity_ids = place_data.pop('amenities', [])
            extra_images = place_data.pop('images', [])

            place_data['owner_id'] = owner.id
            place = Place(**place_data)

            for amenity_id in amenity_ids:
                amenity = self.amenity_repository.get(amenity_id)
                if not amenity:
                    return False, f"Amenity with id {amenity_id} not found"
                place.add_amenity(amenity)

            db.session.add(place)
            db.session.flush()

            for image_url in extra_images:
                if image_url and image_url.strip():
                    image = PlaceImage(place_id=place.id, image_url=image_url.strip())
                    db.session.add(image)

            db.session.commit()
            return True, place

        except (TypeError, ValueError) as e:
            db.session.rollback()
            return False, str(e)
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    def get_place(self, place_id):
        return self.place_repository.get(place_id)

    def get_all_places(self):
        return self.place_repository.get_all()

    def get_places_by_owner(self, owner_id):
        return self.place_repository.get_places_by_owner(owner_id)

    def update_place(self, place_id, place_data):
        try:
            place = self.place_repository.get(place_id)
            if not place:
                return False, 'Place not found'

            if 'owner_id' in place_data:
                new_owner_id = place_data.pop('owner_id')
                new_owner = self.user_repository.get(new_owner_id)
                if not new_owner:
                    return False, "New owner not found"
                place.owner_id = new_owner_id

            amenity_ids = place_data.pop('amenities', None)
            if amenity_ids is not None:
                place.amenities = []
                for amenity_id in amenity_ids:
                    amenity = self.amenity_repository.get(amenity_id)
                    if not amenity:
                        return False, f"Amenity with id {amenity_id} not found"
                    place.add_amenity(amenity)

            place.update(place_data)
            db.session.commit()
            return True, place

        except (ValueError, TypeError) as e:
            db.session.rollback()
            return False, str(e)
        except Exception as e:
            db.session.rollback()
            return False, str(e)
        
        
        
    def delete_amenity(self, amenity_id):
        try:
            amenity = self.amenity_repository.get(amenity_id)
            if not amenity:
                return False, "Amenity not found"

            self.amenity_repository.delete(amenity_id)
            return True, None
        except Exception as e:
            return False, str(e)

    # ================= REVIEWS =================
    def create_review(self, review_data):
        try:
            user_id = review_data.get('user_id')
            place_id = review_data.get('place_id')

            user = self.user_repository.get(user_id)
            place = self.place_repository.get(place_id)

            if not user:
                return False, "User not found"
            if not place:
                return False, "Place not found"

            if place.owner_id == user.id:
                return False, "You cannot review your own place"

            existing_reviews = self.review_repository.get_reviews_by_place(place_id)
            for review in existing_reviews:
                if review.user_id == user.id:
                    return False, "You have already reviewed this place"

            review = Review(
                text=review_data.get('text'),
                rating=review_data.get('rating'),
                user_id=user.id,
                place_id=place.id
            )

            self.review_repository.add(review)
            return True, review
        except (ValueError, TypeError) as e:
            return False, str(e)

    def get_review(self, review_id):
        return self.review_repository.get(review_id)

    def get_all_reviews(self):
        return self.review_repository.get_all()

    def get_reviews_by_place(self, place_id):
        return self.review_repository.get_reviews_by_place(place_id)

    def update_review(self, review_id, review_data):
        try:
            review = self.review_repository.get(review_id)
            if not review:
                return False, 'Review not found'

            review_data.pop('user_id', None)
            review_data.pop('place_id', None)

            review.update(review_data)
            db.session.commit()
            return True, review
        except (ValueError, TypeError) as e:
            db.session.rollback()
            return False, str(e)
        except Exception as e:
            db.session.rollback()
            return False, str(e)

    def delete_review(self, review_id):
        try:
            review = self.review_repository.get(review_id)
            if not review:
                return False, 'Review not found'

            self.review_repository.delete(review_id)
            return True, None
        except Exception as e:
            return False, str(e)

    def get_average_rating_for_place(self, place_id):
        return self.review_repository.get_average_rating_for_place(place_id)
    
    