import { useCallback } from 'react';
import type { CellPosition } from '../types';
import { KEYBOARD_KEYS } from '../constants';

import type { RowData, ColumnDefinition } from '../types';

interface UseKeyboardNavigationProps {
  rows: RowData[];
  columnSchema: ColumnDefinition[];
  selectedCell: CellPosition | null;
  selectedHeader: number | null;
  isEditing: boolean;
  navigateToCell: (row: number, col: number, shouldEdit: boolean) => void;
  navigateToHeader: (col: number) => void;
  setIsEditing: (editing: boolean) => void;
  onCellChange: (rowIndex: number, columnKey: string, newValue: string) => void;
  cellRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

export const useKeyboardNavigation = ({
  rows,
  columnSchema,
  selectedCell,
  selectedHeader,
  isEditing,
  navigateToCell,
  navigateToHeader,
  setIsEditing,
  onCellChange,
  cellRefs,
}: UseKeyboardNavigationProps) => {
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const hasSelection = selectedCell || selectedHeader !== null;
    if (!hasSelection) return;

    const { row, col } = selectedCell || { row: -1, col: -1 };

    switch (e.key) {
      case KEYBOARD_KEYS.ARROW_UP:
        e.preventDefault();
        if (selectedHeader !== null) {
          // Move to last row of the same column
          navigateToCell(rows.length - 1, selectedHeader, false);
        } else {
          navigateToCell(row - 1, col, isEditing);
        }
        break;
        
      case KEYBOARD_KEYS.ARROW_DOWN:
        e.preventDefault();
        if (selectedHeader !== null) {
          // Move to first row of the same column
          navigateToCell(0, selectedHeader, true);
        } else {
          navigateToCell(row + 1, col, isEditing);
        }
        break;
        
      case KEYBOARD_KEYS.ARROW_LEFT:
        e.preventDefault();
        if (selectedHeader !== null) {
          navigateToHeader(selectedHeader - 1);
        } else {
          navigateToCell(row, col - 1, isEditing);
        }
        break;
        
      case KEYBOARD_KEYS.ARROW_RIGHT:
        e.preventDefault();
        if (selectedHeader !== null) {
          navigateToHeader(selectedHeader + 1);
        } else {
          navigateToCell(row, col + 1, isEditing);
        }
        break;
        
      case KEYBOARD_KEYS.TAB:
        e.preventDefault();
        if (selectedHeader !== null) {
          // Move to next header or first data cell
          if (selectedHeader + 1 < columnSchema.length) {
            navigateToHeader(selectedHeader + 1);
          } else {
            // Move to first data cell
            navigateToCell(0, 0, true);
          }
        } else if (isEditing) {
          // Exit edit mode and move to next cell
          setIsEditing(false);
          if (col + 1 < columnSchema.length) {
            navigateToCell(row, col + 1, true);
          } else if (row + 1 < rows.length) {
            // Wrap to next row
            navigateToCell(row + 1, 0, true);
          } else {
            // Wrap to first cell
            navigateToCell(0, 0, true);
          }
        } else {
          // Enter edit mode in current cell
          setIsEditing(true);
        }
        break;
        
      case KEYBOARD_KEYS.ENTER:
        e.preventDefault();
        if (selectedHeader !== null) {
          // Move to first data cell of this column
          navigateToCell(0, selectedHeader, true);
        } else if (isEditing) {
          // Exit edit mode and move to cell below
          setIsEditing(false);
          if (row + 1 < rows.length) {
            navigateToCell(row + 1, col, true);
          } else {
            // Wrap to first row
            navigateToCell(0, col, true);
          }
        } else {
          // Enter edit mode in current cell
          setIsEditing(true);
        }
        break;
        
      default:
        // If typing a printable character and not editing, start editing
        if (!isEditing && selectedHeader === null && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setIsEditing(true);
          // Store the key to be typed after entering edit mode
          setTimeout(() => {
            const cellKey = `${row}-${col}`;
            const cellElement = cellRefs.current[cellKey];
            if (cellElement) {
              const input = cellElement.querySelector('input') as HTMLInputElement;
              if (input) {
                input.focus();
                input.value = e.key;
                input.setSelectionRange(1, 1);
                onCellChange(row, columnSchema[col].key, e.key);
              }
            }
          }, 0);
        }
        break;
    }
  }, [
    selectedCell,
    selectedHeader,
    isEditing,
    rows.length,
    columnSchema,
    navigateToCell,
    navigateToHeader,
    setIsEditing,
    onCellChange,
    cellRefs,
  ]);

  return { handleKeyDown };
}; 