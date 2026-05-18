from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import api
from fastapi.staticfiles import StaticFiles
import os

# Create necessary directories
os.makedirs("output", exist_ok=True)

# Initialize database tables
init_db()

app = FastAPI(title="Business Listings API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api")

# Serve the output directory statically for file downloads
app.mount("/downloads", StaticFiles(directory="output"), name="downloads")

@app.get("/")
def root():
    return {"message": "Welcome to Business Listings Dashboard API"}
