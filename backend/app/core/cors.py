from fastapi.middleware.cors import CORSMiddleware
from .config import settings

def setup_cors(app):
    """Setup CORS middleware for the FastAPI application."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    ) 