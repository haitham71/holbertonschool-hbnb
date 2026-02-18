import uuid
from datetime import datetime


class BaseModel:
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def update_timestamp(self):
        self.updated_at = datetime.utcnow()

    def to_dict_base(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    def is_max_length(self, field_name: str, value, max_length: int):
        '''
                checker for maximum lenght


                :param field_name: passed name from client
                :param value: passed lenght from client
                :param max_length: maximum length required
                '''
        if len(value) > max_length:
            raise ValueError(
                f"{field_name} cannot exceed {max_length} characters")
