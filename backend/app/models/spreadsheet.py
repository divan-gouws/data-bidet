from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Literal
from datetime import datetime

class ColumnDefinition(BaseModel):
    """Model for spreadsheet column definition."""
    key: str = Field(..., description="Unique identifier for the column")
    label: str = Field(..., description="Display name for the column")
    type: Literal["string", "number", "date"] = Field(..., description="Data type of the column")

class RowData(BaseModel):
    """Model for spreadsheet row data."""
    data: Dict[str, str] = Field(default_factory=dict, description="Cell data for the row")

class SpreadsheetData(BaseModel):
    """Model for complete spreadsheet data."""
    columns: List[ColumnDefinition] = Field(..., description="Column definitions")
    rows: List[RowData] = Field(..., description="Row data")
    metadata: Optional[Dict[str, str]] = Field(default_factory=dict, description="Additional metadata")

class SpreadsheetResponse(BaseModel):
    """Response model for spreadsheet operations."""
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[SpreadsheetData] = Field(None, description="Spreadsheet data if applicable") 