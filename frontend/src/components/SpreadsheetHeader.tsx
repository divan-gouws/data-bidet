import React from 'react';
import type { ColumnDefinition } from '../types';
import { COLUMN_TYPES } from '../constants';
import { useColumnResize } from '../hooks/useColumnResize';
import { ColumnResizer } from './ColumnResizer';
import EditableHeader from './EditableHeader';

interface SpreadsheetHeaderProps {
  columnSchema: ColumnDefinition[];
  selectedHeader: number | null;
  getColumnWidth: (columnKey: string) => number;
  handleColumnResize: (columnKey: string, newWidth: number) => void;
  handleColumnNameChange: (colIndex: number, newName: string) => void;
  handleColumnTypeChange: (colIndex: number, newType: 'string' | 'number' | 'date') => void;
  handleHeaderClick: (colIndex: number, event: React.MouseEvent) => void;
  handleHeaderPaste: (startCol: number, cells: string[][]) => void;
}

export const SpreadsheetHeader: React.FC<SpreadsheetHeaderProps> = ({
  columnSchema,
  selectedHeader,
  getColumnWidth,
  handleColumnResize,
  handleColumnNameChange,
  handleColumnTypeChange,
  handleHeaderClick,
  handleHeaderPaste,
}) => {
  const { resizingColumn, handleResizeStart } = useColumnResize({
    handleColumnResize,
    getColumnWidth,
  });

  return (
    <thead>
      <tr>
        {columnSchema.map((col, colIndex) => (
          <th 
            key={col.key} 
            className="col-header"
            style={{ width: getColumnWidth(col.key) }}
            data-column={col.key}
          >
            <div 
              className="cell-container"
              onClick={(e) => handleHeaderClick(colIndex, e)}
            >
              <div className="header-content-inner">
                <EditableHeader
                  value={col.label}
                  onChange={(newName) => handleColumnNameChange(colIndex, newName)}
                  onPasteHeaders={(cells) => handleHeaderPaste(colIndex, cells)}
                  isEditing={selectedHeader === colIndex}
                  onEditStart={() => {}}
                  onEditEnd={() => handleHeaderClick(colIndex, {} as React.MouseEvent)}
                  dataHeaderIndex={colIndex}
                />
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
            </div>
            <ColumnResizer
              columnKey={col.key}
              resizingColumn={resizingColumn}
              onResizeStart={handleResizeStart}
            />
          </th>
        ))}
      </tr>
    </thead>
  );
}; 