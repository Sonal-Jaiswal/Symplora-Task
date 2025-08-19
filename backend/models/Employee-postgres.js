const database = require('../config/database-postgres');

class Employee {
  static async create(employeeData) {
    const { name, email, department, joining_date } = employeeData;
    
    // Convert DD/MM/YYYY to YYYY-MM-DD if needed
    const formattedDate = joining_date.includes('/') ? 
      joining_date.split('/').reverse().join('-') : 
      joining_date;
    
    // Calculate pro-rated annual leave based on joining date
    const joiningDate = new Date(formattedDate);
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const daysInYear = 365;
    const daysWorked = Math.ceil((joiningDate - startOfYear) / (1000 * 60 * 60 * 24));
    const annualLeaveBalance = Math.ceil((24 * (daysInYear - daysWorked)) / daysInYear);
    
    const query = `
      INSERT INTO employees (name, email, department, joining_date, annual_leave_balance, sick_leave_balance)
      VALUES ($1, $2, $3, $4, $5, 12)
      RETURNING *;
    `;
    
    try {
      const result = await database.query(query, [name, email, department, formattedDate, annualLeaveBalance]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'employees_email_key') {
        throw new Error('An employee with this email address already exists');
      }
      throw error;
    }
  }

  static async findAll() {
    const query = `
      SELECT 
        e.*,
        COALESCE(
          (SELECT SUM(
            EXTRACT(DAY FROM (lr.end_date::timestamp - lr.start_date::timestamp))
          )
          FROM leave_requests lr 
          WHERE lr.employee_id = e.id 
          AND lr.status = 'Approved' 
          AND lr.leave_type = 'Annual'),
          0
        ) as annual_leave_used,
        COALESCE(
          (SELECT SUM(
            EXTRACT(DAY FROM (lr.end_date::timestamp - lr.start_date::timestamp))
          )
          FROM leave_requests lr 
          WHERE lr.employee_id = e.id 
          AND lr.status = 'Approved' 
          AND lr.leave_type = 'Sick'),
          0
        ) as sick_leave_used
      FROM employees e
      ORDER BY e.joining_date DESC;
    `;
    
    const result = await database.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT 
        e.*,
        COALESCE(
          (SELECT SUM(
            EXTRACT(DAY FROM (lr.end_date::timestamp - lr.start_date::timestamp))
          )
          FROM leave_requests lr 
          WHERE lr.employee_id = e.id 
          AND lr.status = 'Approved' 
          AND lr.leave_type = 'Annual'),
          0
        ) as annual_leave_used,
        COALESCE(
          (SELECT SUM(
            EXTRACT(DAY FROM (lr.end_date::timestamp - lr.start_date::timestamp))
          )
          FROM leave_requests lr 
          WHERE lr.employee_id = e.id 
          AND lr.status = 'Approved' 
          AND lr.leave_type = 'Sick'),
          0
        ) as sick_leave_used
      FROM employees e
      WHERE e.id = $1;
    `;
    
    const result = await database.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT * FROM employees WHERE email = $1;
    `;
    
    const result = await database.query(query, [email]);
    return result.rows[0];
  }

  static async getLeaveBalance(id) {
    const query = `
      SELECT 
        e.*,
        COALESCE(
          (SELECT SUM(
            EXTRACT(DAY FROM (lr.end_date::timestamp - lr.start_date::timestamp))
          )
          FROM leave_requests lr 
          WHERE lr.employee_id = e.id 
          AND lr.status = 'Approved' 
          AND lr.leave_type = 'Annual'),
          0
        ) as annual_leave_used,
        COALESCE(
          (SELECT SUM(
            EXTRACT(DAY FROM (lr.end_date::timestamp - lr.start_date::timestamp))
          )
          FROM leave_requests lr 
          WHERE lr.employee_id = e.id 
          AND lr.status = 'Approved' 
          AND lr.leave_type = 'Sick'),
          0
        ) as sick_leave_used
      FROM employees e
      WHERE e.id = $1;
    `;
    
    const result = await database.query(query, [id]);
    return result.rows[0];
  }

  static async getDepartmentStats() {
    const query = `
      SELECT 
        department,
        COUNT(*) as total_employees,
        AVG(annual_leave_balance) as avg_annual_balance,
        AVG(sick_leave_balance) as avg_sick_balance
      FROM employees
      GROUP BY department
      ORDER BY department;
    `;
    
    const result = await database.query(query);
    return result.rows;
  }

  static async updateLeaveBalance(id, leaveType, days, operation = 'subtract') {
    const balanceColumn = leaveType === 'annual' ? 'annual_leave_balance' : 'sick_leave_balance';
    const operator = operation === 'add' ? '+' : '-';
    
    const query = `
      UPDATE employees 
      SET ${balanceColumn} = ${balanceColumn} ${operator} $1
      WHERE id = $2
      RETURNING *;
    `;
    
    const result = await database.query(query, [days, id]);
    return result.rows[0];
  }

  static validateJoiningDate(date) {
    // Convert DD/MM/YYYY to YYYY-MM-DD if needed
    const formattedDate = date.includes('/') ? 
      date.split('/').reverse().join('-') : 
      date;

    const joiningDate = new Date(formattedDate);
    return { valid: true };
  }
}

module.exports = Employee;