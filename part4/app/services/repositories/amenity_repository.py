from app.models.amenity import Amenity
from app.persistence.repository import SQLAlchemyRepository

class AmenityRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Amenity)
    
    def get_amenity_by_name(self, name):
        """Get amenity by name"""
        return self.model.query.filter_by(name=name).first()
    
    def search_amenities(self, search_term):
        """Search amenities by name (case insensitive)"""
        return self.model.query.filter(
            Amenity.name.ilike(f'%{search_term}%')
        ).all()
