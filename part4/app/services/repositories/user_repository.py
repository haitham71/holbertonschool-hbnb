from app.models.user import User
from app.persistence.repository import SQLAlchemyRepository

class UserRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(User)
    
    def get_user_by_email(self, email):
        """Get user by email"""
        return self.model.query.filter_by(email=email).first()
    
    def get_users_by_role(self, is_admin):
        """Get users by admin status"""
        return self.model.query.filter_by(is_admin=is_admin).all()
