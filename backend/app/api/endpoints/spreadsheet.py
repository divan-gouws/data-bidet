from fastapi import APIRouter, HTTPException, status
from typing import List
from ...models.spreadsheet import SpreadsheetData, SpreadsheetResponse, ColumnDefinition
from ...services.spreadsheet_service import spreadsheet_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=SpreadsheetResponse)
async def get_spreadsheet():
    """Get the default spreadsheet data."""
    try:
        spreadsheet_data = spreadsheet_service.get_default_spreadsheet()
        return SpreadsheetResponse(
            success=True,
            message="Spreadsheet data retrieved successfully",
            data=spreadsheet_data
        )
    except Exception as e:
        logger.error(f"Error retrieving spreadsheet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve spreadsheet data"
        )

@router.post("/validate", response_model=SpreadsheetResponse)
async def validate_spreadsheet(spreadsheet: SpreadsheetData):
    """Validate spreadsheet data structure."""
    try:
        is_valid = spreadsheet_service.validate_spreadsheet_data(spreadsheet)
        return SpreadsheetResponse(
            success=is_valid,
            message="Spreadsheet validation completed",
            data=spreadsheet if is_valid else None
        )
    except Exception as e:
        logger.error(f"Error validating spreadsheet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate spreadsheet data"
        )

@router.put("/cell/{row_index}/{column_key}")
async def update_cell(
    row_index: int,
    column_key: str,
    value: str,
    spreadsheet: SpreadsheetData
):
    """Update a specific cell value."""
    try:
        updated_spreadsheet = spreadsheet_service.update_cell_value(
            spreadsheet, row_index, column_key, value
        )
        return SpreadsheetResponse(
            success=True,
            message=f"Cell ({row_index}, {column_key}) updated successfully",
            data=updated_spreadsheet
        )
    except ValueError as e:
        logger.warning(f"Invalid cell update request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating cell: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update cell"
        )

@router.post("/row", response_model=SpreadsheetResponse)
async def add_row(spreadsheet: SpreadsheetData):
    """Add a new row to the spreadsheet."""
    try:
        updated_spreadsheet = spreadsheet_service.add_row(spreadsheet)
        return SpreadsheetResponse(
            success=True,
            message="Row added successfully",
            data=updated_spreadsheet
        )
    except Exception as e:
        logger.error(f"Error adding row: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add row"
        )

@router.post("/column", response_model=SpreadsheetResponse)
async def add_column(
    column: ColumnDefinition,
    spreadsheet: SpreadsheetData
):
    """Add a new column to the spreadsheet."""
    try:
        updated_spreadsheet = spreadsheet_service.add_column(spreadsheet, column)
        return SpreadsheetResponse(
            success=True,
            message="Column added successfully",
            data=updated_spreadsheet
        )
    except ValueError as e:
        logger.warning(f"Invalid column addition request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error adding column: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add column"
        ) 