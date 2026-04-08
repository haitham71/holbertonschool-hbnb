#!/usr/bin/python3
"""Place model module for the application."""
from sqlalchemy import Column, String, Float, ForeignKey, Text
from sqlalchemy.orm import validates, relationship
from app.models.basemodel import BaseModel, db


class Place(BaseModel):
    """Place model for SQLAlchemy"""
    __tablename__ = 'places'

    # Columns
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)

    # Foreign Keys
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    owner = relationship('User', back_populates='places', lazy=True)

    # Relationships
    amenities = relationship('Amenity', secondary='place_amenity', lazy='subquery',
                             backref=db.backref('places', lazy=True))
    reviews = relationship('Review', back_populates='place', lazy=True, cascade='all, delete-orphan')

    def __init__(self, **kwargs):
        """Initialize place"""
        super().__init__(**kwargs)

    # ----------------------
    # Validators
    # ----------------------
    @validates('title')
    def validate_title(self, key, title):
        """Validate title"""
        if not isinstance(title, str):
            raise TypeError("Title must be a string")
        if len(title) > 100:
            raise ValueError("Title must be 100 characters max.")
        if len(title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        return title.strip()

    @validates('price')
    def validate_price(self, key, price):
        """Validate price"""
        if not isinstance(price, (int, float)):
            raise TypeError("Price must be a number")
        if price <= 0:
            raise ValueError("Price must be greater than 0")
        return float(price)

    @validates('latitude')
    def validate_latitude(self, key, lat):
        """Validate latitude"""
        if not isinstance(lat, (int, float)):
            raise TypeError("Latitude must be a number")
        if lat < -90 or lat > 90:
            raise ValueError("Latitude must be between -90 and 90")
        return float(lat)

    @validates('longitude')
    def validate_longitude(self, key, lon):
        """Validate longitude"""
        if not isinstance(lon, (int, float)):
            raise TypeError("Longitude must be a number")
        if lon < -180 or lon > 180:
            raise ValueError("Longitude must be between -180 and 180")
        return float(lon)

    # ----------------------
    # Amenity methods
    # ----------------------
    def add_amenity(self, amenity):
        """Add an amenity to the place"""
        if amenity not in self.amenities:
            self.amenities.append(amenity)

    def remove_amenity(self, amenity):
        """Remove an amenity from the place"""
        if amenity in self.amenities:
            self.amenities.remove(amenity)

    def update(self, data):
        """Update place data with validation"""
        for key, value in data.items():
            if hasattr(self, key) and key not in ['id', 'created_at', 'updated_at', 'owner_id']:
                setattr(self, key, value)
        self.update_timestamp()

    def to_dict(self):
        """Convert place to dictionary"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "owner_id": self.owner_id,
            "image_url": self.image_url,
            "amenities": [a.to_dict() for a in self.amenities],
            "reviews": [r.to_dict() for r in self.reviews],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }