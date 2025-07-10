import React from 'react';
import type { RowData, ColumnDefinition, CellPosition } from '../types';
import EditableCell from '../EditableCell';
import { useColumnResize } from '../hooks/useColumnResize';
import { ColumnResizer } from './ColumnResizer';

interface SpreadsheetBodyProps {
  rows: RowData[];
  columnSchema: ColumnDefinition[];
  selectedCell: CellPosition | null;
  isEditing: boolean;
  getColumnWidth: (columnKey: string) => number;
  handleCellClick: (rowIndex: number, colIndex: number) => void;
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
  isEditing,
  getColumnWidth,
  handleCellClick,
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

  return (
    <tbody>
      {rows.map((row, rowIndex) => (
        <tr key={rowIndex}>
          {columnSchema.map((col, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`;
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            return (
              <td 
                key={col.key} 
                className={isSelected ? "cell-selected" : ""}
                onClick={() => handleCellClick(rowIndex, colIndex)}
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
                    isEditing={isEditing && selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
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