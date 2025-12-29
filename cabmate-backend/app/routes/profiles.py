from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta, timezone
from app.database import profiles_collection

router = APIRouter(prefix="/profiles", tags=["Profiles"])
@router.get("/{user_id}")
def get_profile(user_id: str):
    profile = profiles_collection.find_one({"_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile["_id"] = str(profile["_id"])
    return profile

@router.post("/{user_id}")
def upsert_profile(user_id: str, payload: dict):
    profiles_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "full_name": payload.get("full_name"),
                "phone": payload.get("phone"),
                "email": payload.get("email"),
                "gender": payload.get("gender"), # Added gender
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
            },
        },
        upsert=True,
    )
    return {"ok": True}

    
