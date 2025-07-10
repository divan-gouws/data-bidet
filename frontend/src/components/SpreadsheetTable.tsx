import React from 'react';
import type { RowData, ColumnDefinition, CellPosition } from '../types';
import { SpreadsheetHeader } from './SpreadsheetHeader';
import { SpreadsheetBody } from './SpreadsheetBody';

interface SpreadsheetTableProps {
  rows: RowData[];
  columnSchema: ColumnDefinition[];
  selectedCell: CellPosition | null;
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
  onCellChange: (rowIndex: number, columnKey: string, newValue: string) => void;
  handleMultiPaste: (startRow: number, startCol: number, cells: string[][]) => void;
  handleEditStart: () => void;
  handleEditEnd: () => void;
  handleColumnReorder: (fromIndex: number, toIndex: number) => void;
  handleAddColumn: () => void;
  handleAddRow: () => void;
  cellRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  rows,
  columnSchema,
  selectedCell,
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
  onCellChange,
  handleMultiPaste,
  handleEditStart,
  handleEditEnd,
  handleColumnReorder,
  handleAddColumn,
  handleAddRow,
  cellRefs,
}) => {
  const totalWidth = getTotalTableWidth();

  return (
    <div className="spreadsheet-container">
      <div className="spreadsheet-main">
        <div className="table-container" style={{ width: `${totalWidth}px` }}>
          <table className="table-wrapper" border={1} cellPadding={8} cellSpacing={0}>
            <SpreadsheetHeader
              columnSchema={columnSchema}
              selectedHeader={selectedHeader}
              getColumnWidth={getColumnWidth}
              handleColumnResize={handleColumnResize}
              handleColumnNameChange={handleColumnNameChange}
              handleColumnTypeChange={handleColumnTypeChange}
              handleHeaderClick={handleHeaderClick}
              handleHeaderPaste={handleHeaderPaste}
              handleColumnReorder={handleColumnReorder}
            />
            <SpreadsheetBody
              rows={rows}
              columnSchema={columnSchema}
              selectedCell={selectedCell}
              isEditing={isEditing}
              getColumnWidth={getColumnWidth}
              handleCellClick={handleCellClick}
              onCellChange={onCellChange}
              handleMultiPaste={handleMultiPaste}
              handleEditStart={handleEditStart}
              handleEditEnd={handleEditEnd}
              cellRefs={cellRefs}
              handleColumnResize={handleColumnResize}
            />
          </table>
        </div>
        <div className="table-actions-right">
          <button 
            className="add-column-button"
            onClick={handleAddColumn}
            title="Add new column"
          >
            Add Column
          </button>
        </div>
      </div>
      <div className="table-actions-bottom">
        <button 
          className="add-row-button"
          onClick={handleAddRow}
          title="Add new row"
        >
          Add Row
        </button>
      </div>
    </div>
  );
}; 