import React from "react";
import "./App.css";
import { SpreadsheetTable } from "./components/SpreadsheetTable";
import { useSpreadsheet } from "./hooks/useSpreadsheet";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";

function App() {
  const {
    rows,
    columnSchema,
    selectedCell,
    selectedHeader,
    isEditing,
    cellRefs,
    getColumnWidth,
    handleColumnResize,
    handleColumnNameChange,
    handleColumnTypeChange,
    handleMultiPaste,
    onCellChange,
    navigateToCell,
    navigateToHeader,
    handleCellClick,
    handleHeaderClick,
    handleEditStart,
    handleEditEnd,
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

  return (
    <div className="app-container" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1>Spreadsheet App</h1>
      
      <SpreadsheetTable
        rows={rows}
        columnSchema={columnSchema}
        selectedCell={selectedCell}
        selectedHeader={selectedHeader}
        isEditing={isEditing}
        getColumnWidth={getColumnWidth}
        handleColumnResize={handleColumnResize}
        handleColumnNameChange={handleColumnNameChange}
        handleColumnTypeChange={handleColumnTypeChange}
        handleHeaderClick={handleHeaderClick}
        handleCellClick={handleCellClick}
        onCellChange={onCellChange}
        handleMultiPaste={handleMultiPaste}
        handleEditStart={handleEditStart}
        handleEditEnd={handleEditEnd}
        navigateToCell={navigateToCell}
        cellRefs={cellRefs}
      />
    </div>
  );
}

export default App;
