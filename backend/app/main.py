from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
import os

from app.config import settings
from app.database import engine, Base, get_db
from app.models import User
from app.auth import get_password_hash
from app.websockets import manager

# Routers
from app.routers import auth, jobs, resumes, audit, analytics

# Initialize SQLite/PostgreSQL Database tables
Base.metadata.create_all(bind=engine)

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade AI Resume Screening & Applicant Tracking System",
    version="1.0.0"
)

# Set rate limiter state and handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to seed default profiles forCapstones presentation
def seed_default_users():
    db = next(get_db())
    try:
        # Check if default admin exists
        admin = db.query(User).filter(User.email == "admin@nextgenats.com").first()
        if not admin:
            print("Seeding default application profiles (Admin, Recruiter, Candidate)...")
            # Create Admin
            db.add(User(
                email="admin@nextgenats.com",
                hashed_password=get_password_hash("admin123"),
                role="Admin",
                full_name="System Administrator"
            ))
            # Create Recruiter
            db.add(User(
                email="recruiter@nextgenats.com",
                hashed_password=get_password_hash("recruiter123"),
                role="Recruiter",
                full_name="HR Executive Manager"
            ))
            # Create Candidate
            db.add(User(
                email="candidate@nextgenats.com",
                hashed_password=get_password_hash("candidate123"),
                role="Candidate",
                full_name="John Doe (Software Architect)"
            ))
            db.commit()
            print("Seeding complete.")
    except Exception as e:
        print(f"Error seeding DB: {e}")
    finally:
        db.close()

seed_default_users()

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

# Real-time WebSocket Gateway
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive, listen for ping/messages if any
            data = await websocket.receive_text()
            # Echo or process if needed
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)

# Mount frontend static files
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check both relative path for local dev and absolute path for Docker container
dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist")),
    "/app/frontend/dist"
]
frontend_dist_path = None
for p in dist_paths:
    if os.path.exists(p):
        frontend_dist_path = p
        break

if frontend_dist_path:
    print(f"Mounting frontend assets from: {frontend_dist_path}")
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="static")

    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        if catchall.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        index_path = os.path.join(frontend_dist_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"message": "Frontend build files missing."}
else:
    @app.get("/")
    def read_root():
        return {
            "status": "online",
            "service": settings.PROJECT_NAME,
            "docs_url": "/docs",
            "version": "1.0.0"
        }
