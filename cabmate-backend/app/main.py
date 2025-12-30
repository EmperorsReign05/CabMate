from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import rides, profiles

app = FastAPI(title="CabMate Backend")

# ✅ CORS MUST come before include_router
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://localhost:3000",
        "https://cabmate.pages.dev"
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
