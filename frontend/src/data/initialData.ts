import type { ColumnDefinition, RowData } from '../types';
import { SPREADSHEET_CONSTANTS } from '../constants';

export const initialColumnSchema: ColumnDefinition[] = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "birthdate", label: "Birthdate" },
  { key: "category", label: "Category" },
];

export const createInitialRows = (count: number): RowData[] => {
  return Array.from({ length: count }, () => ({
    name: '',
    age: '',
    birthdate: '',
    category: '',
  }));
};

export const getDefaultTitle = (): string => {
  return SPREADSHEET_CONSTANTS.DEFAULT_TITLE;
}; 