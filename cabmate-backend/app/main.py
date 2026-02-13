from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.routes import rides, profiles
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

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "active"}