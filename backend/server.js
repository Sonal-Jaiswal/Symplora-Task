require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Import middleware
const { 
  errorHandler, 
  notFound, 
  requestLogger, 
  rateLimiter 
} = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const leaveRequestRoutes = require('./routes/leaveRequests');
const healthRoutes = require('./routes/health');

// Initialize PostgreSQL database
require('./config/database-postgres');

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:5174'];

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(requestLogger);

// Rate limiting (simple implementation)
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Symplora Leave Management System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/health', healthRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Symplora Leave Management System API',
    version: '1.0.0',
    documentation: {
      employees: {
        'POST /api/employees': 'Create a new employee',
        'GET /api/employees': 'Get all employees',
        'GET /api/employees/:id': 'Get employee by ID',
        'GET /api/employees/:id/leave-balance': 'Get employee leave balance',
        'GET /api/employees/stats/department': 'Get department statistics',
        'PUT /api/employees/:id/leave-balance': 'Update employee leave balance'
      },
      leave_requests: {
        'POST /api/leave-requests': 'Submit a leave request',
        'GET /api/leave-requests': 'Get all leave requests (with filters)',
        'GET /api/leave-requests/:id': 'Get leave request by ID',
        'GET /api/leave-requests/employee/:employee_id': 'Get employee leave requests',
        'PUT /api/leave-requests/:id/approve': 'Approve a leave request',
        'PUT /api/leave-requests/:id/reject': 'Reject a leave request',
        'PUT /api/leave-requests/:id/cancel': 'Cancel a leave request',
        'GET /api/leave-requests/stats/overview': 'Get leave statistics'
      }
    },
    sample_requests: {
      create_employee: {
        method: 'POST',
        url: '/api/employees',
        body: {
          name: 'John Doe',
          email: 'john.doe@company.com',
          department: 'Engineering',
          joining_date: '2024-01-15'
        }
      },
      submit_leave: {
        method: 'POST',
        url: '/api/leave-requests',
        body: {
          employee_id: 1,
          leave_type: 'annual',
          start_date: '2024-03-15',
          end_date: '2024-03-17',
          reason: 'Family vacation'
        }
      }
    }
  });
});

// Additional API endpoints for quick testing
app.get('/api/quick-setup', async (req, res) => {
  try {
    const Employee = require('./models/Employee-postgres');
    
    // Create Indian demo employees
    const createdEmployees = await Employee.createIndianDemoData();

    res.json({
      success: true,
      message: 'Indian demo data setup completed successfully',
      created_employees: createdEmployees,
      note: 'You can now test the leave management system with Indian employee data'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting up Indian demo data',
      error: error.message
    });
  }
});

// API statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const Employee = require('./models/Employee-postgres');
    const LeaveRequest = require('./models/LeaveRequest-postgres');

    const [employees, allLeaves, pendingLeaves] = await Promise.all([
      Employee.findAll(),
      LeaveRequest.findAll(),
      LeaveRequest.findAll({ status: 'pending' })
    ]);

    res.json({
      success: true,
      message: 'System statistics',
      data: {
        total_employees: employees.length,
        total_leave_requests: allLeaves.length,
        pending_leave_requests: pendingLeaves.length,
        departments: [...new Set(employees.map(emp => emp.department))],
        system_health: 'Operational'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  const database = require('./config/database');
  database.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  const database = require('./config/database');
  database.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Symplora Leave Management API Server running on port ${PORT}`);
  console.log(`📖 API Documentation available at: http://localhost:${PORT}/`);
  console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
  console.log(`📊 Quick setup available at: http://localhost:${PORT}/api/quick-setup`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
