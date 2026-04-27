from app.models.review import Review
from app.persistence.repository import SQLAlchemyRepository

class ReviewRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Review)
    
    def get_reviews_by_place(self, place_id):
        """Get all reviews for a specific place"""
        return self.model.query.filter_by(place_id=place_id).all()
    
    def get_reviews_by_user(self, user_id):
        """Get all reviews by a specific user"""
        return self.model.query.filter_by(user_id=user_id).all()
    
    def get_average_rating_for_place(self, place_id):
        """Calculate average rating for a place"""
        from sqlalchemy import func
        result = self.model.query.filter_by(place_id=place_id).with_entities(
            func.avg(Review.rating).label('average')
        ).first()
        return float(result[0]) if result[0] else 0.0
