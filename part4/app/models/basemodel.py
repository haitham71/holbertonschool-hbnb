import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# Create db instance
db = SQLAlchemy()

class BaseModel(db.Model):
    """Base model for all SQLAlchemy models"""
    __abstract__ = True

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def update_timestamp(self):
        """Update the updated_at timestamp"""
        self.updated_at = datetime.utcnow()

    def to_dict_base(self):
        """Convert base attributes to dictionary"""
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def is_max_length(field_name: str, value: str, max_length: int):
        """Check if a string exceeds maximum length"""
        if len(value) > max_length:
            raise ValueError(f"{field_name} cannot exceed {max_length} characters")