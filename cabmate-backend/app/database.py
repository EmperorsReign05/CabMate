from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI not found in environment variables")

# Create Mongo client
client = MongoClient(MONGO_URI)

# Select database
db = client["cabmate"]

# Select collection
rides_collection = db["rides"]

# ✅ Create TTL index safely (important)
try:
    rides_collection.create_index(
        "expires_at",
        expireAfterSeconds=0
    )
except Exception as e:
    # This will happen on reload if index already exists
    print("TTL index already exists or failed to create:", e)
