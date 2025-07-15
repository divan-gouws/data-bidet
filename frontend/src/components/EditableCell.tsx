/**
 * EditableCell Component
 * 
 * A reusable cell component that handles:
 * - Text input for all data types
 * - Date picker for date fields
 * - Validation error display
 * - Copy/paste functionality
 * - Keyboard navigation
 * 
 * @component
 */

import React, { useState, useEffect, useRef } from "react";
import type { ValidationError, ColumnDefinition } from "../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format, isValid } from 'date-fns';

interface EditableCellProps {
  /** Current cell value */
  value: string;
  /** Column definition with type and validation rules */
  column: ColumnDefinition;
  /** Callback when value changes */
  onChange: (newValue: string) => void;
  /** Callback for multi-cell paste operations */
  onPasteCells?: (cells: string[][]) => void;
  /** Whether the cell is in edit mode */
  isEditing?: boolean;
  /** Callback when edit mode starts */
  onEditStart?: () => void;
  /** Callback when edit mode ends */
  onEditEnd?: () => void;
  /** Current validation errors for this cell */
  validationErrors?: ValidationError[];
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  column,
  onChange,
  onPasteCells,
  isEditing = false,
  onEditStart,
  onEditEnd,
  validationErrors = [],
}) => {
  // State
  const [inputValue, setInputValue] = useState(value);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPicklistDropdown, setShowPicklistDropdown] = useState(false);
  const [selectedPicklistIndex, setSelectedPicklistIndex] = useState(-1);
  const [isDatePickerClick, setIsDatePickerClick] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update input value when prop changes or edit mode changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value);
    }
  }, [value, isEditing]);

  // Determine if this cell should show picklist dropdown
  const picklistValues = column.validation?.picklistValues || [];
  const isPicklistCell = column.type === 'picklist' && picklistValues.length > 0;

  // Filter picklist values based on input value
  const filteredPicklistValues = isPicklistCell
    ? picklistValues.filter(option =>
        !inputValue || option.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  // Helper function to safely parse date
  const parseDate = (value: string): Date | null => {
    try {
      const parsedDate = parse(value, column.validation?.dateFormat || 'yyyy/MM/dd', new Date());
      return isValid(parsedDate) ? parsedDate : null;
    } catch {
      return null;
    }
  };

  const updateDropdownPosition = () => {
    if (cellRef.current) {
      const rect = cellRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.bottom + scrollTop,
        left: rect.left + scrollLeft,
        width: rect.width
      });
    }
  };

  // Event Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // For picklist columns, only show dropdown if it's already open
    if (isPicklistCell && isEditing && showPicklistDropdown) {
      setSelectedPicklistIndex(-1);
      updateDropdownPosition();
    }
    
    onChange(newValue);
  };

  const handlePicklistSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
    setShowPicklistDropdown(false);
    setSelectedPicklistIndex(-1);
    if (onEditEnd) {
      onEditEnd();
    }
  };

  const handleDropdownButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isEditing && onEditStart) {
      onEditStart();
    }
    
    if (isPicklistCell) {
      setShowPicklistDropdown(!showPicklistDropdown);
      updateDropdownPosition();
    }
  };

  const handlePicklistKeyDown = (e: React.KeyboardEvent) => {
    if (!showPicklistDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedPicklistIndex(prev => 
          prev < filteredPicklistValues.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedPicklistIndex(prev => 
          prev > 0 ? prev - 1 : filteredPicklistValues.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedPicklistIndex >= 0 && selectedPicklistIndex < filteredPicklistValues.length) {
          handlePicklistSelect(filteredPicklistValues[selectedPicklistIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowPicklistDropdown(false);
        setSelectedPicklistIndex(-1);
        if (onEditEnd) {
          onEditEnd();
        }
        break;
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const dateFormat = column.validation?.dateFormat || 'yyyy/MM/dd';
      const formattedDate = format(date, dateFormat);
      setInputValue(formattedDate);
      onChange(formattedDate);
    }
    setShowDatePicker(false);
    setIsDatePickerClick(false);
  };

  const handleDatePickerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDatePickerClick(true);
    if (!isEditing && onEditStart) {
      onEditStart();
    }
    
    // Calculate position for the date picker
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDatePickerPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
    }
    
    setShowDatePicker(!showDatePicker);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    if (pastedText.includes('\n') || pastedText.includes('\t')) {
      const rows = pastedText.split('\n').map(row => row.split('\t'));
      if (onPasteCells) {
        onPasteCells(rows);
      }
    } else {
      setInputValue(pastedText);
      onChange(pastedText);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't exit edit mode if clicking within the cell, dropdown, or date picker
    if (
      cellRef.current?.contains(e.relatedTarget as Node) ||
      dropdownRef.current?.contains(e.relatedTarget as Node) ||
      document.querySelector('.react-datepicker')?.contains(e.relatedTarget as Node) ||
      isDatePickerClick
    ) {
      return;
    }
    
    setShowPicklistDropdown(false);
    setSelectedPicklistIndex(-1);
    
    if (onEditEnd) {
      onEditEnd();
    }
  };

  const handleClick = () => {
    if (!isEditing && onEditStart) {
      onEditStart();
    }
  };

  const handleFocus = () => {
    // Don't automatically show dropdown on focus - only when button is clicked
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle picklist-specific keyboard events
    if (isPicklistCell) {
      handlePicklistKeyDown(e);
      return;
    }
    
    if (e.key === "Enter") {
      e.preventDefault();
      if (onEditEnd) {
        onEditEnd();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setInputValue(value);
      if (onEditEnd) {
        onEditEnd();
      }
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Effect to handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        cellRef.current &&
        !cellRef.current.contains(event.target as Node)
      ) {
        setShowPicklistDropdown(false);
        setSelectedPicklistIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={cellRef}
      className={`editable-cell ${isEditing ? 'editing' : ''} ${validationErrors.length > 0 ? 'has-error' : ''}`}
      onClick={handleClick}
    >
      <div className="cell-content">
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className="cell-input"
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
              readOnly={!isEditing}
            />

            {column.type === 'date' && isEditing && (
              <button
                ref={buttonRef}
                className="date-picker-button"
                onClick={handleDatePickerClick}
                tabIndex={-1}
              >
                📅
              </button>
            )}

            {isPicklistCell && isEditing && (
              <button
                ref={buttonRef}
                className="picklist-dropdown-button"
                onClick={handleDropdownButtonClick}
                tabIndex={-1}
              >
                ▼
              </button>
            )}
          </div>

          {/* Validation errors displayed inside cell */}
          {validationErrors.length > 0 && (
            <div style={{ 
              color: '#888', 
              fontSize: '0.75em', 
              fontStyle: 'italic', 
              marginTop: '1px',
              marginLeft: '8px', // Align with the input padding
              marginBottom: '6px', // Add padding below to match top padding
              lineHeight: '1.1'
            }}>
              {validationErrors.map((error, index) => (
                <div key={index}>
                  {error.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {showDatePicker && column.type === 'date' && (
          <div
            className="date-picker-container"
            style={{
              position: 'fixed',
              top: `${datePickerPosition.top}px`,
              left: `${datePickerPosition.left}px`,
              zIndex: 1000
            }}
          >
            <DatePicker
              selected={parseDate(inputValue)}
              onChange={handleDateChange}
              dateFormat={column.validation?.dateFormat || 'yyyy/MM/dd'}
              inline
            />
          </div>
        )}

        {showPicklistDropdown && isPicklistCell && (
          <div
            ref={dropdownRef}
            className="picklist-dropdown"
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000
            }}
          >
            {filteredPicklistValues.map((option, index) => (
              <div
                key={option}
                className={`picklist-option ${index === selectedPicklistIndex ? 'selected' : ''}`}
                onClick={() => handlePicklistSelect(option)}
                onMouseEnter={() => setSelectedPicklistIndex(index)}
              >
                {option}
              </div>
            ))}
            {filteredPicklistValues.length === 0 && (
              <div className="no-results">
                No matching values
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 