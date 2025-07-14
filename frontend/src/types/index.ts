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
}

export interface ColumnDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
  optional?: boolean;
  validation?: ValidationConstraints;
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
  type: 'nullable' | 'unique' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'type' | 'dateFormat' | 'decimal';
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