from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    auth_router,
    users_router,
    policies_router,
    claims_router,
    documents_router,
    analytics_router
)

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Insurance Policy & Claims Management System API",
    description="Full-stack educational insurance backend providing RBAC, policy management, automated risk scoring, and claim reviews.",
    version="1.0.0"
)

# Enable CORS for React frontend (localhost:5173 / localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(policies_router.router)
app.include_router(claims_router.router)
app.include_router(documents_router.router)
app.include_router(analytics_router.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Insurance Policy & Claims System API is running.",
        "docs_url": "/docs"
    }
