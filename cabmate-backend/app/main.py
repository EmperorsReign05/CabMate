from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.routes import rides, profiles
from app.database import profiles_collection, rides_collection
from datetime import datetime, timezone
import yaml
import os

app = FastAPI(
    title="CabMate API",
    description="🚕 Smart Campus Mobility API – Find & share rides with verified peers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Load custom OpenAPI spec from YAML
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "openapi.yaml")
    
    if os.path.exists(openapi_path):
        with open(openapi_path, "r", encoding="utf-8") as f:
            app.openapi_schema = yaml.safe_load(f)
        return app.openapi_schema
    
    # Fallback to auto-generated spec if YAML not found
    return get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

app.openapi = custom_openapi

# ✅ CORS MUST come before include_router
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"
       # '''"http://localhost:5173",
       # "http://127.0.0.1:5173",
       # "https://localhost:3000",
       # "https://cabmate.pages.dev"'''
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rides.router)
app.include_router(profiles.router) 

DEMO_USER_ID = "demo-swagger-test-user"

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "active"}

@app.get("/demo/credentials", tags=["🧪 Try It Out"])
def get_demo_credentials():
    """
    Returns working test credentials so you can try out all the API endpoints.
    
    This endpoint:
    1. Ensures a demo user profile exists in the database
    2. Returns the demo `user_id` you can copy-paste into other endpoints
    3. Returns sample `ride_id`s from the database (if any rides exist)
    
    **Use these values in the "Try it out" buttons on other endpoints!**
    """
    # Ensure demo profile exists
    profiles_collection.update_one(
        {"_id": DEMO_USER_ID},
        {
            "$set": {
                "full_name": "Demo User (Swagger)",
                "phone": "+91 0000000000",
                "email": "demo@cabmate.swagger",
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
            },
        },
        upsert=True,
    )

    # Fetch a few sample ride IDs for the user to test with
    sample_rides = []
    for ride in rides_collection.find().sort("created_at", -1).limit(3):
        sample_rides.append({
            "ride_id": str(ride["_id"]),
            "from": ride.get("from_location", ""),
            "to": ride.get("to_location", ""),
        })

    return {
        "message": "✅ Copy these values and paste them into the 'Try it out' fields on other endpoints!",
        "demo_user_id": DEMO_USER_ID,
        "sample_rides": sample_rides,
        "tips": {
            "create_ride": f"Use '{DEMO_USER_ID}' as the created_by field",
            "view_profile": f"Try GET /profiles/{DEMO_USER_ID}",
            "view_dashboard": f"Try GET /rides/user/{DEMO_USER_ID}",
            "get_single_ride": "Use any ride_id from sample_rides above",
            "search_rides": "Try GET /rides/search without any filters to see all upcoming rides",
        }
    }