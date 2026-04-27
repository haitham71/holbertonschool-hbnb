#!/usr/bin/python3
"""User model module for the application."""
import re
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import validates, relationship
from flask_bcrypt import generate_password_hash, check_password_hash
from app.models.basemodel import BaseModel, db


class User(BaseModel):
    __tablename__ = 'users'

    email = Column(String(120), nullable=False, unique=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    password = Column(String(128), nullable=False)
    is_admin = Column(Boolean, default=False)

    places = relationship('Place', back_populates='owner', lazy=True, cascade='all, delete-orphan')
    reviews = relationship('Review', back_populates='user', lazy=True, cascade='all, delete-orphan')

    def __init__(self, **kwargs):
        if 'password' in kwargs:
            kwargs['password'] = self.hash_password(kwargs['password'])
        super().__init__(**kwargs)

    @validates('email')
    def validate_email(self, key, email):
        pattern = r"[^@]+@[^@]+\.[^@]+"
        if not re.match(pattern, email):
            raise ValueError(f"Invalid email format: {email}")
        return email

    @validates('first_name', 'last_name')
    def validate_name(self, key, name):
        if not name or not name.strip():
            raise ValueError(f"{key.replace('_', ' ').capitalize()} cannot be empty")
        if len(name) > 50:
            raise ValueError(f"{key.replace('_', ' ').capitalize()} must not exceed 50 characters")
        return name

    def hash_password(self, password):
        return generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        return check_password_hash(self.password, password)

    def update(self, data):
        """Update user data with validation"""
        for key, value in data.items():
            if hasattr(self, key) and key not in ['id', 'created_at', 'updated_at']:
                if key == 'password':
                    setattr(self, key, self.hash_password(value))
                else:
                    setattr(self, key, value)
        self.update_timestamp()

    def to_dict(self):
        """Convert user to dictionary (without password)"""
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }