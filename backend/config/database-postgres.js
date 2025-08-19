const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set');
  console.error('Please create a config.env file with your database connection string');
  process.exit(1);
}

class PostgresDatabase {
  constructor() {
    console.log('🔗 Connecting to PostgreSQL database...');
    
    this.pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    this.initTables();
  }

  async initTables() {
    try {
      const client = await this.pool.connect();
      
      // Create employees table
      await client.query(`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          department VARCHAR(50) NOT NULL,
          joining_date DATE NOT NULL,
          annual_leave_balance INTEGER DEFAULT 24,
          sick_leave_balance INTEGER DEFAULT 12,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create leave requests table
      await client.query(`
        CREATE TABLE IF NOT EXISTS leave_requests (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL REFERENCES employees(id),
          leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'emergency')),
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          days_requested INTEGER NOT NULL,
          reason TEXT,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
          approved_by INTEGER REFERENCES employees(id),
          approved_at TIMESTAMP,
          comments TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create leave policies table
      await client.query(`
        CREATE TABLE IF NOT EXISTS leave_policies (
          id SERIAL PRIMARY KEY,
          department VARCHAR(50),
          leave_type VARCHAR(20),
          annual_entitlement INTEGER,
          max_consecutive_days INTEGER,
          min_notice_days INTEGER,
          carry_forward_allowed BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await client.query('CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date)');

      await this.insertDefaultPolicies(client);
      
      client.release();
      console.log('✅ PostgreSQL database initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing PostgreSQL database:', error);
    }
  }

  async insertDefaultPolicies(client) {
    const checkQuery = 'SELECT COUNT(*) as count FROM leave_policies';
    const result = await client.query(checkQuery);
    
    if (parseInt(result.rows[0].count) === 0) {
      const defaultPolicies = [
        { department: 'Engineering', leave_type: 'annual', annual_entitlement: 24, max_consecutive_days: 10, min_notice_days: 7 },
        { department: 'Engineering', leave_type: 'sick', annual_entitlement: 12, max_consecutive_days: 5, min_notice_days: 0 },
        { department: 'HR', leave_type: 'annual', annual_entitlement: 26, max_consecutive_days: 15, min_notice_days: 7 },
        { department: 'HR', leave_type: 'sick', annual_entitlement: 12, max_consecutive_days: 5, min_notice_days: 0 },
        { department: 'Finance', leave_type: 'annual', annual_entitlement: 24, max_consecutive_days: 10, min_notice_days: 7 },
        { department: 'Finance', leave_type: 'sick', annual_entitlement: 12, max_consecutive_days: 5, min_notice_days: 0 },
        { department: 'Marketing', leave_type: 'annual', annual_entitlement: 22, max_consecutive_days: 10, min_notice_days: 5 },
        { department: 'Marketing', leave_type: 'sick', annual_entitlement: 12, max_consecutive_days: 5, min_notice_days: 0 },
        { department: 'Sales', leave_type: 'annual', annual_entitlement: 22, max_consecutive_days: 10, min_notice_days: 5 },
        { department: 'Sales', leave_type: 'sick', annual_entitlement: 12, max_consecutive_days: 5, min_notice_days: 0 },
        { department: 'Operations', leave_type: 'annual', annual_entitlement: 24, max_consecutive_days: 10, min_notice_days: 7 },
        { department: 'Operations', leave_type: 'sick', annual_entitlement: 12, max_consecutive_days: 5, min_notice_days: 0 }
      ];

      const insertPolicy = `
        INSERT INTO leave_policies 
        (department, leave_type, annual_entitlement, max_consecutive_days, min_notice_days, is_active) 
        VALUES ($1, $2, $3, $4, $5, true)
      `;

      for (const policy of defaultPolicies) {
        await client.query(insertPolicy, [
          policy.department,
          policy.leave_type,
          policy.annual_entitlement,
          policy.max_consecutive_days,
          policy.min_notice_days
        ]);
      }

      console.log('✅ Default leave policies inserted');
    }
  }

  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
    console.log('PostgreSQL connection pool closed');
  }
}

module.exports = new PostgresDatabase();
