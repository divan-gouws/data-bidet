import React from 'react';
import type { RowData, ColumnDefinition, CellPosition, ValidationError } from '../types';
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
  getValidationErrorsForCell?: (rowIndex: number, columnKey: string) => ValidationError[];
  columnMappings: { [destColumnKey: string]: string };
  configColumns: ColumnDefinition[];  // Add configColumns prop
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
  getValidationErrorsForCell,
  columnMappings,
  configColumns,  // Add configColumns to destructuring
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
          <td className="row-number-cell">
            <div className="row-number">{rowIndex + 1}</div>
          </td>
          {columnSchema.map((col, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isMultiSelected = isCellSelected(rowIndex, colIndex);
            const isSelectionStartCell = isCellSelectionStart(rowIndex, colIndex);
            
            // Find the destination column key that maps to this source column
            const destinationColumnKey = Object.keys(columnMappings).find(
              destKey => columnMappings[destKey] === col.key
            );

            // Find the destination column definition from configColumns prop
            const destinationColumn = destinationColumnKey ? 
              configColumns.find(configCol => configCol.key === destinationColumnKey) : 
              undefined;
            
            // Add isMapped property and merge validation rules from destination column
            const columnWithMapping = {
              ...col,
              isMapped: !!destinationColumnKey,
              type: destinationColumn?.type,  // Only use destination column type
              validation: destinationColumn?.validation
            };
            
            console.log(`Row ${rowIndex}, Col ${colIndex} (${col.key}):`, {
              sourceColumnKey: col.key,
              destinationColumnKey,
              columnMappings,
              hasMapping: !!destinationColumnKey,
              type: destinationColumn?.type
            });

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
                    column={columnWithMapping}
                    onChange={(newVal: string) => onCellChange(rowIndex, col.key, newVal)}
                    onPasteCells={(cells: string[][]) => handleMultiPaste(rowIndex, colIndex, cells)}
                    isEditing={isEditing && selectedCell?.row === rowIndex && selectedCell?.col === colIndex && currentMode === 'edit'}
                    onEditStart={handleEditStart}
                    onEditEnd={handleEditEnd}
                    validationErrors={getValidationErrorsForCell && destinationColumnKey ? getValidationErrorsForCell(rowIndex, destinationColumnKey) : []}
                  />
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