import React from 'react';
import type { ColumnDefinition } from '../types';
import { COLUMN_TYPES } from '../constants';

interface SpreadsheetHeaderProps {
  columnSchema: ColumnDefinition[];
  selectedHeader: number | null;
  getColumnWidth: (columnKey: string) => number;
  handleColumnResize: (columnKey: string, newWidth: number) => void;
  handleColumnNameChange: (colIndex: number, newName: string) => void;
  handleColumnTypeChange: (colIndex: number, newType: 'string' | 'number' | 'date') => void;
  handleHeaderClick: (colIndex: number, event: React.MouseEvent) => void;
  navigateToCell: (row: number, col: number, shouldEdit: boolean) => void;
}

export const SpreadsheetHeader: React.FC<SpreadsheetHeaderProps> = ({
  columnSchema,
  selectedHeader,
  getColumnWidth,
  handleColumnResize,
  handleColumnNameChange,
  handleColumnTypeChange,
  handleHeaderClick,
  navigateToCell,
}) => {
  return (
    <thead>
      <tr>
        {columnSchema.map((col, colIndex) => (
          <th 
            key={col.key} 
            className="col-header"
            style={{ width: getColumnWidth(col.key) }}
          >
            <div 
              className={`header-content ${selectedHeader === colIndex ? 'header-selected' : ''}`}
              onClick={(event) => handleHeaderClick(colIndex, event)}
            >
              <div className="header-label-container">
                <input
                  type="text"
                  value={col.label}
                  onChange={(e) => handleColumnNameChange(colIndex, e.target.value)}
                  className="header-input"
                  onFocus={() => handleHeaderClick(colIndex, {} as React.MouseEvent)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      // Move to first data cell of this column
                      navigateToCell(0, colIndex, true);
                    }
                  }}
                  data-header-index={colIndex}
                />
              </div>
              <select
                className="col-type-select"
                value={col.type}
                onChange={(e) => {
                  const newType = e.target.value as "string" | "number" | "date";
                  handleColumnTypeChange(colIndex, newType);
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <option value={COLUMN_TYPES.STRING}>String</option>
                <option value={COLUMN_TYPES.NUMBER}>Number</option>
                <option value={COLUMN_TYPES.DATE}>Date</option>
              </select>
            </div>
            <div 
              className="column-resizer"
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = getColumnWidth(col.key);
                
                const handleMouseMove = (e: MouseEvent) => {
                  const deltaX = e.clientX - startX;
                  const newWidth = startWidth + deltaX;
                  handleColumnResize(col.key, newWidth);
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </th>
        ))}
      </tr>
    </thead>
  );
}; 