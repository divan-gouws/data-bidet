import React, { useState, useEffect, useRef } from "react";

interface EditableHeaderProps {
  value: string;
  onChange: (newValue: string) => void;
  onPasteHeaders?: (cells: string[][]) => void;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
  dataHeaderIndex: number;
}

const EditableHeader: React.FC<EditableHeaderProps> = ({
  value,
  onChange,
  onPasteHeaders,
  isEditing = false,
  onEditStart,
  onEditEnd,
  dataHeaderIndex,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync with prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
  };

  const handleBlur = () => {
    if (onEditEnd) {
      onEditEnd();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const paste = e.clipboardData.getData("text");
    if (!paste) return;

    const rows = paste.split(/\r?\n/).filter((row) => row.length > 0);
    const parsedData = rows.map((row) => row.split("\t"));

    if (onPasteHeaders && parsedData.length > 0) {
      onPasteHeaders(parsedData);
    } else {
      setInputValue(paste);
      onChange(paste);
    }
  };

  const handleClick = () => {
    if (onEditStart) {
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
      setInputValue(value); // Reset to original value
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

  return (
    <>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onPaste={handlePaste}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="header-input"
          data-header-index={dataHeaderIndex}
          autoFocus
        />
      ) : (
        <div className="header-display" onClick={handleClick}>
          {inputValue || " "}
        </div>
      )}
    </>
  );
};

export default EditableHeader; 