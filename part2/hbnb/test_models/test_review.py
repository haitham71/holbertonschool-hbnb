import unittest
from app.models.review import Review
from app.models.user import User
from app.models.place import Place


class TestReview(unittest.TestCase):
    def setUp(self):
        self.user = User(first_name="John", last_name="Doe",
                         email="john@example.com")
        self.place = Place(title="Apt", description="Nice", price=100.0,
                           latitude=10.0, longitude=10.0, owner=self.user)

    def test_full_review_creation(self):
        review = Review(text="Amazing!", rating=5,
                        place=self.place, user=self.user)
        self.assertEqual(review.text, "Amazing!")
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.user.first_name, "John")

    def test_review_invalid_rating_high(self):
        with self.assertRaises(ValueError) as context:
            Review(text="Good", rating=6, place=self.place, user=self.user)
        self.assertEqual(str(context.exception),
                         "Rating must be between 1 and 5")

    def test_review_invalid_rating_low(self):
        with self.assertRaises(ValueError) as context:
            Review(text="Bad", rating=0, place=self.place, user=self.user)
        self.assertEqual(str(context.exception),
                         "Rating must be between 1 and 5")

    def test_review_empty_text(self):
        with self.assertRaises(ValueError):
            Review(text="   ", rating=4, place=self.place, user=self.user)


if __name__ == "__main__":
    unittest.main()
