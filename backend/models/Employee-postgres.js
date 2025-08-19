const database = require('../config/database-postgres');

class Employee {
  static async create(employeeData) {
    const { name, email, department, joining_date } = employeeData;
    
    // Calculate pro-rated annual leave based on joining date
    const joiningDate = new Date(joining_date);
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    
    let annualLeaveBalance = 24; // Default annual leave
    
    // Pro-rate if joining mid-year
    if (joiningDate > yearStart) {
      const totalDaysInYear = Math.ceil((yearEnd - yearStart) / (1000 * 60 * 60 * 24));
      const remainingDaysInYear = Math.ceil((yearEnd - joiningDate) / (1000 * 60 * 60 * 24));
      annualLeaveBalance = Math.floor((24 * remainingDaysInYear) / totalDaysInYear);
    }

    const query = `
      INSERT INTO employees (name, email, department, joining_date, annual_leave_balance)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    try {
      const result = await database.query(query, [name, email, department, joining_date, annualLeaveBalance]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM employees WHERE id = $1 AND is_active = true';
    
    try {
      const result = await database.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM employees WHERE email = $1 AND is_active = true';
    
    try {
      const result = await database.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const query = 'SELECT * FROM employees WHERE is_active = true ORDER BY name';
    
    try {
      const result = await database.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateLeaveBalance(employeeId, leaveType, days, operation = 'subtract') {
    const balanceColumn = leaveType === 'annual' ? 'annual_leave_balance' : 'sick_leave_balance';
    const operator = operation === 'subtract' ? '-' : '+';
    
    const query = `
      UPDATE employees 
      SET ${balanceColumn} = ${balanceColumn} ${operator} $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await database.query(query, [days, employeeId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getLeaveBalance(employeeId) {
    const query = `
      SELECT 
        id,
        name,
        email,
        department,
        annual_leave_balance,
        sick_leave_balance,
        joining_date
      FROM employees 
      WHERE id = $1 AND is_active = true
    `;
    
    try {
      const result = await database.query(query, [employeeId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getDepartmentStats() {
    const query = `
      SELECT 
        department,
        COUNT(*) as total_employees,
        AVG(annual_leave_balance) as avg_annual_balance,
        AVG(sick_leave_balance) as avg_sick_balance
      FROM employees 
      WHERE is_active = true
      GROUP BY department
      ORDER BY department
    `;
    
    try {
      const result = await database.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static validateJoiningDate(joiningDate) {
    const today = new Date();
    const joining = new Date(joiningDate);
    
    // Joining date cannot be in the future
    if (joining > today) {
      return { valid: false, message: 'Joining date cannot be in the future' };
    }

    // Joining date cannot be more than 10 years ago (reasonable business rule)
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(today.getFullYear() - 10);
    
    if (joining < tenYearsAgo) {
      return { valid: false, message: 'Joining date cannot be more than 10 years ago' };
    }

    return { valid: true };
  }

  // Method to create Indian demo employees
  static async createIndianDemoData() {
    const indianEmployees = [
      {
        name: 'Arjun Sharma',
        email: 'arjun.sharma@symplora.com',
        department: 'Engineering',
        joining_date: '2023-01-15'
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@symplora.com', 
        department: 'HR',
        joining_date: '2023-03-10'
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@symplora.com',
        department: 'Finance', 
        joining_date: '2023-06-01'
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@symplora.com',
        department: 'Marketing',
        joining_date: '2023-08-20'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@symplora.com',
        department: 'Engineering',
        joining_date: '2023-11-05'
      },
      {
        name: 'Kavya Nair',
        email: 'kavya.nair@symplora.com',
        department: 'Sales',
        joining_date: '2024-01-10'
      },
      {
        name: 'Rohit Agarwal',
        email: 'rohit.agarwal@symplora.com',
        department: 'Operations',
        joining_date: '2024-02-15'
      },
      {
        name: 'Ananya Gupta',
        email: 'ananya.gupta@symplora.com',
        department: 'Engineering',
        joining_date: '2024-03-20'
      }
    ];

    const createdEmployees = [];

    for (const empData of indianEmployees) {
      try {
        // Check if employee already exists
        const existing = await this.findByEmail(empData.email);
        if (!existing) {
          const newEmployee = await this.create(empData);
          createdEmployees.push(newEmployee);
        }
      } catch (error) {
        console.error(`Error creating employee ${empData.name}:`, error);
        continue;
      }
    }

    return createdEmployees;
  }
}

module.exports = Employee;
