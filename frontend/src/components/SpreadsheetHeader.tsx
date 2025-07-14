import React, { useState } from 'react';
import type { ColumnDefinition } from '../types';
import type { SpreadsheetMode } from './SpreadsheetToolbar';
import { COLUMN_TYPES } from '../constants';
import { useColumnResize } from '../hooks/useColumnResize';
import { ColumnResizer } from './ColumnResizer';
import EditableHeader from './EditableHeader';

interface SpreadsheetHeaderProps {
  columnSchema: ColumnDefinition[];
  selectedHeader: number | null;
  currentMode: SpreadsheetMode;
  getColumnWidth: (columnKey: string) => number;
  handleColumnResize: (columnKey: string, newWidth: number) => void;
  handleColumnNameChange: (colIndex: number, newName: string) => void;
  handleColumnTypeChange: (colIndex: number, newType: 'string' | 'number' | 'date') => void;
  handleHeaderClick: (colIndex: number, event: React.MouseEvent) => void;
  handleHeaderPaste: (startCol: number, cells: string[][]) => void;
  handleColumnReorder: (fromIndex: number, toIndex: number) => void;
  handleDeleteColumn: (colIndex: number) => void;
}

export const SpreadsheetHeader: React.FC<SpreadsheetHeaderProps> = ({
  columnSchema,
  selectedHeader,
  currentMode,
  getColumnWidth,
  handleColumnResize,
  handleColumnNameChange,
  handleColumnTypeChange,
  handleHeaderClick,
  handleHeaderPaste,
  handleColumnReorder,
  handleDeleteColumn,
}) => {
  const { resizingColumn, handleResizeStart } = useColumnResize({
    handleColumnResize,
    getColumnWidth,
  });

  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, colIndex: number) => {
    setDraggedColumn(colIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnter = (e: React.DragEvent, colIndex: number) => {
    e.preventDefault();
    if (colIndex !== draggedColumn) {
      setDragOverColumn(colIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest('th')) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colIndex: number) => {
    e.preventDefault();
    if (draggedColumn !== null && draggedColumn !== colIndex) {
      handleColumnReorder(draggedColumn, colIndex);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
  };

  return (
    <thead>
      <tr>
        {/* Row numbers header */}
        <th className="row-number-header"></th>
        {columnSchema.map((col, colIndex) => (
          <th 
            key={col.key} 
            className={`col-header ${dragOverColumn === colIndex ? 'drag-over' : ''} ${draggedColumn === colIndex ? 'dragging' : ''}`}
            style={{ width: getColumnWidth(col.key) }}
            data-column={col.key}
            onDragEnter={(e) => handleDragEnter(e, colIndex)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, colIndex)}
            onMouseEnter={() => setHoveredColumn(colIndex)}
            onMouseLeave={() => setHoveredColumn(null)}
          >
            <div 
              className="col-drag-handle"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, colIndex)}
              onDragEnd={handleDragEnd}
            />
            {currentMode === 'delete' && hoveredColumn === colIndex && (
              <button
                className="delete-column-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteColumn(colIndex);
                }}
                title="Delete column"
              >
                ❌ Column
              </button>
            )}
            <div 
              className="cell-container"
              onClick={(e) => handleHeaderClick(colIndex, e)}
            >
              <div className="header-content-inner">
                <EditableHeader
                  value={col.label}
                  onChange={(newName) => handleColumnNameChange(colIndex, newName)}
                  onPasteHeaders={(cells) => handleHeaderPaste(colIndex, cells)}
                  isEditing={selectedHeader === colIndex && currentMode === 'edit'}
                  onEditStart={() => {}}
                  onEditEnd={() => handleHeaderClick(colIndex, {} as React.MouseEvent)}
                  dataHeaderIndex={colIndex}
                />
                {currentMode !== 'edit' && currentMode !== 'delete' && (
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
                )}
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