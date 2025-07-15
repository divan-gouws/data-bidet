import React, { useState } from 'react';
import type { ColumnDefinition, ValidationConstraints } from '../types';
import { COLUMN_TYPES } from '../constants';
import { PicklistEditor } from './PicklistEditor';

interface ConfigurationTableProps {
  configColumns: ColumnDefinition[];
  handleConfigColumnNameChange: (colIndex: number, newName: string) => void;
  handleConfigColumnTypeChange: (colIndex: number, newType: 'string' | 'number' | 'date' | 'picklist') => void;
  handleConfigColumnOptionalChange: (colIndex: number, isOptional: boolean) => void;
  handleValidationConstraintChange: (colIndex: number, constraints: ValidationConstraints) => void;
  handleAddConfigColumn: () => void;
  handleDeleteConfigColumn: (colIndex: number) => void;
}

export const ConfigurationTable: React.FC<ConfigurationTableProps> = ({
  configColumns,
  handleConfigColumnNameChange,
  handleConfigColumnTypeChange,
  handleConfigColumnOptionalChange,
  handleValidationConstraintChange,
  handleAddConfigColumn,
  handleDeleteConfigColumn,
}) => {
  const [editingPicklist, setEditingPicklist] = useState<number | null>(null);

  const handlePicklistSave = (colIndex: number, values: string[]) => {
    handleValidationConstraintChange(colIndex, { picklistValues: values });
  };

  return (
    <div className="configuration-container">
      <h2 className="configuration-title">Column Configuration</h2>
      
      <div className="configuration-table-wrapper">
        <table className="configuration-table">
          <thead>
            <tr>
              <th className="config-header">Column Name</th>
              <th className="config-header">Type</th>
              <th className="config-header">Optional</th>
              <th className="config-header">Validation</th>
              <th className="config-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configColumns.map((column, index) => (
              <tr key={column.key} className="config-row">
                <td className="config-cell">
                  <input
                    type="text"
                    value={column.label}
                    onChange={(e) => handleConfigColumnNameChange(index, e.target.value)}
                    className="config-input"
                    placeholder="Column Name"
                  />
                </td>
                <td className="config-cell">
                  <select
                    value={column.type}
                    onChange={(e) => handleConfigColumnTypeChange(index, e.target.value as 'string' | 'number' | 'date' | 'picklist')}
                    className="config-select"
                  >
                    <option value={COLUMN_TYPES.STRING}>String</option>
                    <option value={COLUMN_TYPES.NUMBER}>Number</option>
                    <option value={COLUMN_TYPES.DATE}>Date</option>
                    <option value={COLUMN_TYPES.PICKLIST}>Picklist</option>
                  </select>
                </td>
                <td className="config-cell">
                  <input
                    type="checkbox"
                    checked={column.optional || false}
                    onChange={(e) => handleConfigColumnOptionalChange(index, e.target.checked)}
                    className="config-checkbox"
                  />
                </td>
                <td className="config-cell">
                  <div className="validation-controls">
                    <label className="validation-label">
                      <input
                        type="checkbox"
                        checked={column.validation?.nullable === false}
                        onChange={(e) => handleValidationConstraintChange(index, { nullable: !e.target.checked })}
                        className="validation-checkbox"
                      />
                      <span className="validation-text">Required</span>
                    </label>
                    
                    <label className="validation-label">
                      <input
                        type="checkbox"
                        checked={column.validation?.unique || false}
                        onChange={(e) => handleValidationConstraintChange(index, { unique: e.target.checked })}
                        className="validation-checkbox"
                      />
                      <span className="validation-text">Unique</span>
                    </label>

                    {column.type === 'string' && (
                      <div className="validation-string-controls">
                        <input
                          type="number"
                          placeholder="Min Length"
                          value={column.validation?.minLength || ''}
                          onChange={(e) => handleValidationConstraintChange(index, { 
                            minLength: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          className="validation-input"
                          min="0"
                        />
                        <input
                          type="number"
                          placeholder="Max Length"
                          value={column.validation?.maxLength || ''}
                          onChange={(e) => handleValidationConstraintChange(index, { 
                            maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          className="validation-input"
                          min="0"
                        />
                        <input
                          type="text"
                          placeholder="Pattern (regex)"
                          value={column.validation?.pattern || ''}
                          onChange={(e) => handleValidationConstraintChange(index, { 
                            pattern: e.target.value || undefined 
                          })}
                          className="validation-input"
                        />
                      </div>
                    )}

                    {column.type === 'number' && (
                      <div className="validation-number-controls">
                        <input
                          type="number"
                          placeholder="Min Value"
                          value={column.validation?.min || ''}
                          onChange={(e) => handleValidationConstraintChange(index, { 
                            min: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          className="validation-input"
                        />
                        <input
                          type="number"
                          placeholder="Max Value"
                          value={column.validation?.max || ''}
                          onChange={(e) => handleValidationConstraintChange(index, { 
                            max: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          className="validation-input"
                        />
                      </div>
                    )}

                    {column.type === 'date' && (
                      <div className="validation-date-controls">
                        <input
                          type="text"
                          placeholder="Date Format (e.g., yyyy/MM/dd)"
                          value={column.validation?.dateFormat || ''}
                          onChange={(e) => handleValidationConstraintChange(index, { 
                            dateFormat: e.target.value || undefined 
                          })}
                          className="validation-input"
                        />
                        <div className="validation-date-format-help">
                          Format tokens: yyyy (year), MM (month), dd (day)
                        </div>
                      </div>
                    )}

                    {column.type === 'picklist' && (
                      <div className="validation-picklist-controls">
                        <button
                          onClick={() => setEditingPicklist(index)}
                          className="edit-picklist-button"
                        >
                          Edit Picklist Values ({column.validation?.picklistValues?.length || 0} values)
                        </button>
                        <label className="validation-label">
                          <input
                            type="checkbox"
                            checked={column.validation?.caseSensitive || false}
                            onChange={(e) => handleValidationConstraintChange(index, { 
                              caseSensitive: e.target.checked 
                            })}
                            className="validation-checkbox"
                          />
                          <span className="validation-text">Case Sensitive</span>
                        </label>
                      </div>
                    )}
                  </div>
                </td>
                <td className="config-cell">
                  <button
                    onClick={() => handleDeleteConfigColumn(index)}
                    className="config-delete-button"
                    title="Delete column"
                    disabled={configColumns.length <= 1}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button
        onClick={handleAddConfigColumn}
        className="config-add-button"
        title="Add new column"
      >
        ➕ Add Column
      </button>

      {editingPicklist !== null && (
        <PicklistEditor
          column={configColumns[editingPicklist]}
          onClose={() => setEditingPicklist(null)}
          onSave={(values) => {
            handlePicklistSave(editingPicklist, values);
            setEditingPicklist(null);
          }}
          isOpen={true}
        />
      )}
    </div>
  );
}; 