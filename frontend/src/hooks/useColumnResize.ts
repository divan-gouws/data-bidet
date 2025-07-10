import { useState, useCallback, useEffect } from 'react';

interface UseColumnResizeProps {
  handleColumnResize: (columnKey: string, newWidth: number) => void;
  getColumnWidth: (columnKey: string) => number;
}

export const useColumnResize = ({ handleColumnResize, getColumnWidth }: UseColumnResizeProps) => {
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  // Apply/remove highlighting class to all cells in the column
  useEffect(() => {
    if (resizingColumn) {
      // Add highlighting class to all cells in the column
      const cells = document.querySelectorAll(`[data-column="${resizingColumn}"]`);
      cells.forEach(cell => cell.classList.add('column-resizing'));
      
      return () => {
        // Remove highlighting class when resizing ends
        cells.forEach(cell => cell.classList.remove('column-resizing'));
      };
    }
  }, [resizingColumn]);

  const handleResizeStart = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnKey);

    const startX = e.clientX;
    const startWidth = getColumnWidth(columnKey);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = startWidth + deltaX;
      handleColumnResize(columnKey, newWidth);
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleColumnResize, getColumnWidth]);

  return {
    resizingColumn,
    handleResizeStart,
  };
}; 