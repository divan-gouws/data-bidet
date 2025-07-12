
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
    setSelectedCell,
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
    setSelectedHeader(null);
    setIsEditing(false);
  };

  // Handler for mode changes
  const handleModeChange = (mode: SpreadsheetMode) => {
    setCurrentMode(mode);
    // Clear selections when changing modes
    setSelectedCell(null);
    setSelectedHeader(null);
    setIsEditing(false);
  };

  // Modified cell click handler based on mode
  const handleCellClickWithMode = (rowIndex: number, colIndex: number) => {
    if (currentMode === 'delete') {
      // TODO: Implement delete functionality
      console.log(`Delete cell at row ${rowIndex}, col ${colIndex}`);
    } else if (currentMode === 'edit') {
      handleCellClick(rowIndex, colIndex);
    }
    // In view mode, we don't do anything on click
  };

  return (
    <div className="app-container" onKeyDown={handleKeyDown} tabIndex={0}>
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
        onCellChange={onCellChange}
        handleMultiPaste={handleMultiPaste}
        handleEditStart={handleEditStart}
        handleEditEnd={handleEditEnd}
        handleColumnReorder={handleColumnReorder}
        handleAddColumn={handleAddColumn}
        handleAddRow={handleAddRow}
        cellRefs={cellRefs}
      />
    </div>
  );
}

export default App;
