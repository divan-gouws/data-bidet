# Data Bidet - Spreadsheet Application

A modern, interactive spreadsheet application built with React (frontend) and FastAPI (backend).

## Architecture

### Frontend (React + TypeScript)
- **Components**: Modular React components for spreadsheet functionality
- **Hooks**: Custom hooks for state management and keyboard navigation
- **Types**: Centralized TypeScript type definitions
- **Utils**: Utility functions for spreadsheet operations
- **Constants**: Application constants and configuration

### Backend (FastAPI + Python)
- **API**: RESTful API endpoints for spreadsheet operations
- **Models**: Pydantic models for data validation
- **Services**: Business logic layer for spreadsheet operations
- **Core**: Configuration and middleware setup

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
venv/Scripts/activate  # On Windows
# or
source venv/bin/activate  # On Unix/MacOS
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
data-bidet/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── api.py
│   │   │   └── endpoints/
│   │   │       └── spreadsheet.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── cors.py
│   │   ├── models/
│   │   │   └── spreadsheet.py
│   │   ├── services/
│   │   │   └── spreadsheet_service.py
│   │   └── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SpreadsheetTable.tsx
│   │   │   ├── SpreadsheetHeader.tsx
│   │   │   └── SpreadsheetBody.tsx
│   │   ├── hooks/
│   │   │   ├── useSpreadsheet.ts
│   │   │   └── useKeyboardNavigation.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   └── index.ts
│   │   ├── data/
│   │   │   └── initialData.ts
│   │   ├── utils/
│   │   │   └── spreadsheetUtils.ts
│   │   ├── App.tsx
│   │   └── EditableCell.tsx
│   └── package.json
└── README.md
```

## Features

### Frontend Features
- **Interactive Spreadsheet**: Click to edit cells
- **Keyboard Navigation**: Arrow keys, Tab, Enter for navigation
- **Column Resizing**: Drag column borders to resize
- **Column Type Selection**: Choose between string, number, or date
- **Multi-cell Paste**: Paste tabular data from clipboard
- **Real-time Editing**: Immediate updates as you type

### Backend Features
- **RESTful API**: Clean API endpoints for spreadsheet operations
- **Data Validation**: Pydantic models ensure data integrity
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Configured for frontend integration
- **API Documentation**: Auto-generated docs at `/docs`

## API Endpoints

- `GET /api/v1/spreadsheet/` - Get default spreadsheet
- `POST /api/v1/spreadsheet/validate` - Validate spreadsheet data
- `PUT /api/v1/spreadsheet/cell/{row_index}/{column_key}` - Update cell value
- `POST /api/v1/spreadsheet/row` - Add new row
- `POST /api/v1/spreadsheet/column` - Add new column

## Code Quality

### Frontend
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Modular Architecture**: Separated concerns with hooks and components
- **Custom Hooks**: Reusable state management logic

### Backend
- **Pydantic**: Data validation and serialization
- **FastAPI**: Modern, fast web framework
- **Logging**: Comprehensive logging system
- **Error Handling**: Proper HTTP status codes and error messages

## Development

### Running in Development Mode
1. Start the backend: `uvicorn app.main:app --reload`
2. Start the frontend: `npm run dev`
3. Access the application at `http://localhost:5173`

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Write meaningful commit messages
5. Test your changes thoroughly

## Code Organization Principles

- **Separation of Concerns**: UI, logic, and data are separated
- **Single Responsibility**: Each component/hook has one clear purpose
- **DRY Principle**: No code duplication
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error handling throughout
- **Documentation**: Clear comments and documentation