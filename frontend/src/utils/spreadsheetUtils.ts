import type { RowData, ColumnDefinition, ValidationError, ValidationResult } from '../types';
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
 * Validates a single cell value against a column's type and constraints
 * This is the SINGLE SOURCE OF TRUTH for all validation logic
 */
export const validateCellConstraints = (
  value: string,
  column: ColumnDefinition,
  rowIndex: number,
  allRows: RowData[],
  columnMapping: { [destColumnKey: string]: string }
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const constraints = column.validation || {};

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
        columnKey: column.key,  // Using destination column key
        message: `${column.label} cannot be null or empty`,
        type: 'nullable'
      });
    }
  }

  // If value is empty, skip other validations (unless nullable constraint failed)
  if (!value || value.trim() === '') {
    return errors;
  }

  // ===== DATA TYPE VALIDATION =====
  
  // Number type validation
  if (column.type === 'number') {
    const decimalRegex = /^-?\d*\.?\d+$/;
    if (!decimalRegex.test(value)) {
      errors.push({
        row: rowIndex,
        columnKey: column.key,  // Using destination column key
        message: `${column.label} must be a valid number`,
        type: 'type'
      });
      return errors; // Don't continue with other validations if type is wrong
    }
    
    // Number-specific constraint validations
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      if (constraints.min !== undefined && numValue < constraints.min) {
        errors.push({
          row: rowIndex,
          columnKey: column.key,  // Using destination column key
          message: `${column.label} must be at least ${constraints.min}`,
          type: 'min'
        });
      }

      if (constraints.max !== undefined && numValue > constraints.max) {
        errors.push({
          row: rowIndex,
          columnKey: column.key,  // Using destination column key
          message: `${column.label} must be at most ${constraints.max}`,
          type: 'max'
        });
      }
    }
  }
  
  // Date type validation
  else if (column.type === 'date') {
    const dateFormat = constraints.dateFormat || 'yyyy/MM/dd';
    try {
      const parsedDate = parse(value, dateFormat, new Date());
      if (!isValid(parsedDate)) {
        errors.push({
          row: rowIndex,
          columnKey: column.key,  // Using destination column key
          message: `${column.label} must be in format ${dateFormat}`,
          type: 'dateFormat'
        });
        return errors; // Don't continue with other validations if type is wrong
      }
    } catch {
      errors.push({
        row: rowIndex,
        columnKey: column.key,  // Using destination column key
        message: `${column.label} must be in format ${dateFormat}`,
        type: 'dateFormat'
      });
      return errors; // Don't continue with other validations if type is wrong
    }
  }
  
  // String type validation and constraints
  else if (column.type === 'string') {
    // String-specific constraint validations
    if (constraints.minLength !== undefined && value.length < constraints.minLength) {
      errors.push({
        row: rowIndex,
        columnKey: column.key,  // Using destination column key
        message: `${column.label} must be at least ${constraints.minLength} characters long`,
        type: 'minLength'
      });
    }

    if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
      errors.push({
        row: rowIndex,
        columnKey: column.key,  // Using destination column key
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
            columnKey: column.key,  // Using destination column key
            message: `${column.label} does not match the required pattern`,
            type: 'pattern'
          });
        }
      } catch {
        console.warn(`Invalid regex pattern for column ${column.label}:`, constraints.pattern);
      }
    }
  }

  // ===== UNIQUE CONSTRAINT VALIDATION =====
  if (constraints.unique) {
    const sourceColumnKey = columnMapping[column.key];
    if (sourceColumnKey) {
      const duplicateRowIndex = allRows.findIndex((row, index) => 
        index !== rowIndex && row[sourceColumnKey] === value
      );
      
      if (duplicateRowIndex !== -1) {
        errors.push({
          row: rowIndex,
          columnKey: column.key,  // Using destination column key
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
 * This is the main validation function called by the useSpreadsheet hook
 */
export const validateSpreadsheetData = (
  rows: RowData[],
  configColumns: ColumnDefinition[],
  columnMappings: { [destColumnKey: string]: string }
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Only validate columns that have mappings
  const mappedColumns = configColumns.filter(col => columnMappings[col.key]);
  
  console.log('validateSpreadsheetData called with:');
  console.log('- configColumns:', configColumns);
  console.log('- columnMappings:', columnMappings);
  console.log('- mappedColumns:', mappedColumns);

  rows.forEach((row, rowIndex) => {
    mappedColumns.forEach(column => {
      const sourceColumnKey = columnMappings[column.key];
      if (sourceColumnKey && row[sourceColumnKey] !== undefined) {
        console.log(`Validating row ${rowIndex}, column ${column.key} (${column.label}), value: "${row[sourceColumnKey]}", type: ${column.type}`);
        const cellErrors = validateCellConstraints(
          row[sourceColumnKey],
          column,
          rowIndex,
          rows,
          columnMappings
        );
        console.log(`Validation errors for row ${rowIndex}, column ${column.key}:`, cellErrors);
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