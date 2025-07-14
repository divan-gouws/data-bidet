import { useState, useRef, useCallback, useEffect } from 'react';
import type { 
  RowData, 
  ColumnDefinition, 
  CellPosition, 
  ColumnWidths,
  ValidationResult,
  ValidationConstraints 
} from '../types';
import { SPREADSHEET_CONSTANTS } from '../constants';
import { initialColumnSchema, createInitialRows, getDefaultTitle } from '../data/initialData';
import { validateSpreadsheetData } from '../utils/spreadsheetUtils';

export const useSpreadsheet = () => {
  const [rows, setRows] = useState<RowData[]>(() => 
    createInitialRows(SPREADSHEET_CONSTANTS.DEFAULT_ROW_COUNT)
  );
  const [columnSchema, setColumnSchema] = useState<ColumnDefinition[]>(initialColumnSchema);
  
  // Configuration table state - separate from main spreadsheet
  const [configColumns, setConfigColumns] = useState<ColumnDefinition[]>(() => 
    initialColumnSchema.map(col => ({ ...col })) // Deep copy to avoid references
  );
  
  // Column mapping state - maps destination column keys to source column keys
  const [columnMappings, setColumnMappings] = useState<{ [destColumnKey: string]: string }>({});
  
  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [] });
  
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [selectedCells, setSelectedCells] = useState<CellPosition[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<CellPosition | null>(null);
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<number | null>(null);
  const [title, setTitle] = useState<string>(getDefaultTitle());
  const cellRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const getColumnWidth = useCallback((columnKey: string): number => {
    return columnWidths[columnKey] || SPREADSHEET_CONSTANTS.DEFAULT_COLUMN_WIDTH;
  }, [columnWidths]);

  const getTotalTableWidth = useCallback((): number => {
    return columnSchema.reduce((total, col) => {
      return total + getColumnWidth(col.key);
    }, 0);
  }, [columnSchema, getColumnWidth]);

  const handleColumnResize = useCallback((columnKey: string, newWidth: number): void => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: Math.max(
        SPREADSHEET_CONSTANTS.MIN_COLUMN_WIDTH, 
        Math.min(SPREADSHEET_CONSTANTS.MAX_COLUMN_WIDTH, newWidth)
      )
    }));
  }, []);

  const handleTitleChange = useCallback((newTitle: string): void => {
    setTitle(newTitle);
  }, []);

  const handleColumnNameChange = useCallback((colIndex: number, newName: string): void => {
    setColumnSchema((cols) => {
      const updated = [...cols];
      updated[colIndex] = { ...updated[colIndex], label: newName };
      return updated;
    });
  }, []);

  const handleColumnTypeChange = useCallback((colIndex: number, newType: 'string' | 'number' | 'date'): void => {
    setColumnSchema((cols) => {
      const updated = [...cols];
      updated[colIndex] = { ...updated[colIndex], type: newType };
      return updated;
    });
  }, []);

  const handleMultiPaste = useCallback((startRow: number, startCol: number, cells: string[][]): void => {
    const updatedRows = [...rows];

    for (let r = 0; r < cells.length; r++) {
      const rowIdx = startRow + r;
      if (rowIdx >= updatedRows.length) break;

      for (let c = 0; c < cells[r].length; c++) {
        const colIdx = startCol + c;
        if (colIdx >= columnSchema.length) break;

        const colKey = columnSchema[colIdx].key;
        updatedRows[rowIdx][colKey] = cells[r][c];
      }
    }

    setRows(updatedRows);
  }, [rows, columnSchema]);

  const handleHeaderPaste = useCallback((startCol: number, cells: string[][]): void => {
    const updatedColumnSchema = [...columnSchema];
    const updatedRows = [...rows];

    // Handle header paste - use the first row for headers
    const headerRow = cells[0] || [];
    
    for (let c = 0; c < headerRow.length; c++) {
      const colIdx = startCol + c;
      if (colIdx >= updatedColumnSchema.length) break;

      // Update only the label, preserve the type and key
      updatedColumnSchema[colIdx] = {
        ...updatedColumnSchema[colIdx],
        label: headerRow[c]
      };
    }

    // Handle data paste - use remaining rows for data
    for (let r = 1; r < cells.length; r++) {
      const rowIdx = r - 1; // Start from first data row (index 0)
      if (rowIdx >= updatedRows.length) break;

      for (let c = 0; c < cells[r].length; c++) {
        const colIdx = startCol + c;
        if (colIdx >= updatedColumnSchema.length) break;

        const colKey = updatedColumnSchema[colIdx].key;
        updatedRows[rowIdx][colKey] = cells[r][c];
      }
    }

    setColumnSchema(updatedColumnSchema);
    setRows(updatedRows);
  }, [columnSchema, rows]);

  const onCellChange = useCallback((rowIndex: number, columnKey: string, newValue: string): void => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnKey] = newValue;
    setRows(updatedRows);
  }, [rows]);

  const navigateToCell = useCallback((row: number, col: number, shouldEdit: boolean = false): void => {
    if (row >= 0 && row < rows.length && col >= 0 && col < columnSchema.length) {
      setSelectedCell({ row, col });
      setSelectedHeader(null);
      setIsEditing(shouldEdit);
      
      if (shouldEdit) {
        const cellKey = `${row}-${col}`;
        const cellElement = cellRefs.current[cellKey];
        if (cellElement) {
          setTimeout(() => {
            cellElement.click();
          }, 0);
        }
      }
    }
  }, [rows.length, columnSchema.length]);

  const navigateToHeader = useCallback((col: number): void => {
    if (col >= 0 && col < columnSchema.length) {
      setSelectedCell(null);
      setSelectedHeader(col);
      setIsEditing(false);
      
      // Focus the header input after navigation
      setTimeout(() => {
        const headerInput = document.querySelector(`[data-header-index="${col}"]`) as HTMLInputElement;
        if (headerInput) {
          headerInput.focus();
          headerInput.select();
        }
      }, 0);
    }
  }, [columnSchema.length]);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number): void => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setSelectedHeader(null);
    setIsEditing(true);
  }, []);

  const handleHeaderClick = useCallback((colIndex: number, event: React.MouseEvent): void => {
    // Don't handle clicks on the dropdown or resizer
    if ((event.target as HTMLElement).closest('.col-type-select') || 
        (event.target as HTMLElement).closest('.column-resizer')) {
      return;
    }
    
    setSelectedCell(null);
    setSelectedHeader(colIndex);
    setIsEditing(false);
    
    // Focus the header input when clicking
    setTimeout(() => {
      const headerInput = document.querySelector(`[data-header-index="${colIndex}"]`) as HTMLInputElement;
      if (headerInput) {
        headerInput.focus();
        headerInput.select();
      }
    }, 0);
  }, []);

  const handleEditStart = useCallback((): void => {
    setIsEditing(true);
  }, []);

  const handleEditEnd = useCallback((): void => {
    setIsEditing(false);
  }, []);

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number): void => {
    setColumnSchema((prevSchema) => {
      const newSchema = [...prevSchema];
      const [movedColumn] = newSchema.splice(fromIndex, 1);
      newSchema.splice(toIndex, 0, movedColumn);
      return newSchema;
    });

    // Update all rows to maintain column order
    setRows((prevRows) => {
      return prevRows.map(row => {
        const newRow = { ...row };
        const orderedData: { [key: string]: string } = {};
        columnSchema.forEach(col => {
          orderedData[col.key] = newRow[col.key];
        });
        return orderedData;
      });
    });
  }, [columnSchema]);

  const handleAddColumn = useCallback((): void => {
    setColumnSchema((prevSchema) => {
      const newColumnKey = `col${prevSchema.length + 1}`;
      const newColumn: ColumnDefinition = {
        key: newColumnKey,
        label: `Column ${prevSchema.length + 1}`,
        type: 'string'
      };
      return [...prevSchema, newColumn];
    });

    // Add the new column to all existing rows with empty values
    setRows((prevRows) => {
      return prevRows.map(row => ({
        ...row,
        [`col${columnSchema.length + 1}`]: ''
      }));
    });
  }, [columnSchema.length]);

  const handleAddRow = useCallback((): void => {
    setRows((prevRows) => {
      const newRow: RowData = {};
      // Initialize the new row with empty values for all columns
      columnSchema.forEach(col => {
        newRow[col.key] = '';
      });
      return [...prevRows, newRow];
    });
  }, [columnSchema]);

  // Multi-cell selection handlers - Cycling click system
  const handleMouseDown = useCallback((rowIndex: number, colIndex: number): void => {
    const position = { row: rowIndex, col: colIndex };
    
    if (!selectionStart) {
      // First click - set start position
      setSelectionStart(position);
      setSelectedCells([position]);
      setIsSelecting(true);
    } else if (isSelecting) {
      // Second click - complete selection and stop selecting
      const minRow = Math.min(selectionStart.row, position.row);
      const maxRow = Math.max(selectionStart.row, position.row);
      const minCol = Math.min(selectionStart.col, position.col);
      const maxCol = Math.max(selectionStart.col, position.col);
      
      const newSelectedCells: CellPosition[] = [];
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          newSelectedCells.push({ row, col });
        }
      }
      setSelectedCells(newSelectedCells);
      setIsSelecting(false);
    } else {
      // Third click and beyond - start new selection
      setSelectionStart(position);
      setSelectedCells([position]);
      setIsSelecting(true);
    }
  }, [selectionStart, isSelecting]);

  const handleMouseEnter = useCallback((rowIndex: number, colIndex: number): void => {
    if (isSelecting && selectionStart) {
      // Show preview of selection area on hover
      const endPosition = { row: rowIndex, col: colIndex };
      const minRow = Math.min(selectionStart.row, endPosition.row);
      const maxRow = Math.max(selectionStart.row, endPosition.row);
      const minCol = Math.min(selectionStart.col, endPosition.col);
      const maxCol = Math.max(selectionStart.col, endPosition.col);
      
      const previewSelectedCells: CellPosition[] = [];
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          previewSelectedCells.push({ row, col });
        }
      }
      setSelectedCells(previewSelectedCells);
    }
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback((): void => {
    // Not needed for click system, but keeping for compatibility
  }, []);

  const clearSelectedCells = useCallback((): void => {
    const updatedRows = [...rows];
    selectedCells.forEach(({ row, col }) => {
      if (row < updatedRows.length && col < columnSchema.length) {
        const colKey = columnSchema[col].key;
        updatedRows[row][colKey] = '';
      }
    });
    setRows(updatedRows);
    setSelectedCells([]);
    setSelectionStart(null);
    setIsSelecting(false);
  }, [rows, selectedCells, columnSchema]);

  const cancelSelection = useCallback((): void => {
    setSelectedCells([]);
    setSelectionStart(null);
    setIsSelecting(false);
  }, []);

  const clearSelectedRange = useCallback((): void => {
    setSelectedCells([]);
    setSelectionStart(null);
    setIsSelecting(false);
  }, []);

  const handleDeleteColumn = useCallback((colIndex: number): void => {
    if (columnSchema.length <= 1) return; // Don't delete the last column
    
    const columnToDelete = columnSchema[colIndex];
    
    // Remove column from schema
    setColumnSchema((prevSchema) => {
      const newSchema = [...prevSchema];
      newSchema.splice(colIndex, 1);
      return newSchema;
    });

    // Remove column data from all rows
    setRows((prevRows) => {
      return prevRows.map(row => {
        const newRow = { ...row };
        delete newRow[columnToDelete.key];
        return newRow;
      });
    });
  }, [columnSchema]);

  // Configuration table handlers
  const handleConfigColumnNameChange = useCallback((colIndex: number, newName: string): void => {
    setConfigColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[colIndex] = { ...updatedColumns[colIndex], label: newName };
      return updatedColumns;
    });
  }, []);

  const handleConfigColumnTypeChange = useCallback((colIndex: number, newType: 'string' | 'number' | 'date'): void => {
    setConfigColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[colIndex] = { ...updatedColumns[colIndex], type: newType };
      return updatedColumns;
    });
  }, []);

  const handleConfigColumnOptionalChange = useCallback((colIndex: number, isOptional: boolean): void => {
    setConfigColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[colIndex] = { ...updatedColumns[colIndex], optional: isOptional };
      return updatedColumns;
    });
  }, []);

  const handleAddConfigColumn = useCallback((): void => {
    setConfigColumns((prevColumns) => {
      const newColumnKey = `col${prevColumns.length + 1}`;
      const newColumn: ColumnDefinition = {
        key: newColumnKey,
        label: `Column ${prevColumns.length + 1}`,
        type: 'string',
        optional: false
      };
      return [...prevColumns, newColumn];
    });
  }, []);

  const handleDeleteConfigColumn = useCallback((colIndex: number): void => {
    if (configColumns.length <= 1) return; // Don't delete the last column
    
    setConfigColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const deletedColumn = newColumns[colIndex];
      newColumns.splice(colIndex, 1);
      
      // Remove mapping for deleted column
      setColumnMappings((prevMappings) => {
        const newMappings = { ...prevMappings };
        delete newMappings[deletedColumn.key];
        return newMappings;
      });
      
      return newColumns;
    });
  }, [configColumns.length]);

  // Validation constraint handlers
  const handleValidationConstraintChange = useCallback((colIndex: number, constraints: ValidationConstraints): void => {
    setConfigColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      updatedColumns[colIndex] = { 
        ...updatedColumns[colIndex], 
        validation: { ...updatedColumns[colIndex].validation, ...constraints }
      };
      return updatedColumns;
    });
  }, []);

  const runValidation = useCallback((): ValidationResult => {
    const result = validateSpreadsheetData(rows, configColumns, columnMappings);
    setValidationResult(result);
    return result;
  }, [rows, configColumns, columnMappings]);

  const clearValidation = useCallback((): void => {
    setValidationResult({ isValid: true, errors: [] });
  }, []);

  const getValidationErrorsForCell = useCallback((rowIndex: number, columnKey: string) => {
    return validationResult.errors.filter(error => 
      error.row === rowIndex && error.columnKey === columnKey
    );
  }, [validationResult.errors]);

  // Auto-run validation when data, config, or mappings change
  useEffect(() => {
    const result = validateSpreadsheetData(rows, configColumns, columnMappings);
    setValidationResult(result);
  }, [rows, configColumns, columnMappings]);

  // Column mapping handlers
  const handleColumnMapping = useCallback((destColumnKey: string, sourceColumnKey: string): void => {
    setColumnMappings((prevMappings) => ({
      ...prevMappings,
      [destColumnKey]: sourceColumnKey
    }));
  }, []);

  const clearColumnMapping = useCallback((destColumnKey: string): void => {
    setColumnMappings((prevMappings) => {
      const newMappings = { ...prevMappings };
      delete newMappings[destColumnKey];
      return newMappings;
    });
  }, []);

  const getUnmappedDestinationColumns = useCallback((): ColumnDefinition[] => {
    return configColumns.filter(col => !col.optional && !columnMappings[col.key]);
  }, [configColumns, columnMappings]);

  const getMappingValidation = useCallback(() => {
    const unmappedDestColumns = getUnmappedDestinationColumns();
    const requiredColumns = configColumns.filter(col => !col.optional);
    return {
      isValid: unmappedDestColumns.length === 0,
      unmappedColumns: unmappedDestColumns,
      totalDestColumns: configColumns.length,
      requiredColumns: requiredColumns.length,
      mappedColumns: Object.keys(columnMappings).length
    };
  }, [getUnmappedDestinationColumns, configColumns, columnMappings]);

  return {
    // State
    rows,
    columnSchema,
    configColumns,
    columnMappings,
    validationResult,
    selectedCell,
    selectedCells,
    isSelecting,
    selectionStart,
    selectedHeader,
    columnWidths,
    isEditing,
    title,
    cellRefs,
    setSelectedCell,
    setSelectedCells,
    setSelectedHeader,
    setIsEditing,
    // Actions
    getColumnWidth,
    getTotalTableWidth,
    handleColumnResize,
    handleTitleChange,
    handleColumnNameChange,
    handleColumnTypeChange,
    handleMultiPaste,
    handleHeaderPaste,
    onCellChange,
    navigateToCell,
    navigateToHeader,
    handleCellClick,
    handleHeaderClick,
    handleEditStart,
    handleEditEnd,
    handleColumnReorder,
    handleAddColumn,
    handleAddRow,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    clearSelectedCells,
    cancelSelection,
    clearSelectedRange,
    handleDeleteColumn,
    // Configuration table actions
    handleConfigColumnNameChange,
    handleConfigColumnTypeChange,
    handleConfigColumnOptionalChange,
    handleAddConfigColumn,
    handleDeleteConfigColumn,
    // Column mapping actions
    handleColumnMapping,
    clearColumnMapping,
    getUnmappedDestinationColumns,
    getMappingValidation,
    // Validation actions
    handleValidationConstraintChange,
    runValidation,
    clearValidation,
    getValidationErrorsForCell,
  };
}; 