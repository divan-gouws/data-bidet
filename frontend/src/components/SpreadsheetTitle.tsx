import React, { useState, useRef, useEffect } from 'react';

interface SpreadsheetTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onFocusTitle?: () => void;
}

export const SpreadsheetTitle: React.FC<SpreadsheetTitleProps> = ({
  title,
  onTitleChange,
  onFocusTitle,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  const handleClick = () => {
    if (onFocusTitle) onFocusTitle();
    setIsEditing(true);
  };

  const handleBlur = () => {
    // Only exit edit mode if the input is not focused
    if (!inputRef.current?.contains(document.activeElement)) {
      setIsEditing(false);
      if (editValue.trim() !== title) {
        onTitleChange(editValue.trim() || 'Untitled Spreadsheet');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      if (editValue.trim() !== title) {
        onTitleChange(editValue.trim() || 'Untitled Spreadsheet');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(title);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="spreadsheet-title-container">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="spreadsheet-title-input"
          placeholder="Enter spreadsheet title..."
        />
      ) : (
        <h1 
          className="spreadsheet-title"
          onClick={handleClick}
          title="Click to edit title"
        >
          {title}
        </h1>
      )}
    </div>
  );
}; 