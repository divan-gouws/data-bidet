import React from 'react';
import type { RowData, ColumnDefinition, CellPosition } from '../types';
import EditableCell from '../EditableCell';

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
}) => {
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
                style={{ width: getColumnWidth(col.key) }}
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
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}; 