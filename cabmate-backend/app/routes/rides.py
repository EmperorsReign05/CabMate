from fastapi import APIRouter, HTTPException
from app.database import rides_collection, ride_requests_collection, profiles_collection
from app.schemas import RideCreate, RideJoinRequest
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.encoders import jsonable_encoder
router = APIRouter(tags=["Rides"])

def serialize_mongo_doc(doc):
    doc["_id"] = str(doc["_id"])
    if "departure_time" in doc:
        doc["departure_time"] = doc["departure_time"].isoformat()
    if "expires_at" in doc:
        doc["expires_at"] = doc["expires_at"].isoformat()
    if "created_at" in doc:
        doc["created_at"] = doc["created_at"].isoformat()
    return doc

def get_profile(user_id: str):
    return profiles_collection.find_one(
        {"_id": user_id},
        {"_id": 0, "full_name": 1, "phone": 1}
    )


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
        ride["_id"] = str(ride["_id"])
        ride["creator"] = get_profile(ride["created_by"])
        ride.pop("created_by", None)
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
    cursor = rides_collection.find({"created_by": user_id})
    rides = []

    for ride in cursor:
        rides.append(serialize_mongo_doc(ride))

    return rides

@router.get("/{ride_id}")
def get_single_ride(ride_id: str):
    ride = rides_collection.find_one({"_id": ObjectId(ride_id)})

    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    ride["_id"] = str(ride["_id"])
    return ride


@router.post("/{ride_id}/request")
def request_to_join(ride_id: str, body: dict):
    user_id = body.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")

    try:
        ride_obj_id = ObjectId(ride_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ride ID")

    ride = rides_collection.find_one({"_id": ride_obj_id})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride.get("created_by") == user_id:
        raise HTTPException(status_code=400, detail="Creator cannot request")

    existing = ride_requests_collection.find_one({
        "ride_id": ride_id,
        "requester_id": user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already requested")

    ride_requests_collection.insert_one({
        "ride_id": ride_id,
        "requester_id": user_id,
        "status": "pending",
        "requested_at": datetime.now(timezone.utc)
    })

    return {"message": "Request sent"}



@router.get("/{ride_id}/requests")
def get_ride_requests(ride_id: str):
    try:
        requests = list(
            ride_requests_collection.find(
                {
                    "ride_id": ride_id,
                    "status": "pending"
                },
                {"_id": 1, "requester_id": 1, "status": 1, "requested_at": 1}
            )
        )

        for r in requests:
            r["requester"] = get_profile(r["requester_id"])
            r.pop("requester_id", None)
        return requests

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/{ride_id}/requests/{requester_id}/approve")
def approve_request(ride_id: str, requester_id: str):
    ride = rides_collection.find_one({"_id": ObjectId(ride_id)})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    if ride["seats_available"] <= 0:
        raise HTTPException(status_code=400, detail="No seats available")

    result = ride_requests_collection.update_one(
        {
            "ride_id": ride_id,
            "requester_id": requester_id,
            "status": "pending"
        },
        {"$set": {"status": "approved"}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")

    rides_collection.update_one(
        {"_id": ObjectId(ride_id)},
        {"$inc": {"seats_available": -1}}
    )

    return {"message": "Request approved"}

@router.post("/{ride_id}/requests/{requester_id}/reject")
def reject_request(ride_id: str, requester_id: str):
    result = ride_requests_collection.update_one(
        {
            "ride_id": ride_id,
            "requester_id": requester_id,
            "status": "pending"
        },
        {"$set": {"status": "rejected"}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")

    return {"message": "Request rejected"}

@router.post("/profiles/init")
def init_profile(profile: dict):
    """
    TEMP endpoint: create profile if it doesn't exist
    """
    user_id = profile.get("user_id")
    full_name = profile.get("full_name")
    phone = profile.get("phone")

    if not user_id or not full_name or not phone:
        raise HTTPException(status_code=400, detail="Missing fields")

    existing = profiles_collection.find_one({"_id": user_id})
    if existing:
        return {"message": "Profile already exists"}

    profiles_collection.insert_one({
        "_id": user_id,          # IMPORTANT: string, not ObjectId
        "full_name": full_name,
        "phone": phone,
        "created_at": datetime.utcnow()
    })

    return {"message": "Profile created"}