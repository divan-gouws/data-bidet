import React from 'react';
import type { RowData, ColumnDefinition, CellPosition } from '../types';
import type { SpreadsheetMode } from './SpreadsheetToolbar';
import EditableCell from '../EditableCell';
import { useColumnResize } from '../hooks/useColumnResize';
import { ColumnResizer } from './ColumnResizer';

interface SpreadsheetBodyProps {
  rows: RowData[];
  columnSchema: ColumnDefinition[];
  selectedCell: CellPosition | null;
  selectedCells: CellPosition[];
  isSelecting: boolean;
  selectionStart: CellPosition | null;
  currentMode: SpreadsheetMode;
  isEditing: boolean;
  getColumnWidth: (columnKey: string) => number;
  handleCellClick: (rowIndex: number, colIndex: number) => void;
  handleMouseEnter: (rowIndex: number, colIndex: number) => void;
  onCellChange: (rowIndex: number, columnKey: string, newValue: string) => void;
  handleMultiPaste: (startRow: number, startCol: number, cells: string[][]) => void;
  handleEditStart: () => void;
  handleEditEnd: () => void;
  cellRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  handleColumnResize: (columnKey: string, newWidth: number) => void;
}

export const SpreadsheetBody: React.FC<SpreadsheetBodyProps> = ({
  rows,
  columnSchema,
  selectedCell,
  selectedCells,
  isSelecting,
  selectionStart,
  currentMode,
  isEditing,
  getColumnWidth,
  handleCellClick,
  handleMouseEnter,
  onCellChange,
  handleMultiPaste,
  handleEditStart,
  handleEditEnd,
  cellRefs,
  handleColumnResize,
}) => {
  const { resizingColumn, handleResizeStart } = useColumnResize({
    handleColumnResize,
    getColumnWidth,
  });

  const isCellSelected = (rowIndex: number, colIndex: number) => {
    return selectedCells.some(cell => cell.row === rowIndex && cell.col === colIndex);
  };

  const isCellSelectionStart = (rowIndex: number, colIndex: number) => {
    return selectionStart?.row === rowIndex && selectionStart?.col === colIndex;
  };

  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <tr key={rowIndex}>
          {columnSchema.map((col, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isMultiSelected = isCellSelected(rowIndex, colIndex);
            const isSelectionStartCell = isCellSelectionStart(rowIndex, colIndex);
            return (
              <td 
                key={col.key} 
                className={`${isSelected ? "cell-selected" : ""} ${isMultiSelected ? "cell-multi-selected" : ""} ${isSelectionStartCell && isSelecting ? "cell-selection-start" : ""}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                style={{ width: getColumnWidth(col.key), position: 'relative' }}
                data-column={col.key}
              >
                <div
                  ref={(el) => {
                    cellRefs.current[cellKey] = el;
                  }}
                  className="cell-container"
                >
                  <EditableCell
                    value={row[col.key]}
                    columnType={col.type}
                    onChange={(newVal: string) => onCellChange(rowIndex, col.key, newVal)}
                    onPasteCells={(cells: string[][]) => handleMultiPaste(rowIndex, colIndex, cells)}
                    isEditing={isEditing && selectedCell?.row === rowIndex && selectedCell?.col === colIndex && currentMode === 'edit'}
                    onEditStart={handleEditStart}
                    onEditEnd={handleEditEnd}
                  />
                  {/* Resizer handle for every cell */}
                  <ColumnResizer
                    columnKey={col.key}
                    resizingColumn={resizingColumn}
                    onResizeStart={handleResizeStart}
                  />
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}; 