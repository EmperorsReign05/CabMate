from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import rides

app = FastAPI(title="CabMate Backend")

# ✅ CORS MUST come before include_router
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://cabmate.pages.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rides.router, prefix="/rides", tags=["Rides"])

@app.get("/")
def root():
    return {"status": "ok"}
