
import "./App.css";
import { SpreadsheetTable } from "./components/SpreadsheetTable";
import { SpreadsheetTitle } from "./components/SpreadsheetTitle";
import { SpreadsheetToolbar } from "./components/SpreadsheetToolbar";
import type { SpreadsheetMode } from "./components/SpreadsheetToolbar";
import { useSpreadsheet } from "./hooks/useSpreadsheet";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { useState } from "react";

function App() {
  const [currentMode, setCurrentMode] = useState<SpreadsheetMode>('edit');
  
  const {
    rows,
    columnSchema,
    selectedCell,
    selectedCells,
    isSelecting,
    selectionStart,
    selectedHeader,
    isEditing,
    title,
    cellRefs,
    getColumnWidth,
    getTotalTableWidth,
    handleColumnResize,
    handleTitleChange,
    handleColumnNameChange,
    handleColumnTypeChange,
    handleMultiPaste,
    handleHeaderPaste,
    onCellChange,
    navigateToCell,
    navigateToHeader,
    handleCellClick,
    handleHeaderClick,
    handleEditStart,
    handleEditEnd,
    handleColumnReorder,
    handleAddColumn,
    handleAddRow,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    clearSelectedCells,
    cancelSelection,
    clearSelectedRange,
    handleDeleteColumn,
    setSelectedCell,
    setSelectedCells,
    setSelectedHeader,
    setIsEditing,
  } = useSpreadsheet();

  const { handleKeyDown } = useKeyboardNavigation({
    rows,
    columnSchema,
    selectedCell,
    selectedHeader,
    isEditing,
    navigateToCell,
    navigateToHeader,
    setIsEditing: (editing: boolean) => {
      if (editing) {
        handleEditStart();
      } else {
        handleEditEnd();
      }
    },
    onCellChange,
    cellRefs,
  });

  // Handler to clear cell selection/editing when focusing the title
  const handleFocusTitle = () => {
    setSelectedCell(null);
    setSelectedCells([]);
    setSelectedHeader(null);
    setIsEditing(false);
    cancelSelection();
  };

  // Handler for mode changes
  const handleModeChange = (mode: SpreadsheetMode) => {
    setCurrentMode(mode);
    // Clear selections when changing modes
    setSelectedCell(null);
    setSelectedCells([]);
    setSelectedHeader(null);
    setIsEditing(false);
    cancelSelection();
  };

  // Modified cell click handler based on mode
  const handleCellClickWithMode = (rowIndex: number, colIndex: number) => {
    if (currentMode === 'delete') {
      handleMouseDown(rowIndex, colIndex);
    } else if (currentMode === 'edit') {
      handleCellClick(rowIndex, colIndex);
    }
    // In view mode, we don't do anything on click
  };

  // Enhanced keyboard handler for delete mode
  const handleKeyDownWithDelete = (e: React.KeyboardEvent) => {
    if (currentMode === 'delete') {
      if (e.key === 'Delete' && selectedCells.length > 0) {
        e.preventDefault();
        clearSelectedCells();
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelSelection();
        return;
      }
    }
    handleKeyDown(e);
  };

  // Mouse up handler for multi-cell selection
  const handleGlobalMouseUp = () => {
    if (currentMode === 'delete') {
      handleMouseUp();
    }
  };

  return (
    <div className="app-container" onKeyDown={handleKeyDownWithDelete} tabIndex={0} onMouseUp={handleGlobalMouseUp}>
      <SpreadsheetTitle 
        title={title}
        onTitleChange={handleTitleChange}
        onFocusTitle={handleFocusTitle}
      />
      
      <SpreadsheetToolbar
        currentMode={currentMode}
        onModeChange={handleModeChange}
      />
      
      <SpreadsheetTable
        rows={rows}
        columnSchema={columnSchema}
        selectedCell={selectedCell}
        selectedCells={selectedCells}
        isSelecting={isSelecting}
        selectionStart={selectionStart}
        currentMode={currentMode}
        selectedHeader={selectedHeader}
        isEditing={isEditing && currentMode === 'edit'}
        getColumnWidth={getColumnWidth}
        getTotalTableWidth={getTotalTableWidth}
        handleColumnResize={handleColumnResize}
        handleColumnNameChange={handleColumnNameChange}
        handleColumnTypeChange={handleColumnTypeChange}
        handleHeaderClick={handleHeaderClick}
        handleHeaderPaste={handleHeaderPaste}
        handleCellClick={handleCellClickWithMode}
        handleMouseEnter={handleMouseEnter}
        onCellChange={onCellChange}
        handleMultiPaste={handleMultiPaste}
        handleEditStart={handleEditStart}
        handleEditEnd={handleEditEnd}
        handleColumnReorder={handleColumnReorder}
        handleAddColumn={handleAddColumn}
        handleAddRow={handleAddRow}
        handleDeleteColumn={handleDeleteColumn}
        clearSelectedCells={clearSelectedCells}
        cancelSelection={cancelSelection}
        clearSelectedRange={clearSelectedRange}
        cellRefs={cellRefs}
      />
    </div>
  );
}

export default App;
