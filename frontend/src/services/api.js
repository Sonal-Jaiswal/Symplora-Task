import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.MODE === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.MODE === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.MODE === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
    }
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      // Redirect to login if needed
    }
    
    if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Employee API functions
export const employeeAPI = {
  // Get all employees
  getAll: () => api.get('/employees'),
  
  // Get employee by ID
  getById: (id) => api.get(`/employees/${id}`),
  
  // Create new employee
  create: (employeeData) => api.post('/employees', employeeData),
  
  // Get employee leave balance
  getLeaveBalance: (id) => api.get(`/employees/${id}/leave-balance`),
  
  // Update employee leave balance (admin)
  updateLeaveBalance: (id, balanceData) => api.put(`/employees/${id}/leave-balance`, balanceData),
  
  // Get department statistics
  getDepartmentStats: () => api.get('/employees/stats/department'),
};

// Leave Request API functions
export const leaveRequestAPI = {
  // Get all leave requests with optional filters
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    return api.get(`/leave-requests${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get leave request by ID
  getById: (id) => api.get(`/leave-requests/${id}`),
  
  // Get leave requests for specific employee
  getByEmployeeId: (employeeId, status = null) => {
    const url = `/leave-requests/employee/${employeeId}`;
    return api.get(status ? `${url}?status=${status}` : url);
  },
  
  // Submit new leave request
  create: (leaveData) => api.post('/leave-requests', leaveData),
  
  // Approve leave request
  approve: (id, approvalData) => api.put(`/leave-requests/${id}/approve`, approvalData),
  
  // Reject leave request
  reject: (id, rejectionData) => api.put(`/leave-requests/${id}/reject`, rejectionData),
  
  // Cancel leave request
  cancel: (id, cancelData) => api.put(`/leave-requests/${id}/cancel`, cancelData),
  
  // Get leave statistics
  getStats: (year = null) => {
    const url = '/leave-requests/stats/overview';
    return api.get(year ? `${url}?year=${year}` : url);
  },
};

// System API functions
export const systemAPI = {
  // Health check
  health: () => api.get('/health', { baseURL: API_BASE_URL.replace('/api', '') }),
  
  // Get system statistics
  getStats: () => api.get('/stats'),
  
  // Quick setup (for demo)
  quickSetup: () => api.get('/quick-setup'),
};

// Utility functions
export const apiUtils = {
  // Extract error message from API response
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.errors) {
      return error.response.data.errors.map(err => err.msg || err.message).join(', ');
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  },
  
  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response && error.request;
  },
  
  // Check if error is client side (4xx)
  isClientError: (error) => {
    return error.response && error.response.status >= 400 && error.response.status < 500;
  },
  
  // Check if error is server side (5xx)
  isServerError: (error) => {
    return error.response && error.response.status >= 500;
  },
  
  // Format API response data
  formatResponse: (response) => {
    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Operation completed successfully',
      metadata: {
        status: response.status,
        timestamp: new Date().toISOString(),
      }
    };
  },
};

// Export the main API instance
export default api;
