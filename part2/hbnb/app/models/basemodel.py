import uuid
from datetime import datetime

class BaseModel:
    """Base model for all objects in HBnB"""

    def __init__(self):
        self.id = str(uuid.uuid4())
        self.created_at = self._get_current_time()
        self.updated_at = self._get_current_time()

    def _get_current_time(self):
        """Return the current datetime"""
        return datetime.now()

    def save(self):
        """Update the updated_at timestamp"""
        self.updated_at = self._get_current_time()
