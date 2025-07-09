export interface ColumnDefinition {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date';
  }
  
  export const initialColumnSchema = [
    { key: "name", label: "Name", type: "string" },
    { key: "age", label: "Age", type: "number" },
    { key: "birthdate", label: "Birthdate", type: "date" },
  ];
  