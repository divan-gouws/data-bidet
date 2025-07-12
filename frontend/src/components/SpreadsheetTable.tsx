import React from 'react';
import type { RowData, ColumnDefinition, CellPosition } from '../types';
import type { SpreadsheetMode } from './SpreadsheetToolbar';
import { SpreadsheetHeader } from './SpreadsheetHeader';
import { SpreadsheetBody } from './SpreadsheetBody';

interface SpreadsheetTableProps {
  rows: RowData[];
  columnSchema: ColumnDefinition[];
  selectedCell: CellPosition | null;
  selectedCells: CellPosition[];
  isSelecting: boolean;
  selectionStart: CellPosition | null;
  currentMode: SpreadsheetMode;
  selectedHeader: number | null;
  isEditing: boolean;
  getColumnWidth: (columnKey: string) => number;
  getTotalTableWidth: () => number;
  handleColumnResize: (columnKey: string, newWidth: number) => void;
  handleColumnNameChange: (colIndex: number, newName: string) => void;
  handleColumnTypeChange: (colIndex: number, newType: 'string' | 'number' | 'date') => void;
  handleHeaderClick: (colIndex: number, event: React.MouseEvent) => void;
  handleHeaderPaste: (startCol: number, cells: string[][]) => void;
  handleCellClick: (rowIndex: number, colIndex: number) => void;
  handleMouseEnter: (rowIndex: number, colIndex: number) => void;
  onCellChange: (rowIndex: number, columnKey: string, newValue: string) => void;
  handleMultiPaste: (startRow: number, startCol: number, cells: string[][]) => void;
  handleEditStart: () => void;
  handleEditEnd: () => void;
  handleColumnReorder: (fromIndex: number, toIndex: number) => void;
  handleAddColumn: () => void;
  handleAddRow: () => void;
  handleDeleteColumn: (colIndex: number) => void;
  clearSelectedCells: () => void;
  cancelSelection: () => void;
  clearSelectedRange: () => void;
  cellRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  rows,
  columnSchema,
  selectedCell,
  selectedCells,
  isSelecting,
  selectionStart,
  currentMode,
  selectedHeader,
  isEditing,
  getColumnWidth,
  getTotalTableWidth,
  handleColumnResize,
  handleColumnNameChange,
  handleColumnTypeChange,
  handleHeaderClick,
  handleHeaderPaste,
  handleCellClick,
  handleMouseEnter,
  onCellChange,
  handleMultiPaste,
  handleEditStart,
  handleEditEnd,
  handleColumnReorder,
  handleAddColumn,
  handleAddRow,
  handleDeleteColumn,
  clearSelectedCells,
  cancelSelection,
  clearSelectedRange,
  cellRefs,
}) => {
  const totalWidth = getTotalTableWidth();

  return (
    <div className="spreadsheet-container">
      <div className="spreadsheet-main">
        <div className="table-container" style={{ 
          display: 'inline-block',
          borderRadius: '8px',
          boxShadow: '0 2px 12px var(--shadow-color)',
          backgroundColor: 'var(--table-bg)'
        }}>
          <table className="table-wrapper" border={1} cellPadding={8} cellSpacing={0} style={{ width: `${totalWidth}px` }}>
            <SpreadsheetHeader
              columnSchema={columnSchema}
              selectedHeader={selectedHeader}
              currentMode={currentMode}
              getColumnWidth={getColumnWidth}
              handleColumnResize={handleColumnResize}
              handleColumnNameChange={handleColumnNameChange}
              handleColumnTypeChange={handleColumnTypeChange}
              handleHeaderClick={handleHeaderClick}
              handleHeaderPaste={handleHeaderPaste}
              handleColumnReorder={handleColumnReorder}
              handleDeleteColumn={handleDeleteColumn}
            />
            <SpreadsheetBody
              rows={rows}
              columnSchema={columnSchema}
              selectedCell={selectedCell}
              selectedCells={selectedCells}
              isSelecting={isSelecting}
              selectionStart={selectionStart}
              currentMode={currentMode}
              isEditing={isEditing}
              getColumnWidth={getColumnWidth}
              handleCellClick={handleCellClick}
              handleMouseEnter={handleMouseEnter}
              onCellChange={onCellChange}
              handleMultiPaste={handleMultiPaste}
              handleEditStart={handleEditStart}
              handleEditEnd={handleEditEnd}
              cellRefs={cellRefs}
              handleColumnResize={handleColumnResize}
            />
          </table>
        </div>
        <button 
          className="add-column-button"
          onClick={handleAddColumn}
          title="Add new column"
        >
          Add Column
        </button>
      </div>
      {isSelecting && currentMode === 'delete' && (
        <button 
          className="cancel-selection-button"
          onClick={cancelSelection}
          title="Cancel selection"
        >
          ✖️ Cancel
        </button>
      )}
      {selectedCells.length > 0 && currentMode === 'delete' && !isSelecting && (
        <div className="selection-buttons">
          <button 
            className="delete-selection-button"
            onClick={clearSelectedCells}
            title="Delete selected cells"
          >
            ❌ Selection
          </button>
          <button 
            className="clear-selection-button"
            onClick={clearSelectedRange}
            title="Clear selection"
          >
            Cancel
          </button>
        </div>
      )}
      <button 
        className="add-row-button"
        onClick={handleAddRow}
        title="Add new row"
      >
        Add Row
      </button>
    </div>
  );
}; 