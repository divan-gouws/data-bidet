import React, { useState, useCallback } from 'react';
import type { ColumnDefinition } from '../types';

interface PicklistEditorProps {
  column: ColumnDefinition;
  onClose: () => void;
  onSave: (values: string[]) => void;
  isOpen: boolean;
}

export const PicklistEditor: React.FC<PicklistEditorProps> = ({
  column,
  onClose,
  onSave,
  isOpen
}) => {
  // State for picklist values
  const [values, setValues] = useState<string[]>(
    column.validation?.picklistValues || []
  );
  const [editingValue, setEditingValue] = useState<string>('');

  // Handle pasting values
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedRows = pastedText.split(/\r?\n/).filter(row => row.trim() !== '');
    setValues(prev => [...new Set([...prev, ...pastedRows])]);
  }, []);

  // Handle adding a new value
  const handleAddValue = useCallback(() => {
    if (editingValue.trim()) {
      setValues(prev => [...new Set([...prev, editingValue.trim()])]);
      setEditingValue('');
    }
  }, [editingValue]);

  // Handle removing a value
  const handleRemoveValue = useCallback((index: number) => {
    setValues(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle saving changes
  const handleSave = useCallback(() => {
    onSave(values);
    onClose();
  }, [values, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="picklist-editor-overlay">
      <div className="picklist-editor-modal">
        <div className="picklist-editor-header">
          <h2>Edit Picklist Values for {column.label}</h2>
          <button onClick={onClose} className="close-button">✖</button>
        </div>
        
        <div className="picklist-editor-content">
          <div className="picklist-input-row">
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddValue();
                }
              }}
              placeholder="Enter a new value"
              className="picklist-value-input"
            />
            <button onClick={handleAddValue} className="add-value-button">
              Add Value
            </button>
          </div>

          <div className="picklist-values-container" onPaste={handlePaste}>
            {values.map((value, index) => (
              <div key={index} className="picklist-value-row">
                <span>{value}</span>
                <button
                  onClick={() => handleRemoveValue(index)}
                  className="remove-value-button"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>

          <div className="paste-instructions">
            Tip: You can paste values from Excel directly into this area
          </div>
        </div>

        <div className="picklist-editor-footer">
          <button onClick={handleSave} className="save-button">
            Save Changes
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 