#!/usr/bin/python3
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship, validates
from app.models.basemodel import BaseModel, db


class PlaceImage(BaseModel):
    __tablename__ = 'place_images'

    place_id = Column(String(36), ForeignKey('places.id'), nullable=False)
    image_url = Column(String(500), nullable=False)

    place = relationship('Place', back_populates='images', lazy=True)

    @validates('image_url')
    def validate_image_url(self, key, value):
        if not isinstance(value, str):
            raise TypeError("image_url must be a string")
        if not value.strip():
            raise ValueError("image_url cannot be empty")
        if len(value) > 500:
            raise ValueError("image_url must be 500 characters max")
        return value.strip()

    def to_dict(self):
        return {
            "id": self.id,
            "place_id": self.place_id,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }