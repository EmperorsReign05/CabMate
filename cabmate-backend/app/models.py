from datetime import datetime
from bson import ObjectId

class Ride:
    def __init__(
        self,
        from_location: str,
        to_location: str,
        departure_time: datetime,
        seats_available: int,
        price_per_seat: int,
        created_by: str,
        remark: str = None
    ):
        self.from_location = from_location
        self.to_location = to_location
        self.departure_time = departure_time
        self.seats_available = seats_available
        self.price_per_seat = price_per_seat
        self.created_by = created_by
        self.remark = remark
        self.created_at = datetime.utcnow()
