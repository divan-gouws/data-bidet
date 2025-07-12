import React from 'react';

export type SpreadsheetMode = 'edit' | 'delete' | 'view';

interface SpreadsheetToolbarProps {
  currentMode: SpreadsheetMode;
  onModeChange: (mode: SpreadsheetMode) => void;
}

export const SpreadsheetToolbar: React.FC<SpreadsheetToolbarProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="spreadsheet-toolbar">
      <div className="toolbar-group">
        <button
          className={`toolbar-button ${currentMode === 'view' ? 'active' : ''}`}
          onClick={() => onModeChange('view')}
          title="View Mode"
        >
          👁️ View
        </button>
        <button
          className={`toolbar-button ${currentMode === 'edit' ? 'active' : ''}`}
          onClick={() => onModeChange('edit')}
          title="Edit Mode"
        >
          ✏️ Edit
        </button>
        <button
          className={`toolbar-button ${currentMode === 'delete' ? 'active' : ''}`}
          onClick={() => onModeChange('delete')}
          title="Delete Mode"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}; 