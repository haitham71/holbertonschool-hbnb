#!/usr/bin/python3
"""Amenity model module for the application."""
from sqlalchemy import Column, String
from sqlalchemy.orm import validates
from app.models.basemodel import BaseModel, db

# Association table for many-to-many relationship between Place and Amenity
place_amenity = db.Table('place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey('places.id'), primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey('amenities.id'), primary_key=True)
)

class Amenity(BaseModel):
    """Amenity model for SQLAlchemy"""
    __tablename__ = 'amenities'

    # Columns
    name = Column(String(50), unique=True, nullable=False)

    def __init__(self, **kwargs):
        """Initialize amenity"""
        super().__init__(**kwargs)

    @validates('name')
    def validate_name(self, key, name):
        """Validate name"""
        if not isinstance(name, str):
            raise TypeError("Name must be a string")
        if len(name) > 50:
            raise ValueError("Name must be 50 characters max.")
        if len(name.strip()) == 0:
            raise ValueError("Name cannot be empty")
        return name.strip()

    def update(self, data):
        """Update amenity data with validation"""
        for key, value in data.items():
            if hasattr(self, key) and key not in ['id', 'created_at', 'updated_at']:
                setattr(self, key, value)
        self.update_timestamp()

    def to_dict(self):
        """Convert amenity to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }