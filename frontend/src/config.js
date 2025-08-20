// Frontend Configuration
export const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  
  // Environment
  ENV: import.meta.env.VITE_ENV || 'development',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Symplora HR Management',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // API Endpoints
  api: {
    employees: '/api/employees',
    leaveRequests: '/api/leave-requests',
    quickSetup: '/api/quick-setup',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint, id = null, action = null) => {
  let fullEndpoint = endpoint;
  
  if (id) {
    fullEndpoint = `${endpoint}/${id}`;
  }
  
  if (action) {
    fullEndpoint = `${fullEndpoint}/${action}`;
  }
  
  return `${config.API_BASE_URL}${fullEndpoint}`;
};

// Helper function to check if running in development
export const isDevelopment = () => config.ENV === 'development';

// Helper function to check if running in production
export const isProduction = () => config.ENV === 'production';
