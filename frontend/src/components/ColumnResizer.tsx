import React from 'react';

interface ColumnResizerProps {
  columnKey: string;
  resizingColumn: string | null;
  onResizeStart: (e: React.MouseEvent, columnKey: string) => void;
}

export const ColumnResizer: React.FC<ColumnResizerProps> = ({
  columnKey,
  resizingColumn,
  onResizeStart,
}) => {
  return (
    <div 
      className={`column-resizer ${resizingColumn === columnKey ? 'resizing' : ''}`}
      onMouseDown={(e) => onResizeStart(e, columnKey)}
      title="Drag to resize column"
      style={{
        position: 'absolute',
        top: 0,
        right: -3,
        width: 6,
        height: '100%',
        cursor: 'col-resize',
        zIndex: 10,
        backgroundColor: 'transparent',
        transition: 'background-color 0.2s ease',
      }}
    />
  );
}; 