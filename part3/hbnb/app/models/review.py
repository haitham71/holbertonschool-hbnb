#!/usr/bin/python3
"""Review model module for the application."""
from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import validates, relationship
from app.models.basemodel import BaseModel, db


class Review(BaseModel):
    """Review model for SQLAlchemy"""
    __tablename__ = 'reviews'

    # Columns
    text = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)

    # Foreign Keys
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    place_id = Column(String(36), ForeignKey('places.id'), nullable=False)

    # Relationships
    user = relationship('User', back_populates='reviews', lazy=True)
    place = relationship('Place', back_populates='reviews', lazy=True)

    def __init__(self, **kwargs):
        """Initialize review"""
        super().__init__(**kwargs)

    # ----------------------
    # Validators
    # ----------------------
    @validates('text')
    def validate_text(self, key, text):
        """Validate text"""
        if not isinstance(text, str):
            raise TypeError("Text must be a string")
        if len(text.strip()) == 0:
            raise ValueError("Text cannot be empty")
        return text.strip()

    @validates('rating')
    def validate_rating(self, key, rating):
        """Validate rating"""
        if not isinstance(rating, int):
            raise TypeError("Rating must be an integer")
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        return rating

    def update(self, data):
        """Update review data with validation"""
        for key, value in data.items():
            if hasattr(self, key) and key not in ['id', 'created_at', 'updated_at', 'user_id', 'place_id']:
                setattr(self, key, value)
        self.update_timestamp()

    def to_dict(self):
        """Convert review to dictionary"""
        return {
            "id": self.id,
            "text": self.text,
            "rating": self.rating,
            "user_id": self.user_id,
            "user_first_name": self.user.first_name if self.user else None,
            "user_last_name": self.user.last_name if self.user else None,
            "place_id": self.place_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }