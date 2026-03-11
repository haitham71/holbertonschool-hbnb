import unittest
from app.models.user import User


class TestUser(unittest.TestCase):
    def test_user_creation(self):
        user = User(first_name="John", last_name="Doe",
                    email="john.doe@example.com")
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
        self.assertEqual(user.email, "john.doe@example.com")
        self.assertFalse(user.is_admin)

    def test_user_invalid_email(self):
        with self.assertRaises(ValueError) as context:
            User(first_name="John", last_name="Doe", email="invalid-email")
        self.assertEqual(str(context.exception), "Invalid email format")

    def test_user_empty_name(self):
        with self.assertRaises(ValueError) as context:
            User(first_name="   ", last_name="Doe",
                 email="john.doe@example.com")
        self.assertEqual(str(context.exception), "First name cannot be empty")

    def test_user_max_length(self):
        with self.assertRaises(ValueError) as context:
            User(first_name="A" * 55, last_name="Doe", email="john@example.com")
        self.assertEqual(str(context.exception),
                         "first_name cannot exceed 50 characters")

    def test_user_update(self):
        user = User(first_name="John", last_name="Doe",
                    email="john.doe@example.com")
        new_data = {'first_name': "Jane", 'last_name': "Smith"}
        user.update(new_data)
        self.assertEqual(user.first_name, "Jane")
        self.assertEqual(user.last_name, "Smith")


if __name__ == "__main__":
    unittest.main()
