export interface RowData {
    [key: string]: string;
}

export const initialRows: RowData[] = Array.from({ length: 5 }, () => ({
name: '',
age: '',
dob: '',
}));
