from fastapi import APIRouter
from datetime import datetime
from app.database import profiles_collection

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.post("/{user_id}")
def upsert_profile(user_id: str, payload: dict):
    """
    Create profile if not exists, otherwise update.
    Safe to call on every login.
    """
    profiles_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "full_name": payload.get("full_name"),
                "phone": payload.get("phone"),
                "email": payload.get("email"),
                "updated_at": datetime.utcnow(),
            },
            "$setOnInsert": {
                "created_at": datetime.utcnow(),
            },
        },
        upsert=True,
    )

    return {"ok": True}
