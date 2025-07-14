import React from 'react';

export type SpreadsheetMode = 'new' | 'open' | 'save' | 'configure' | 'map' | 'edit' | 'delete';

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
          className={`toolbar-button ${currentMode === 'new' ? 'active' : ''}`}
          onClick={() => onModeChange('new')}
          title="New Mode"
        >
          📄 New
        </button>
        <button
          className={`toolbar-button ${currentMode === 'open' ? 'active' : ''}`}
          onClick={() => onModeChange('open')}
          title="Open Mode"
        >
          📂 Open
        </button>
        <button
          className={`toolbar-button ${currentMode === 'save' ? 'active' : ''}`}
          onClick={() => onModeChange('save')}
          title="Save Mode"
        >
          💾 Save
        </button>
        <button
          className={`toolbar-button ${currentMode === 'configure' ? 'active' : ''}`}
          onClick={() => onModeChange('configure')}
          title="Configure Mode"
        >
          ⚙️ Configure
        </button>
        <button
          className={`toolbar-button ${currentMode === 'map' ? 'active' : ''}`}
          onClick={() => onModeChange('map')}
          title="Map Mode"
        >
          🗺️ Map
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