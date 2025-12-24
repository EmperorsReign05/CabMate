from fastapi import FastAPI
from app.routes import rides

app = FastAPI(title="CabMate Backend")

app.include_router(rides.router)

@app.get("/")
def root():
    return {"status": "CabMate backend running"}
