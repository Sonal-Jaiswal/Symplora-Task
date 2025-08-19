# Frontend Component Structure

This directory contains the organized components for the Symplora Leave Management System frontend.

## Directory Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── Dashboard.jsx          # Dashboard component with stats and recent activity
│   │   └── index.js               # Export file
│   ├── EmployeeManagement/
│   │   ├── EmployeeManagement.jsx # Employee management with add/edit forms
│   │   └── index.js               # Export file
│   ├── LeaveManagement/
│   │   ├── LeaveManagement.jsx    # Leave request management and approval
│   │   └── index.js               # Export file
│   ├── Analytics/
│   │   ├── Analytics.jsx          # Analytics and reporting component
│   │   └── index.js               # Export file
│   ├── Layout/
│   │   ├── Sidebar.jsx            # Navigation sidebar component
│   │   ├── Header.jsx             # App bar header component
│   │   └── index.js               # Export file
│   └── README.md                  # This file
├── theme/
│   └── index.js                   # Material-UI theme configuration
├── App.jsx                        # Main app component (replaces App-professional.jsx)
└── main.jsx                       # Entry point
```

## Component Responsibilities

### Dashboard
- Displays system overview statistics
- Shows recent leave requests
- Welcome message for new users
- Demo data loading functionality

### EmployeeManagement
- Employee listing with card-based UI
- Add new employee form
- Employee details display
- Leave balance information

### LeaveManagement
- Leave request listing table
- Submit new leave request form
- Approve/reject leave requests
- Status management

### Analytics
- Department statistics
- Leave request summary
- Data visualization

### Layout Components
- **Sidebar**: Navigation menu with routing
- **Header**: App bar with mobile menu and demo data button

### Theme
- Material-UI theme configuration
- Color palette (Indian-inspired)
- Component styling overrides
- Responsive breakpoints

## Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused across the application
3. **Testing**: Individual components can be tested in isolation
4. **Development**: Multiple developers can work on different components simultaneously
5. **Code Organization**: Clear separation of concerns and logical grouping

## Usage

Import components using the index files for clean imports:

```jsx
import Dashboard from './components/Dashboard';
import { Sidebar, Header } from './components/Layout';
```

## Migration Notes

- The original `App-professional.jsx` (1128 lines) has been split into 8 focused files
- All functionality has been preserved
- The main App component now orchestrates the other components
- Theme configuration is centralized and reusable
