import type { RowData, ColumnDefinition } from '../types';

/**
 * Creates an empty row with all column keys initialized to empty strings
 */
export const createEmptyRow = (columns: ColumnDefinition[]): RowData => {
  const emptyRow: RowData = {};
  columns.forEach(col => {
    emptyRow[col.key] = '';
  });
  return emptyRow;
};

/**
 * Validates if a cell value matches the column type
 */
export const validateCellValue = (value: string, columnType: string): boolean => {
  if (!value) return true; // Empty values are always valid
  
  switch (columnType) {
    case 'number':
      return !isNaN(Number(value));
    case 'date': {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
    case 'string':
    default:
      return true;
  }
};

/**
 * Formats a cell value for display based on its type
 */
export const formatCellValue = (value: string, columnType: string): string => {
  if (!value) return '';
  
  switch (columnType) {
    case 'number': {
      const num = Number(value);
      return isNaN(num) ? value : num.toString();
    }
    case 'date': {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString();
    }
    default:
      return value;
  }
};

/**
 * Generates a unique key for a cell
 */
export const generateCellKey = (rowIndex: number, colIndex: number): string => {
  return `${rowIndex}-${colIndex}`;
};

/**
 * Checks if a position is within the spreadsheet bounds
 */
export const isWithinBounds = (
  row: number, 
  col: number, 
  rowCount: number, 
  colCount: number
): boolean => {
  return row >= 0 && row < rowCount && col >= 0 && col < colCount;
}; 