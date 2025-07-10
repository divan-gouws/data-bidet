
import "./App.css";
import { SpreadsheetTable } from "./components/SpreadsheetTable";
import { SpreadsheetTitle } from "./components/SpreadsheetTitle";
import { useSpreadsheet } from "./hooks/useSpreadsheet";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";

function App() {
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

  return (
    <div className="app-container" onKeyDown={handleKeyDown} tabIndex={0}>
      <SpreadsheetTitle 
        title={title}
        onTitleChange={handleTitleChange}
        onFocusTitle={handleFocusTitle}
      />
      
      <SpreadsheetTable
        rows={rows}
        columnSchema={columnSchema}
        selectedCell={selectedCell}
        selectedHeader={selectedHeader}
        isEditing={isEditing}
        getColumnWidth={getColumnWidth}
        getTotalTableWidth={getTotalTableWidth}
        handleColumnResize={handleColumnResize}
        handleColumnNameChange={handleColumnNameChange}
        handleColumnTypeChange={handleColumnTypeChange}
        handleHeaderClick={handleHeaderClick}
        handleHeaderPaste={handleHeaderPaste}
        handleCellClick={handleCellClick}
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
