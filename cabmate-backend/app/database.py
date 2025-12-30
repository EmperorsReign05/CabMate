from pymongo import MongoClient
import os
from dotenv import load_dotenv
import ssl

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI not found in environment variables")

# Windows-specific SSL fix for Python 3.12
try:
    # Create custom SSL context that's more lenient
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    client = MongoClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,
        tlsAllowInvalidHostnames=True,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000
    )
    
    # Test connection
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB")
    
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    # Fallback: try without custom SSL context
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000
    )

db = client["cabmate"]

rides_collection = db["rides"]
ride_requests_collection = db["ride_requests"]
profiles_collection = db["profiles"]

# Create index
try:
    rides_collection.create_index("expires_at", expireAfterSeconds=0)
    print("✅ Indexes created")
except Exception as e:
    print(f"⚠️ Index creation warning: {e}")