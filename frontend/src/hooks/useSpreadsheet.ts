import { useState, useRef, useCallback } from 'react';
import type { 
  RowData, 
  ColumnDefinition, 
  CellPosition, 
  ColumnWidths 
} from '../types';
import { SPREADSHEET_CONSTANTS } from '../constants';
import { initialColumnSchema, createInitialRows, getDefaultTitle } from '../data/initialData';

export const useSpreadsheet = () => {
  const [rows, setRows] = useState<RowData[]>(() => 
    createInitialRows(SPREADSHEET_CONSTANTS.DEFAULT_ROW_COUNT)
  );
  const [columnSchema, setColumnSchema] = useState<ColumnDefinition[]>(initialColumnSchema);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
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

  return {
    // State
    rows,
    columnSchema,
    selectedCell,
    selectedHeader,
    columnWidths,
    isEditing,
    title,
    cellRefs,
    setSelectedCell,
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
  };
}; 