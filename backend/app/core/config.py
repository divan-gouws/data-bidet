from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Data Bidet API"
    VERSION: str = "1.0.0"
    
    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
    ]
    
    # Database Settings (for future use)
    DATABASE_URL: str = "sqlite:///./spreadsheet.db"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 