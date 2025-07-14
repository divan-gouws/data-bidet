
import "./App.css";
import { SpreadsheetTable } from "./components/SpreadsheetTable";
import { ConfigurationTable } from "./components/ConfigurationTable";
import { MappingTable } from "./components/MappingTable";
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
    configColumns,
    columnMappings,
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
    handleConfigColumnNameChange,
    handleConfigColumnTypeChange,
    handleConfigColumnOptionalChange,
    handleAddConfigColumn,
    handleDeleteConfigColumn,
    handleColumnMapping,
    clearColumnMapping,
    getMappingValidation,
    handleValidationConstraintChange,
    getValidationErrorsForCell,
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

  // Debug logging
  console.log('App rendering with:', {
    currentMode,
    title,
    rows: rows?.length,
    columnSchema: columnSchema?.length,
    configColumns: configColumns?.length
  });

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
      
      {currentMode === 'configure' ? (
        <ConfigurationTable
          configColumns={configColumns}
          handleConfigColumnNameChange={handleConfigColumnNameChange}
          handleConfigColumnTypeChange={handleConfigColumnTypeChange}
          handleConfigColumnOptionalChange={handleConfigColumnOptionalChange}
          handleValidationConstraintChange={handleValidationConstraintChange}
          handleAddConfigColumn={handleAddConfigColumn}
          handleDeleteConfigColumn={handleDeleteConfigColumn}
        />
      ) : currentMode === 'map' ? (
        <MappingTable
          sourceColumns={columnSchema}
          destinationColumns={configColumns}
          columnMappings={columnMappings}
          handleColumnMapping={handleColumnMapping}
          clearColumnMapping={clearColumnMapping}
          getMappingValidation={getMappingValidation}
        />
      ) : (
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
          getValidationErrorsForCell={getValidationErrorsForCell}
          columnMappings={columnMappings}
          configColumns={configColumns}  // Pass configColumns to SpreadsheetTable
        />
      )}
    </div>
  );
}

export default App;
