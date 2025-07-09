import { useState, useRef } from "react";
import "./App.css";
import { initialColumnSchema } from "./schema";
import { initialRows, type RowData } from "./data";
import EditableCell from "./EditableCell";

function App() {
  const [rows, setRows] = useState<RowData[]>(initialRows);
  const [columnSchema, setColumnSchema] = useState(initialColumnSchema);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<number | null>(null);
  const cellRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const getColumnWidth = (columnKey: string) => {
    return columnWidths[columnKey] || 150; // Default width
  };

  const handleColumnResize = (columnKey: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [columnKey]: Math.max(80, Math.min(300, newWidth)) // Min 80px, Max 300px
    }));
  };

  const handleColumnNameChange = (colIndex: number, newName: string) => {
    setColumnSchema((cols) => {
      const updated = [...cols];
      updated[colIndex] = { ...updated[colIndex], label: newName };
      return updated;
    });
  };

  const handleMultiPaste = (startRow: number, startCol: number, cells: string[][]) => {
    const updatedRows = [...rows];

    for (let r = 0; r < cells.length; r++) {
      const rowIdx = startRow + r;
      if (rowIdx >= updatedRows.length) break;

      for (let c = 0; c < cells[r].length; c++) {
        const colIdx = startCol + c;
        if (colIdx >= columnSchema.length) break;

        const colKey = columnSchema[colIdx].key;
        updatedRows[rowIdx][colKey] = cells[r][c];
      }
    }

    setRows(updatedRows);
  };

  const onCellChange = (rowIndex: number, columnKey: string, newValue: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnKey] = newValue;
    setRows(updatedRows);
  };

  const navigateToCell = (row: number, col: number, shouldEdit: boolean = false) => {
    if (row >= 0 && row < rows.length && col >= 0 && col < columnSchema.length) {
      setSelectedCell({ row, col });
      setSelectedHeader(null);
      setIsEditing(shouldEdit);
      
      if (shouldEdit) {
        const cellKey = `${row}-${col}`;
        const cellElement = cellRefs.current[cellKey];
        if (cellElement) {
          setTimeout(() => {
            cellElement.click();
          }, 0);
        }
      }
    }
  };

  const navigateToHeader = (col: number) => {
    if (col >= 0 && col < columnSchema.length) {
      setSelectedCell(null);
      setSelectedHeader(col);
      setIsEditing(false);
      
      // Focus the header input after navigation
      setTimeout(() => {
        const headerInput = document.querySelector(`[data-header-index="${col}"]`) as HTMLInputElement;
        if (headerInput) {
          headerInput.focus();
          headerInput.select();
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const hasSelection = selectedCell || selectedHeader !== null;
    if (!hasSelection) return;

    const { row, col } = selectedCell || { row: -1, col: -1 };

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (selectedHeader !== null) {
          // Move to last row of the same column
          navigateToCell(rows.length - 1, selectedHeader, false);
        } else {
          navigateToCell(row - 1, col, isEditing);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (selectedHeader !== null) {
          // Move to first row of the same column
          navigateToCell(0, selectedHeader, true);
        } else {
          navigateToCell(row + 1, col, isEditing);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (selectedHeader !== null) {
          navigateToHeader(selectedHeader - 1);
        } else {
          navigateToCell(row, col - 1, isEditing);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (selectedHeader !== null) {
          navigateToHeader(selectedHeader + 1);
        } else {
          navigateToCell(row, col + 1, isEditing);
        }
        break;
      case "Tab":
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
      case "Enter":
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
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setSelectedHeader(null);
    setIsEditing(true);
  };

  const handleHeaderClick = (colIndex: number, event: React.MouseEvent) => {
    // Don't handle clicks on the dropdown
    if ((event.target as HTMLElement).closest('.col-type-select')) {
      return;
    }
    
    setSelectedCell(null);
    setSelectedHeader(colIndex);
    setIsEditing(false);
    
    // Focus the header input when clicking
    setTimeout(() => {
      const headerInput = document.querySelector(`[data-header-index="${colIndex}"]`) as HTMLInputElement;
      if (headerInput) {
        headerInput.focus();
        headerInput.select();
      }
    }, 0);
  };

  return (
    <div className="app-container" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1>Spreadsheet App</h1>

      <table className="table-wrapper" border={1} cellPadding={8} cellSpacing={0}>
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
                <div
                  className="header-label-container"
                >
                  <input
                    type="text"
                    value={col.label}
                    onChange={(e) => handleColumnNameChange(colIndex, e.target.value)}
                    className="header-input"
                    onFocus={() => setSelectedHeader(colIndex)}
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
                    setColumnSchema((cols) => {
                      const updated = [...cols];
                      updated[colIndex] = { ...updated[colIndex], type: newType };
                      return updated;
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
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
                        columnType={col.type as "string" | "number" | "date"}
                        onChange={(newVal) => onCellChange(rowIndex, col.key, newVal)}
                        onPasteCells={(cells) => handleMultiPaste(rowIndex, colIndex, cells)}
                        isEditing={isEditing && selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                        onEditStart={() => setIsEditing(true)}
                        onEditEnd={() => setIsEditing(false)}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
