from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta, timezone
from app.database import profiles_collection
import traceback

router = APIRouter(prefix="/profiles", tags=["Profiles"])
@router.get("/{user_id}")
def get_profile(user_id: str):
    try:
        # Debug print to see if request reaches here
        print(f"Fetching profile for: {user_id}")
        
        profile = profiles_collection.find_one({"_id": user_id})
        
        if not profile:
            # Return 404 cleanly so the frontend handles it (New User flow)
            raise HTTPException(status_code=404, detail="Profile not found")

        # Convert date objects to strings if needed
        profile["_id"] = str(profile["_id"])
        return profile

    except HTTPException:
        raise
    except Exception as e:
        # This catches actual crashes and prints to terminal
        print("CRITICAL ERROR IN GET_PROFILE:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{user_id}")
def upsert_profile(user_id: str, payload: dict):
    profiles_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "full_name": payload.get("full_name"),
                "phone": payload.get("phone"),
                "email": payload.get("email"),
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
            },
        },
        upsert=True,
    )
    return {"ok": True}

    
