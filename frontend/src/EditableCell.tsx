import React, { useState, useEffect, useRef } from "react";
import type { ValidationError, ColumnDefinition } from "./types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from 'date-fns';

interface EditableCellProps {
  value: string;
  column: ColumnDefinition;
  onChange: (newValue: string) => void;
  onPasteCells?: (cells: string[][]) => void;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  validationErrors?: ValidationError[];
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  column,
  onChange,
  onPasteCells,
  isEditing = false,
  onEditStart,
  onEditEnd,
  validationErrors = [],
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDatePickerClick, setIsDatePickerClick] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
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
        top: rect.bottom + window.scrollY + 4,  // 4px margin
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
    // Don't exit edit mode if clicking within the cell or on the date picker
    if (
      cellRef.current?.contains(e.relatedTarget as Node) ||
      document.querySelector('.react-datepicker')?.contains(e.relatedTarget as Node) ||
      isDatePickerClick
    ) {
      return;
    }
    
    if (onEditEnd) {
      onEditEnd();
    }
  };

  const handleClick = () => {
    if (!isEditing && onEditStart) {
      onEditStart();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  // Close datepicker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !document.querySelector('.react-datepicker')?.contains(target)
      ) {
        setShowDatePicker(false);
        setIsDatePickerClick(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const hasErrors = validationErrors.length > 0;
  const dateFormat = column.validation?.dateFormat || 'yyyy/MM/dd';

  return (
    <div className="cell-container" onClick={handleClick} ref={cellRef} onBlur={handleBlur}>
      {isEditing ? (
        <div className="cell-editing-container">
          <div className="cell-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              className={`cell-input ${hasErrors ? 'has-validation-errors' : ''}`}
              autoFocus
            />
            {column.type === 'date' && (
              <button
                ref={buttonRef}
                className="date-picker-button"
                onClick={handleDatePickerClick}
                title="Open calendar"
              >
                📅
              </button>
            )}
          </div>
          {showDatePicker && column.type === 'date' && (
            <div 
              className="date-picker-container"
              style={{
                position: 'fixed',
                top: `${datePickerPosition.top}px`,
                left: `${datePickerPosition.left}px`
              }}
            >
              <DatePicker
                selected={inputValue ? parse(inputValue, dateFormat, new Date()) : new Date()}
                onChange={handleDateChange}
                inline
                dateFormat={dateFormat}
              />
            </div>
          )}
          {hasErrors && (
            <div className="validation-errors-tooltip">
              {validationErrors.map((error, index) => (
                <div key={index} className="validation-error-tooltip-item">
                  {error.message}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="cell-display">
          <span className="cell-value">{inputValue || " "}</span>
          {hasErrors && (
            <div className="validation-error-underneath">
              <em>{validationErrors[0].message}</em>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableCell;
