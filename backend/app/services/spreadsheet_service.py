from typing import List, Dict, Optional
from ..models.spreadsheet import ColumnDefinition, RowData, SpreadsheetData, SpreadsheetResponse
import logging

logger = logging.getLogger(__name__)

class SpreadsheetService:
    """Service class for handling spreadsheet operations."""
    
    def __init__(self):
        self._default_columns = [
            ColumnDefinition(key="name", label="Name", type="string"),
            ColumnDefinition(key="age", label="Age", type="number"),
            ColumnDefinition(key="birthdate", label="Birthdate", type="date"),
        ]
    
    def get_default_spreadsheet(self) -> SpreadsheetData:
        """Get a default spreadsheet with initial data."""
        try:
            # Create default rows
            default_rows = [
                RowData(data={"name": "", "age": "", "birthdate": ""}),
                RowData(data={"name": "", "age": "", "birthdate": ""}),
                RowData(data={"name": "", "age": "", "birthdate": ""}),
                RowData(data={"name": "", "age": "", "birthdate": ""}),
                RowData(data={"name": "", "age": "", "birthdate": ""}),
            ]
            
            return SpreadsheetData(
                columns=self._default_columns,
                rows=default_rows,
                metadata={"created": "default"}
            )
        except Exception as e:
            logger.error(f"Error creating default spreadsheet: {e}")
            raise
    
    def validate_spreadsheet_data(self, data: SpreadsheetData) -> bool:
        """Validate spreadsheet data structure."""
        try:
            # Check if all rows have data for all columns
            column_keys = {col.key for col in data.columns}
            
            for row in data.rows:
                if not all(key in row.data for key in column_keys):
                    return False
            
            return True
        except Exception as e:
            logger.error(f"Error validating spreadsheet data: {e}")
            return False
    
    def update_cell_value(
        self, 
        spreadsheet: SpreadsheetData, 
        row_index: int, 
        column_key: str, 
        value: str
    ) -> SpreadsheetData:
        """Update a specific cell value in the spreadsheet."""
        try:
            if row_index < 0 or row_index >= len(spreadsheet.rows):
                raise ValueError(f"Invalid row index: {row_index}")
            
            if not any(col.key == column_key for col in spreadsheet.columns):
                raise ValueError(f"Invalid column key: {column_key}")
            
            # Create a copy of the spreadsheet
            updated_spreadsheet = SpreadsheetData(
                columns=spreadsheet.columns,
                rows=spreadsheet.rows.copy(),
                metadata=spreadsheet.metadata
            )
            
            # Update the specific cell
            updated_spreadsheet.rows[row_index].data[column_key] = value
            
            return updated_spreadsheet
        except Exception as e:
            logger.error(f"Error updating cell value: {e}")
            raise
    
    def add_row(self, spreadsheet: SpreadsheetData) -> SpreadsheetData:
        """Add a new empty row to the spreadsheet."""
        try:
            # Create empty row data
            empty_row_data = {col.key: "" for col in spreadsheet.columns}
            new_row = RowData(data=empty_row_data)
            
            # Create updated spreadsheet
            updated_spreadsheet = SpreadsheetData(
                columns=spreadsheet.columns,
                rows=spreadsheet.rows + [new_row],
                metadata=spreadsheet.metadata
            )
            
            return updated_spreadsheet
        except Exception as e:
            logger.error(f"Error adding row: {e}")
            raise
    
    def add_column(
        self, 
        spreadsheet: SpreadsheetData, 
        column: ColumnDefinition
    ) -> SpreadsheetData:
        """Add a new column to the spreadsheet."""
        try:
            # Check if column key already exists
            if any(col.key == column.key for col in spreadsheet.columns):
                raise ValueError(f"Column key already exists: {column.key}")
            
            # Create updated spreadsheet
            updated_spreadsheet = SpreadsheetData(
                columns=spreadsheet.columns + [column],
                rows=spreadsheet.rows.copy(),
                metadata=spreadsheet.metadata
            )
            
            # Add empty values for the new column in all rows
            for row in updated_spreadsheet.rows:
                row.data[column.key] = ""
            
            return updated_spreadsheet
        except Exception as e:
            logger.error(f"Error adding column: {e}")
            raise

# Global service instance
spreadsheet_service = SpreadsheetService() 