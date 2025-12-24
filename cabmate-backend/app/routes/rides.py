from fastapi import APIRouter
from app.database import rides_collection
from app.schemas import RideCreate
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/rides", tags=["Rides"])


@router.post("/")
def create_ride(ride: RideCreate):
    ride_doc = {
        "from_location": ride.from_location,
        "to_location": ride.to_location,
        "departure_time": ride.departure_time,
        "seats_available": ride.seats_available,
        "price_per_seat": ride.price_per_seat,
        "created_by": "mock-user-id",  # auth later
        "created_at": datetime.utcnow()
    }

    result = rides_collection.insert_one(ride_doc)
    return {"id": str(result.inserted_id)}


@router.get("/")
def get_rides(from_location: str = None, to_location: str = None):
    query = {}

    if from_location:
        query["from_location"] = from_location
    if to_location:
        query["to_location"] = to_location

    rides = []
    for ride in rides_collection.find(query):
        ride["id"] = str(ride["_id"])
        del ride["_id"]
        rides.append(ride)

    return rides


@router.get("/{ride_id}")
def get_single_ride(ride_id: str):
    ride = rides_collection.find_one({"_id": ObjectId(ride_id)})

    if not ride:
        return {"error": "Ride not found"}

    ride["id"] = str(ride["_id"])
    del ride["_id"]
    return ride
