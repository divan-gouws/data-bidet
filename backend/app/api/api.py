from fastapi import APIRouter
from .endpoints import spreadsheet
from ..core.config import settings

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    spreadsheet.router,
    prefix="/spreadsheet",
    tags=["spreadsheet"]
) 