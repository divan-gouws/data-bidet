export interface ValidationConstraints {
  nullable?: boolean;
  unique?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  dateFormat?: string;  // Format string for date validation (e.g., 'yyyy/mm/dd')
  decimalOnly?: boolean;  // If true, only accept decimal numbers for number type
  picklistValues?: string[];  // Values allowed for picklist type
  caseSensitive?: boolean;  // Whether picklist validation should be case sensitive
}

export interface ColumnDefinition {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'date' | 'picklist';  // Only required for destination columns
  optional?: boolean;
  validation?: ValidationConstraints;
  isMapped?: boolean;  // Indicates if this column is mapped in the edit interface
}

export interface RowData {
  [key: string]: string;
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface ColumnWidths {
  [key: string]: number;
}

export interface ValidationError {
  row: number;
  columnKey: string;
  message: string;
  type: 'nullable' | 'unique' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'type' | 'dateFormat' | 'decimal' | 'picklist';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface SpreadsheetState {
  rows: RowData[];
  columnSchema: ColumnDefinition[];
  selectedCell: CellPosition | null;
  selectedHeader: number | null;
  columnWidths: ColumnWidths;
  isEditing: boolean;
  title: string;
} 