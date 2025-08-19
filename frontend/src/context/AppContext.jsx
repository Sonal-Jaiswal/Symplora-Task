import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { employeeAPI, leaveRequestAPI, systemAPI, apiUtils } from '../services/api';

// Initial state
const initialState = {
  // UI state
  loading: false,
  error: null,
  snackbar: {
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
  },
  
  // Data state
  employees: [],
  leaveRequests: [],
  departmentStats: [],
  leaveStats: null,
  systemStats: null,
  
  // Filters and pagination
  filters: {
    employees: {},
    leaveRequests: {
      status: '',
      department: '',
      leave_type: '',
    },
  },
  
  // Selected items
  selectedEmployee: null,
  selectedLeaveRequest: null,
  
  // App settings
  settings: {
    itemsPerPage: 10,
    theme: 'light',
    notifications: true,
  },
};

// Action types
const actionTypes = {
  // UI actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SHOW_SNACKBAR: 'SHOW_SNACKBAR',
  HIDE_SNACKBAR: 'HIDE_SNACKBAR',
  
  // Data actions
  SET_EMPLOYEES: 'SET_EMPLOYEES',
  ADD_EMPLOYEE: 'ADD_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  SET_LEAVE_REQUESTS: 'SET_LEAVE_REQUESTS',
  ADD_LEAVE_REQUEST: 'ADD_LEAVE_REQUEST',
  UPDATE_LEAVE_REQUEST: 'UPDATE_LEAVE_REQUEST',
  SET_DEPARTMENT_STATS: 'SET_DEPARTMENT_STATS',
  SET_LEAVE_STATS: 'SET_LEAVE_STATS',
  SET_SYSTEM_STATS: 'SET_SYSTEM_STATS',
  
  // Selection actions
  SET_SELECTED_EMPLOYEE: 'SET_SELECTED_EMPLOYEE',
  SET_SELECTED_LEAVE_REQUEST: 'SET_SELECTED_LEAVE_REQUEST',
  
  // Filter actions
  SET_EMPLOYEE_FILTERS: 'SET_EMPLOYEE_FILTERS',
  SET_LEAVE_REQUEST_FILTERS: 'SET_LEAVE_REQUEST_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case actionTypes.SET_ERROR:
      return { 
        ...state, 
        error: action.payload, 
        loading: false,
        snackbar: {
          open: true,
          message: action.payload,
          severity: 'error',
        }
      };
      
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
      
    case actionTypes.SHOW_SNACKBAR:
      return {
        ...state,
        snackbar: {
          open: true,
          message: action.payload.message,
          severity: action.payload.severity || 'info',
        }
      };
      
    case actionTypes.HIDE_SNACKBAR:
      return {
        ...state,
        snackbar: { ...state.snackbar, open: false }
      };
      
    case actionTypes.SET_EMPLOYEES:
      return { ...state, employees: action.payload, loading: false };
      
    case actionTypes.ADD_EMPLOYEE:
      return { 
        ...state, 
        employees: [...state.employees, action.payload],
        snackbar: {
          open: true,
          message: 'Employee added successfully',
          severity: 'success',
        }
      };
      
    case actionTypes.UPDATE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.map(emp => 
          emp.id === action.payload.id ? { ...emp, ...action.payload } : emp
        ),
        snackbar: {
          open: true,
          message: 'Employee updated successfully',
          severity: 'success',
        }
      };
      
    case actionTypes.SET_LEAVE_REQUESTS:
      return { ...state, leaveRequests: action.payload, loading: false };
      
    case actionTypes.ADD_LEAVE_REQUEST:
      return { 
        ...state, 
        leaveRequests: [action.payload, ...state.leaveRequests],
        snackbar: {
          open: true,
          message: 'Leave request submitted successfully',
          severity: 'success',
        }
      };
      
    case actionTypes.UPDATE_LEAVE_REQUEST:
      return {
        ...state,
        leaveRequests: state.leaveRequests.map(req => 
          req.id === action.payload.id ? { ...req, ...action.payload } : req
        ),
        snackbar: {
          open: true,
          message: `Leave request ${action.payload.status} successfully`,
          severity: 'success',
        }
      };
      
    case actionTypes.SET_DEPARTMENT_STATS:
      return { ...state, departmentStats: action.payload };
      
    case actionTypes.SET_LEAVE_STATS:
      return { ...state, leaveStats: action.payload };
      
    case actionTypes.SET_SYSTEM_STATS:
      return { ...state, systemStats: action.payload };
      
    case actionTypes.SET_SELECTED_EMPLOYEE:
      return { ...state, selectedEmployee: action.payload };
      
    case actionTypes.SET_SELECTED_LEAVE_REQUEST:
      return { ...state, selectedLeaveRequest: action.payload };
      
    case actionTypes.SET_EMPLOYEE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          employees: { ...state.filters.employees, ...action.payload }
        }
      };
      
    case actionTypes.SET_LEAVE_REQUEST_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          leaveRequests: { ...state.filters.leaveRequests, ...action.payload }
        }
      };
      
    case actionTypes.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          employees: {},
          leaveRequests: {
            status: '',
            department: '',
            leave_type: '',
          }
        }
      };
      
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    // UI actions
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    showSnackbar: (message, severity = 'info') => 
      dispatch({ type: actionTypes.SHOW_SNACKBAR, payload: { message, severity } }),
    hideSnackbar: () => dispatch({ type: actionTypes.HIDE_SNACKBAR }),

    // Employee actions
    fetchEmployees: async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await employeeAPI.getAll();
        dispatch({ type: actionTypes.SET_EMPLOYEES, payload: response.data.data || [] });
      } catch (error) {
        console.warn('Failed to fetch employees:', error);
        dispatch({ type: actionTypes.SET_EMPLOYEES, payload: [] });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    },

    createEmployee: async (employeeData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await employeeAPI.create(employeeData);
        dispatch({ type: actionTypes.ADD_EMPLOYEE, payload: response.data.data });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return response.data.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
        throw error;
      }
    },

    getEmployeeById: async (id) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await employeeAPI.getById(id);
        dispatch({ type: actionTypes.SET_SELECTED_EMPLOYEE, payload: response.data.data });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return response.data.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
        throw error;
      }
    },

    getEmployeeLeaveBalance: async (id) => {
      try {
        const response = await employeeAPI.getLeaveBalance(id);
        return response.data.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
        throw error;
      }
    },

    // Leave request actions
    fetchLeaveRequests: async (filters = {}) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await leaveRequestAPI.getAll(filters);
        dispatch({ type: actionTypes.SET_LEAVE_REQUESTS, payload: response.data.data || [] });
      } catch (error) {
        console.warn('Failed to fetch leave requests:', error);
        dispatch({ type: actionTypes.SET_LEAVE_REQUESTS, payload: [] });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    },

    createLeaveRequest: async (leaveData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await leaveRequestAPI.create(leaveData);
        dispatch({ type: actionTypes.ADD_LEAVE_REQUEST, payload: response.data.data });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return response.data.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
        throw error;
      }
    },

    approveLeaveRequest: async (id, approvalData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await leaveRequestAPI.approve(id, approvalData);
        dispatch({ type: actionTypes.UPDATE_LEAVE_REQUEST, payload: response.data.data });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return response.data.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
        throw error;
      }
    },

    rejectLeaveRequest: async (id, rejectionData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const response = await leaveRequestAPI.reject(id, rejectionData);
        dispatch({ type: actionTypes.UPDATE_LEAVE_REQUEST, payload: response.data.data });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return response.data.data;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
        throw error;
      }
    },

    // Statistics actions
    fetchDepartmentStats: async () => {
      try {
        const response = await employeeAPI.getDepartmentStats();
        dispatch({ type: actionTypes.SET_DEPARTMENT_STATS, payload: response.data.data });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
      }
    },

    fetchLeaveStats: async (year = null) => {
      try {
        const response = await leaveRequestAPI.getStats(year);
        dispatch({ type: actionTypes.SET_LEAVE_STATS, payload: response.data.data });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
      }
    },

    fetchSystemStats: async () => {
      try {
        const response = await systemAPI.getStats();
        dispatch({ type: actionTypes.SET_SYSTEM_STATS, payload: response.data.data || {} });
      } catch (error) {
        console.warn('Failed to fetch system stats:', error);
        dispatch({ type: actionTypes.SET_SYSTEM_STATS, payload: {
          total_employees: 0,
          total_leave_requests: 0,
          pending_leave_requests: 0,
          system_health: 'Unknown'
        }});
      }
    },

    // Filter actions
    setEmployeeFilters: (filters) => 
      dispatch({ type: actionTypes.SET_EMPLOYEE_FILTERS, payload: filters }),
    
    setLeaveRequestFilters: (filters) => 
      dispatch({ type: actionTypes.SET_LEAVE_REQUEST_FILTERS, payload: filters }),
    
    clearFilters: () => dispatch({ type: actionTypes.CLEAR_FILTERS }),

    // Settings actions
    updateSettings: (settings) => 
      dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: settings }),

    // Quick setup for demo
    quickSetup: async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        await systemAPI.quickSetup();
        await actions.fetchEmployees();
        await actions.fetchLeaveRequests();
        dispatch({ 
          type: actionTypes.SHOW_SNACKBAR, 
          payload: { message: 'Demo data loaded successfully!', severity: 'success' }
        });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: apiUtils.getErrorMessage(error) });
      }
    },
  };

  // Load initial data with error handling
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.allSettled([
          actions.fetchEmployees(),
          actions.fetchLeaveRequests(),
          actions.fetchSystemStats()
        ]);
      } catch (error) {
        console.warn('Some initial data failed to load:', error);
        // App should still work even if initial data fails
      }
    };
    
    loadInitialData();
  }, []);

  const value = {
    ...state,
    actions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
