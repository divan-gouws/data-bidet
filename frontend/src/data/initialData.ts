import type { ColumnDefinition, RowData } from '../types';

export const initialColumnSchema: ColumnDefinition[] = [
  { key: "name", label: "Name", type: "string" },
  { key: "age", label: "Age", type: "number" },
  { key: "birthdate", label: "Birthdate", type: "date" },
];

export const createInitialRows = (count: number): RowData[] => {
  return Array.from({ length: count }, () => ({
    name: '',
    age: '',
    birthdate: '',
  }));
}; 