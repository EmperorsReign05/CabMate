from pydantic import BaseModel
from datetime import datetime
from typing import Optional
class RideCreate(BaseModel):
    from_location: str
    to_location: str
    departure_time: datetime
    seats_available: int
    price_per_seat: int
    remark: Optional[str] = None
    created_by: str

class RideResponse(RideCreate):
    id: str
    created_by: str

class RideJoinRequest(BaseModel):
    user_id: str
