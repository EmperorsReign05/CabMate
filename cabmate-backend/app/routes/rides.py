from fastapi import APIRouter, HTTPException
from app.database import rides_collection, ride_requests_collection, profiles_collection
from app.schemas import RideCreate, RideJoinRequest
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.encoders import jsonable_encoder
import re

# ✅ FIX: Added prefix="/rides" so routes match the frontend calls
router = APIRouter(prefix="/rides", tags=["Rides"])

def serialize_mongo_doc(doc):
    doc["_id"] = str(doc["_id"])
    if "departure_time" in doc:
        doc["departure_time"] = doc["departure_time"].isoformat()
    if "expires_at" in doc:
        doc["expires_at"] = doc["expires_at"].isoformat()
    if "created_at" in doc:
        doc["created_at"] = doc["created_at"].isoformat()
    return doc

def serialize_ride_request(r):
    return {
        "_id": str(r["_id"]),
        "ride_id": r["ride_id"],
        "requester_id": r["requester_id"],
        "status": r["status"],
        "requested_at": r.get("requested_at"),
        "requester": r.get("requester")
    }

def get_profile(user_id: str):
    return profiles_collection.find_one(
        {"_id": user_id},
        {"_id": 0, "full_name": 1, "phone": 1}
    )

@router.post("/")
def create_ride(ride: RideCreate):
    try:
        departure_time = ride.departure_time
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
    # Sort by departure time to show nearest rides first
    for ride in rides_collection.find(query).sort("departure_time", 1):
        ride["_id"] = str(ride["_id"])
        ride["creator"] = get_profile(ride["created_by"])
        ride.pop("created_by", None)
        rides.append(serialize_mongo_doc(ride))
    return rides

@router.get("/search")
def search_rides(from_location: str, to_location: str):
    now = datetime.now(timezone.utc)
    safe_from = re.escape(from_location)
    safe_to = re.escape(to_location)
    cursor = rides_collection.find({
        "from_location": {"$regex": safe_from, "$options": "i"},
        "to_location": {"$regex": safe_to, "$options": "i"},
        "departure_time": {"$gt": now}
    })
    rides = []
    for ride in cursor:
        rides.append(serialize_mongo_doc(ride))
    return rides

@router.get("/my-created")
def get_my_created_rides(user_id: str):
    cursor = rides_collection.find({"created_by": user_id})
    rides = []
    for ride in cursor:
        rides.append(serialize_mongo_doc(ride))
    return rides

# ✅ FIX: Moved this specific route BEFORE the generic /{ride_id} to avoid conflicts
@router.get("/user/{user_id}")
def get_user_dashboard_rides(user_id: str):
    """
    Fetches all rides created by the user AND rides they have joined (approved).
    """
    # 1. Created Rides
    created_rides = []
    cursor_created = rides_collection.find({"created_by": user_id})
    for ride in cursor_created:
        ride["_id"] = str(ride["_id"])
        ride["creator"] = get_profile(ride.get("created_by")) # Consistency with get_rides
        created_rides.append(serialize_mongo_doc(ride))

    # 2. Joined Rides (Fetch approved requests first)
    requests = ride_requests_collection.find({"requester_id": user_id, "status": "approved"})
    joined_ride_ids = [ObjectId(req["ride_id"]) for req in requests]
    
    joined_rides = []
    if joined_ride_ids:
        cursor_joined = rides_collection.find({"_id": {"$in": joined_ride_ids}})
        for ride in cursor_joined:
            ride["_id"] = str(ride["_id"])
            ride["creator"] = get_profile(ride.get("created_by"))
            joined_rides.append(serialize_mongo_doc(ride))

    return jsonable_encoder({"created": created_rides, "joined": joined_rides})

@router.get("/stats/total")
def get_total_rides_count():
    count = rides_collection.count_documents({})
    return {"count": count}

# Generic ID route should be last
@router.get("/{ride_id}")
def get_single_ride(ride_id: str):
    try:
        obj_id = ObjectId(ride_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    ride = rides_collection.find_one({"_id": obj_id})
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
    requests = list(ride_requests_collection.find({"ride_id": ride_id}))
    for r in requests:
        profile = profiles_collection.find_one(
            {"_id": r["requester_id"]},
            {"_id": 0, "full_name": 1, "phone": 1}
        )
        r["requester"] = profile
        
    return [serialize_ride_request(r) for r in requests]

@router.post("/{ride_id}/requests/{requester_id}/approve")
def approve_request(ride_id: str, requester_id: str):
    try:
        obj_ride_id = ObjectId(ride_id)
    except:
         raise HTTPException(status_code=400, detail="Invalid Ride ID")

    ride = rides_collection.find_one({"_id": obj_ride_id})
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
        {"_id": obj_ride_id},
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

# Add this to app/routes/rides.py

@router.delete("/{ride_id}")
def delete_ride(ride_id: str, user_id: str):
    try:
        obj_id = ObjectId(ride_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Ride ID")

    # 1. Find the ride
    ride = rides_collection.find_one({"_id": obj_id})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    # 2. Check ownership (Security)
    if ride.get("created_by") != user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own rides")

    # 3. Delete the ride
    delete_result = rides_collection.delete_one({"_id": obj_id})
    
    # 4. Optional: Delete associated requests to keep DB clean
    ride_requests_collection.delete_many({"ride_id": ride_id})

    if delete_result.deleted_count == 1:
        return {"message": "Ride deleted successfully"}
    
    raise HTTPException(status_code=500, detail="Failed to delete ride")

@router.post("/profiles/init")
def init_profile(profile: dict):
    # Temp endpoint kept for compatibility, but logical work is done in profiles.py
    return {"message": "Use profiles.py endpoint instead"}