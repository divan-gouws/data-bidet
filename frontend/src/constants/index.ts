export const SPREADSHEET_CONSTANTS = {
  DEFAULT_COLUMN_WIDTH: 150,
  MIN_COLUMN_WIDTH: 80,
  MAX_COLUMN_WIDTH: 300,
  DEFAULT_ROW_COUNT: 5,
} as const;

export const KEYBOARD_KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
} as const;

export const COLUMN_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  DATE: 'date',
} as const; 