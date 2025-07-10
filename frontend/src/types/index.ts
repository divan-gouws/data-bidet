export interface ColumnDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date';
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

export interface SpreadsheetState {
  rows: RowData[];
  columnSchema: ColumnDefinition[];
  selectedCell: CellPosition | null;
  selectedHeader: number | null;
  columnWidths: ColumnWidths;
  isEditing: boolean;
  title: string;
} 