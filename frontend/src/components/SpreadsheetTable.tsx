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
  handleColumnResize: (columnKey: string, newWidth: number) => void;
  handleColumnNameChange: (colIndex: number, newName: string) => void;
  handleColumnTypeChange: (colIndex: number, newType: 'string' | 'number' | 'date') => void;
  handleHeaderClick: (colIndex: number, event: React.MouseEvent) => void;
  handleCellClick: (rowIndex: number, colIndex: number) => void;
  onCellChange: (rowIndex: number, columnKey: string, newValue: string) => void;
  handleMultiPaste: (startRow: number, startCol: number, cells: string[][]) => void;
  handleEditStart: () => void;
  handleEditEnd: () => void;
  navigateToCell: (row: number, col: number, shouldEdit: boolean) => void;
  cellRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

export const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({
  rows,
  columnSchema,
  selectedCell,
  selectedHeader,
  isEditing,
  getColumnWidth,
  handleColumnResize,
  handleColumnNameChange,
  handleColumnTypeChange,
  handleHeaderClick,
  handleCellClick,
  onCellChange,
  handleMultiPaste,
  handleEditStart,
  handleEditEnd,
  navigateToCell,
  cellRefs,
}) => {
  return (
    <table className="table-wrapper" border={1} cellPadding={8} cellSpacing={0}>
      <SpreadsheetHeader
        columnSchema={columnSchema}
        selectedHeader={selectedHeader}
        getColumnWidth={getColumnWidth}
        handleColumnResize={handleColumnResize}
        handleColumnNameChange={handleColumnNameChange}
        handleColumnTypeChange={handleColumnTypeChange}
        handleHeaderClick={handleHeaderClick}
        navigateToCell={navigateToCell}
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
      />
    </table>
  );
}; 