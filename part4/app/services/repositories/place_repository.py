from app.models.place import Place
from app.persistence.repository import SQLAlchemyRepository

class PlaceRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Place)
    
    def get_places_by_owner(self, owner_id):
        """Get all places owned by a specific user"""
        return self.model.query.filter_by(owner_id=owner_id).all()
    
    def get_places_by_price_range(self, min_price, max_price):
        """Get places within a price range"""
        return self.model.query.filter(
            Place.price >= min_price, 
            Place.price <= max_price
        ).all()
    
    def get_places_by_amenity(self, amenity_id):
        """Get all places that have a specific amenity"""
        return self.model.query.filter(Place.amenities.any(id=amenity_id)).all()
