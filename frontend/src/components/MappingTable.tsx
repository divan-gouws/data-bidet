import React from 'react';
import type { ColumnDefinition } from '../types';

interface MappingTableProps {
  sourceColumns: ColumnDefinition[];
  destinationColumns: ColumnDefinition[];
  columnMappings: { [destColumnKey: string]: string };
  handleColumnMapping: (destColumnKey: string, sourceColumnKey: string) => void;
  clearColumnMapping: (destColumnKey: string) => void;
  getMappingValidation: () => {
    isValid: boolean;
    unmappedColumns: ColumnDefinition[];
    totalDestColumns: number;
    requiredColumns: number;
    mappedColumns: number;
  };
}

export const MappingTable: React.FC<MappingTableProps> = ({
  sourceColumns,
  destinationColumns,
  columnMappings,
  handleColumnMapping,
  clearColumnMapping,
  getMappingValidation,
}) => {
  const validation = getMappingValidation();

  return (
    <div className="mapping-container">
      <h2 className="mapping-title">Column Mapping</h2>
      <p className="mapping-description">
        Map each destination column to a source column from your data table.
      </p>
      
      {/* Mapping Status */}
      <div className={`mapping-status ${validation.isValid ? 'valid' : 'invalid'}`}>
        <div className="mapping-status-text">
          {validation.isValid ? (
            <>✅ All required destination columns are mapped ({validation.mappedColumns}/{validation.requiredColumns} required, {validation.totalDestColumns} total)</>
          ) : (
            <>⚠️ {validation.unmappedColumns.length} required destination column(s) need mapping ({validation.mappedColumns}/{validation.requiredColumns} required, {validation.totalDestColumns} total)</>
          )}
        </div>
        {!validation.isValid && (
          <div className="unmapped-columns">
            Unmapped required columns: {validation.unmappedColumns.map(col => col.label).join(', ')}
          </div>
        )}
      </div>

      <div className="mapping-table-wrapper">
        <table className="mapping-table">
          <thead>
            <tr>
              <th className="mapping-header">Destination Column</th>
              <th className="mapping-header">Type</th>
              <th className="mapping-header">Required</th>
              <th className="mapping-header">Source Column</th>
              <th className="mapping-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinationColumns.map((destColumn) => {
              const mappedSourceKey = columnMappings[destColumn.key];
              const isMapped = !!mappedSourceKey;
              const isRequired = !destColumn.optional;
              
              return (
                <tr key={destColumn.key} className={`mapping-row ${!isMapped && isRequired ? 'unmapped' : ''} ${!isRequired ? 'optional' : ''}`}>
                  <td className="mapping-cell">
                    <span className="destination-column-name">{destColumn.label}</span>
                  </td>
                  <td className="mapping-cell">
                    <span className="column-type">{destColumn.type}</span>
                  </td>
                  <td className="mapping-cell">
                    <span className={`required-status ${isRequired ? 'required' : 'optional'}`}>
                      {isRequired ? '✅ Required' : '⚪ Optional'}
                    </span>
                  </td>
                  <td className="mapping-cell">
                    <select
                      value={mappedSourceKey || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          handleColumnMapping(destColumn.key, value);
                        } else {
                          clearColumnMapping(destColumn.key);
                        }
                      }}
                      className="mapping-select"
                    >
                      <option value="">-- Select Source Column --</option>
                      {sourceColumns.map((sourceColumn) => (
                        <option key={sourceColumn.key} value={sourceColumn.key}>
                          {sourceColumn.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="mapping-cell">
                    {isMapped && (
                      <button
                        onClick={() => clearColumnMapping(destColumn.key)}
                        className="mapping-clear-button"
                        title="Clear mapping"
                      >
                        ✖️
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Source Columns Info */}
      <div className="source-columns-info">
        <h3>Available Source Columns:</h3>
        <div className="source-columns-list">
          {sourceColumns.map((sourceColumn) => (
            <span key={sourceColumn.key} className="source-column-tag">
              {sourceColumn.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}; 