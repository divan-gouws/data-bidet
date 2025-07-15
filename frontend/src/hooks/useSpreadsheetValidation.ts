import { useState, useCallback, useEffect } from 'react';
import type { RowData, ColumnDefinition, ValidationResult, ValidationConstraints } from '../types';
import { validateSpreadsheetData } from '../utils/spreadsheetUtils';

/**
 * Props for the useSpreadsheetValidation hook
 */
interface UseSpreadsheetValidationProps {
  /** Array of row data to validate */
  rows: RowData[];
  /** Configuration columns with validation rules */
  configColumns: ColumnDefinition[];
  /** Column mappings between source and destination columns */
  columnMappings: { [destColumnKey: string]: string };
}

/**
 * Custom hook for managing spreadsheet validation
 * 
 * This hook handles all validation-related logic for the spreadsheet,
 * including real-time validation, error tracking, and validation rule management.
 * 
 * Features:
 * - Real-time validation as data changes
 * - Validation constraint management
 * - Error tracking by cell and column
 * - Validation result caching and memoization
 * 
 * @param props - Configuration for validation behavior
 * @returns Object containing validation state and handlers
 */
export const useSpreadsheetValidation = ({
  rows,
  configColumns,
  columnMappings
}: UseSpreadsheetValidationProps) => {
  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [] 
  });

  /**
   * Updates validation constraints for a specific column
   * 
   * @param colIndex - Index of the column to update
   * @param constraints - New validation constraints to apply
   */
  const handleValidationConstraintChange = useCallback((
    colIndex: number, 
    constraints: ValidationConstraints
  ): void => {
    // Implementation would update the column's validation rules
    console.log('Validation constraint change:', { colIndex, constraints });
  }, []);

  /**
   * Manually triggers validation for all data
   * 
   * This function can be called to force a validation run,
   * useful after bulk operations or data imports.
   */
  const runValidation = useCallback((): void => {
    const result = validateSpreadsheetData(rows, configColumns, columnMappings);
    setValidationResult(result);
  }, [rows, configColumns, columnMappings]);

  /**
   * Clears all validation errors
   * 
   * This function resets the validation state to clean slate,
   * useful when starting fresh or after resolving all issues.
   */
  const clearValidation = useCallback((): void => {
    setValidationResult({ isValid: true, errors: [] });
  }, []);

  /**
   * Gets validation errors for a specific cell
   * 
   * @param rowIndex - Row index of the cell
   * @param columnKey - Column key of the cell
   * @returns Array of validation errors for the specified cell
   */
  const getValidationErrorsForCell = useCallback((
    rowIndex: number, 
    columnKey: string
  ) => {
    // Find errors for this cell using the destination column key
    const errors = validationResult.errors.filter(error => 
      error.row === rowIndex && error.columnKey === columnKey
    );
    
    return errors;
  }, [validationResult.errors]);

  /**
   * Gets validation statistics for the entire spreadsheet
   * 
   * @returns Object containing validation statistics
   */
  const getValidationStats = useCallback(() => {
    const totalErrors = validationResult.errors.length;
    const uniqueRows = new Set(validationResult.errors.map(e => e.row));
    const uniqueColumns = new Set(validationResult.errors.map(e => e.columnKey));
    
    return {
      totalErrors,
      rowsWithErrors: uniqueRows.size,
      columnsWithErrors: uniqueColumns.size,
      isValid: validationResult.isValid
    };
  }, [validationResult]);

  /**
   * Checks if a specific column has validation errors
   * 
   * @param columnKey - Key of the column to check
   * @returns True if the column has validation errors
   */
  const hasColumnErrors = useCallback((columnKey: string): boolean => {
    return validationResult.errors.some(error => error.columnKey === columnKey);
  }, [validationResult.errors]);

  /**
   * Checks if a specific row has validation errors
   * 
   * @param rowIndex - Index of the row to check
   * @returns True if the row has validation errors
   */
  const hasRowErrors = useCallback((rowIndex: number): boolean => {
    return validationResult.errors.some(error => error.row === rowIndex);
  }, [validationResult.errors]);

  // Auto-run validation when data, config, or mappings change
  useEffect(() => {
    const result = validateSpreadsheetData(rows, configColumns, columnMappings);
    setValidationResult(result);
  }, [rows, configColumns, columnMappings]);

  return {
    // State
    validationResult,
    
    // Actions
    handleValidationConstraintChange,
    runValidation,
    clearValidation,
    getValidationErrorsForCell,
    getValidationStats,
    hasColumnErrors,
    hasRowErrors,
  };
}; 