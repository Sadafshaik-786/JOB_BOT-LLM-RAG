from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import jobs, chat
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(title="JobBot RAG API")

# ✅ Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])

@app.get("/")
def home():
    return {"message": "Welcome to JobBot RAG API 🚀"}

# Just to test env is loaded
@app.get("/env-test")
def env_test():
    return {"api_key": os.getenv("RAPIDAPI_KEY")}
