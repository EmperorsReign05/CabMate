from fastapi import APIRouter, HTTPException
from app.database import rides_collection
from app.schemas import RideCreate
from datetime import datetime, timedelta, timezone
from bson import ObjectId

router = APIRouter(tags=["Rides"])


@router.post("/")
def create_ride(ride: RideCreate):
    try:
        departure_time = ride.departure_time

        # ✅ Ensure timezone-aware UTC
        if departure_time.tzinfo is None:
            departure_time = departure_time.replace(tzinfo=timezone.utc)

        expires_at = departure_time + timedelta(hours=2)

        ride_doc = {
            "from_location": ride.from_location,
            "to_location": ride.to_location,
            "departure_time": departure_time,
            "expires_at": expires_at,
            "seats_available": ride.seats_available,
            "price_per_seat": ride.price_per_seat,
            "created_by": ride.created_by,
            "created_at": datetime.now(timezone.utc)
        }

        result = rides_collection.insert_one(ride_doc)
        return {"id": str(result.inserted_id)}

    except Exception as e:
        print("🔥 CREATE RIDE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


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




@router.get("/search")
def search_rides(from_location: str, to_location: str):
    now = datetime.now(timezone.utc)

    cursor = rides_collection.find({
        "from_location": {"$regex": from_location, "$options": "i"},
        "to_location": {"$regex": to_location, "$options": "i"},
        "departure_time": {"$gt": now}
    })

    rides = []
    for ride in cursor:
        ride["_id"] = str(ride["_id"])
        rides.append(ride)

    return rides

@router.get("/my-created")
def get_my_created_rides(user_id: str):
    rides = list(
        rides_collection.find(
            {"created_by": user_id},
            {"expires_at": 0}  # optional: hide expiry from frontend
        )
    )

    for ride in rides:
        ride["_id"] = str(ride["_id"])

    return rides

@router.get("/{ride_id}")
def get_single_ride(ride_id: str):
    ride = rides_collection.find_one({"_id": ObjectId(ride_id)})

    if not ride:
         raise HTTPException(status_code=404, detail="Ride not found")

    ride["id"] = str(ride["_id"])
    del ride["_id"]
    return ride