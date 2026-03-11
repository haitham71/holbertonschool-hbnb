import unittest
from app.models.place import Place
from app.models.user import User
from app.models.review import Review


class TestPlace(unittest.TestCase):
    def setUp(self):
        self.owner = User(first_name="Alice", last_name="Smith",
                          email="alice@example.com")
        self.place = Place(title="Cozy Apartment", description="Nice", price=100.0,
                           latitude=37.7, longitude=-122.4, owner=self.owner)

    def test_place_creation_and_relationships(self):
        self.assertEqual(self.place.title, "Cozy Apartment")
        self.assertEqual(self.place.price, 100.0)

        review = Review(text="Great stay!", rating=5,
                        place=self.place, user=self.owner)
        self.place.add_review(review)
        self.assertEqual(len(self.place.reviews), 1)
        self.assertEqual(self.place.reviews[0].text, "Great stay!")

    def test_place_invalid_price(self):
        with self.assertRaises(ValueError) as context:
            self.place.price = -50.0
        self.assertEqual(str(context.exception),
                         "Price must be greater than 0")

    def test_place_invalid_coordinates(self):
        with self.assertRaises(ValueError):
            self.place.latitude = 100.0

        with self.assertRaises(ValueError):
            self.place.longitude = 200.0

    def test_place_title_max_length(self):
        with self.assertRaises(ValueError) as context:
            self.place.title = "A" * 105
        self.assertEqual(str(context.exception),
                         "title cannot exceed 100 characters")

    def test_place_empty_title(self):
        with self.assertRaises(ValueError):
            self.place.title = "   "


if __name__ == "__main__":
    unittest.main()
