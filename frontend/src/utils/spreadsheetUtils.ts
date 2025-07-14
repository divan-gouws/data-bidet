import type { RowData, ColumnDefinition, ValidationError, ValidationResult, ValidationConstraints } from '../types';
import { parse, isValid, format } from 'date-fns';

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
 * Validates if a cell value matches the column type and format
 */
export const validateCellValue = (value: string, column: ColumnDefinition): boolean => {
  if (!value) return true; // Empty values are always valid
  
  switch (column.type) {
    case 'number': {
      // Always validate as decimal number
      const decimalRegex = /^-?\d*\.?\d+$/;
      return decimalRegex.test(value);
    }
    case 'date': {
      const dateFormat = column.validation?.dateFormat || 'yyyy/MM/dd';
      try {
        // Parse the date using the specified format
        const parsedDate = parse(value, dateFormat, new Date());
        return isValid(parsedDate);
      } catch {
        return false;
      }
    }
    case 'string':
    default:
      return true;
  }
};

/**
 * Format a date value according to the specified format
 */
export const formatDateValue = (value: string, dateFormat: string): string => {
  try {
    const parsedDate = parse(value, dateFormat, new Date());
    if (isValid(parsedDate)) {
      return format(parsedDate, dateFormat);
    }
  } catch {
    // If parsing fails, return original value
  }
  return value;
};

/**
 * Validates a single cell value against a column's constraints
 */
export const validateCellConstraints = (
  value: string,
  column: ColumnDefinition,
  rowIndex: number,
  allRows: RowData[],
  columnMapping: { [destColumnKey: string]: string }
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const constraints = column.validation;
  
  if (!constraints) return errors;

  // Helper function to check if a row has any data
  const hasRowData = (row: RowData): boolean => {
    return Object.values(row).some(cellValue => cellValue && cellValue.trim() !== '');
  };

  // Check nullable constraint - only apply to rows that have data
  if (constraints.nullable === false && (!value || value.trim() === '')) {
    const currentRow = allRows[rowIndex];
    if (currentRow && hasRowData(currentRow)) {
      errors.push({
        row: rowIndex,
        columnKey: column.key,
        message: `${column.label} cannot be null or empty`,
        type: 'nullable'
      });
    }
  }

  // If value is empty and nullable is true, skip other validations
  if (!value || value.trim() === '') {
    return errors;
  }

  // Type validation
  if (!validateCellValue(value, column)) {
    let typeErrorMessage = `${column.label} must be of type ${column.type}`;
    let errorType: 'type' | 'decimal' | 'dateFormat' = 'type';
    
    if (column.type === 'number' && column.validation?.decimalOnly) {
      typeErrorMessage = `${column.label} must be a decimal number`;
      errorType = 'decimal';
    } else if (column.type === 'date' && column.validation?.dateFormat) {
      typeErrorMessage = `${column.label} must be in format ${column.validation.dateFormat}`;
      errorType = 'dateFormat';
    }
    
    errors.push({
      row: rowIndex,
      columnKey: column.key,
      message: typeErrorMessage,
      type: errorType
    });
    return errors; // Don't continue with other validations if type is wrong
  }

  // String-specific validations
  if (column.type === 'string') {
    if (constraints.minLength !== undefined && value.length < constraints.minLength) {
      errors.push({
        row: rowIndex,
        columnKey: column.key,
        message: `${column.label} must be at least ${constraints.minLength} characters long`,
        type: 'minLength'
      });
    }

    if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
      errors.push({
        row: rowIndex,
        columnKey: column.key,
        message: `${column.label} must be at most ${constraints.maxLength} characters long`,
        type: 'maxLength'
      });
    }

    if (constraints.pattern) {
      try {
        const regex = new RegExp(constraints.pattern);
        if (!regex.test(value)) {
          errors.push({
            row: rowIndex,
            columnKey: column.key,
            message: `${column.label} does not match the required pattern`,
            type: 'pattern'
          });
        }
      } catch (e) {
        console.warn(`Invalid regex pattern for column ${column.label}:`, constraints.pattern);
      }
    }
  }

  // Number-specific validations
  if (column.type === 'number') {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      if (constraints.min !== undefined && numValue < constraints.min) {
        errors.push({
          row: rowIndex,
          columnKey: column.key,
          message: `${column.label} must be at least ${constraints.min}`,
          type: 'min'
        });
      }

      if (constraints.max !== undefined && numValue > constraints.max) {
        errors.push({
          row: rowIndex,
          columnKey: column.key,
          message: `${column.label} must be at most ${constraints.max}`,
          type: 'max'
        });
      }
    }
  }

  // Unique constraint - check against all rows
  if (constraints.unique) {
    const sourceColumnKey = columnMapping[column.key];
    if (sourceColumnKey) {
      const duplicateRowIndex = allRows.findIndex((row, index) => 
        index !== rowIndex && row[sourceColumnKey] === value
      );
      
      if (duplicateRowIndex !== -1) {
        errors.push({
          row: rowIndex,
          columnKey: column.key,
          message: `${column.label} must be unique. Duplicate found in row ${duplicateRowIndex + 1}`,
          type: 'unique'
        });
      }
    }
  }

  return errors;
};

/**
 * Validates all data against the configured column constraints
 */
export const validateSpreadsheetData = (
  rows: RowData[],
  configColumns: ColumnDefinition[],
  columnMappings: { [destColumnKey: string]: string }
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Only validate columns that have mappings
  const mappedColumns = configColumns.filter(col => columnMappings[col.key]);

  rows.forEach((row, rowIndex) => {
    mappedColumns.forEach(column => {
      const sourceColumnKey = columnMappings[column.key];
      if (sourceColumnKey && row[sourceColumnKey] !== undefined) {
        const cellErrors = validateCellConstraints(
          row[sourceColumnKey],
          column,
          rowIndex,
          rows,
          columnMappings
        );
        errors.push(...cellErrors);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
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