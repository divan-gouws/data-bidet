import { useState, useRef, useCallback } from 'react';
import type { 
  RowData, 
  ColumnDefinition, 
  CellPosition, 
  ColumnWidths 
} from '../types';
import { SPREADSHEET_CONSTANTS } from '../constants';
import { initialColumnSchema, createInitialRows } from '../data/initialData';

export const useSpreadsheet = () => {
  const [rows, setRows] = useState<RowData[]>(() => 
    createInitialRows(SPREADSHEET_CONSTANTS.DEFAULT_ROW_COUNT)
  );
  const [columnSchema, setColumnSchema] = useState<ColumnDefinition[]>(initialColumnSchema);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<number | null>(null);
  const cellRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const getColumnWidth = useCallback((columnKey: string): number => {
    return columnWidths[columnKey] || SPREADSHEET_CONSTANTS.DEFAULT_COLUMN_WIDTH;
  }, [columnWidths]);

  const handleColumnResize = useCallback((columnKey: string, newWidth: number): void => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: Math.max(
        SPREADSHEET_CONSTANTS.MIN_COLUMN_WIDTH, 
        Math.min(SPREADSHEET_CONSTANTS.MAX_COLUMN_WIDTH, newWidth)
      )
    }));
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
    // Don't handle clicks on the dropdown
    if ((event.target as HTMLElement).closest('.col-type-select')) {
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

  return {
    // State
    rows,
    columnSchema,
    selectedCell,
    selectedHeader,
    columnWidths,
    isEditing,
    cellRefs,
    
    // Actions
    getColumnWidth,
    handleColumnResize,
    handleColumnNameChange,
    handleColumnTypeChange,
    handleMultiPaste,
    onCellChange,
    navigateToCell,
    navigateToHeader,
    handleCellClick,
    handleHeaderClick,
    handleEditStart,
    handleEditEnd,
  };
}; 