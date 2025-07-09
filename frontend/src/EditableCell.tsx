import React, { useState, useEffect, useRef } from "react";

interface EditableCellProps {
  value: string;
  columnType: "string" | "number" | "date";
  onChange: (newValue: string) => void;
  onPasteCells?: (cells: string[][]) => void;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  columnType,
  onChange,
  onPasteCells,
  isEditing = false,
  onEditStart,
  onEditEnd,
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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const paste = e.clipboardData.getData("text");
    if (!paste) return;

    const rows = paste.split(/\r?\n/).filter((row) => row.length > 0);
    const parsedData = rows.map((row) => row.split("\t"));

    if (onPasteCells) {
      onPasteCells(parsedData);
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

  const handleBlur = () => {
    if (onEditEnd) {
      onEditEnd();
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
    <div className="cell-container" onClick={handleClick}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onPaste={handlePaste}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="cell-input"
          autoFocus
        />
      ) : (
        <div className="cell-display">
          {inputValue || " "}
        </div>
      )}
    </div>
  );
};

export default EditableCell;
