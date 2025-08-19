const database = require('../config/database-postgres');

class LeaveRequest {
  static async create(leaveData) {
    const { employee_id, leave_type, start_date, end_date, reason } = leaveData;
    
    // Calculate number of days (excluding weekends)
    const days_requested = this.calculateWorkingDays(new Date(start_date), new Date(end_date));

    const query = `
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    try {
      const result = await database.query(query, [employee_id, leave_type, start_date, end_date, days_requested, reason]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT 
        lr.*,
        e.name as employee_name,
        e.email as employee_email,
        e.department as employee_department,
        approver.name as approved_by_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE lr.id = $1
    `;
    
    try {
      const result = await database.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmployeeId(employeeId, status = null) {
    let query = `
      SELECT 
        lr.*,
        e.name as employee_name,
        approver.name as approved_by_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE lr.employee_id = $1
    `;
    
    const params = [employeeId];
    
    if (status) {
      query += ' AND lr.status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY lr.created_at DESC';
    
    try {
      const result = await database.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT 
        lr.*,
        e.name as employee_name,
        e.email as employee_email,
        e.department as employee_department,
        approver.name as approved_by_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN employees approver ON lr.approved_by = approver.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (filters.status) {
      paramCount++;
      query += ` AND lr.status = $${paramCount}`;
      params.push(filters.status);
    }
    
    if (filters.department) {
      paramCount++;
      query += ` AND e.department = $${paramCount}`;
      params.push(filters.department);
    }
    
    if (filters.leave_type) {
      paramCount++;
      query += ` AND lr.leave_type = $${paramCount}`;
      params.push(filters.leave_type);
    }

    if (filters.start_date && filters.end_date) {
      paramCount++;
      query += ` AND lr.start_date >= $${paramCount}`;
      params.push(filters.start_date);
      
      paramCount++;
      query += ` AND lr.end_date <= $${paramCount}`;
      params.push(filters.end_date);
    }
    
    query += ' ORDER BY lr.created_at DESC';
    
    try {
      const result = await database.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, approvedBy, comments = null) {
    const query = `
      UPDATE leave_requests 
      SET status = $1, 
          approved_by = $2, 
          approved_at = CURRENT_TIMESTAMP,
          comments = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    try {
      const result = await database.query(query, [status, approvedBy, comments, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async checkOverlappingRequests(employeeId, startDate, endDate, excludeId = null) {
    let query = `
      SELECT * FROM leave_requests 
      WHERE employee_id = $1 
      AND status IN ('pending', 'approved')
      AND (
        (start_date <= $2 AND end_date >= $2) OR
        (start_date <= $3 AND end_date >= $3) OR
        (start_date >= $2 AND end_date <= $3)
      )
    `;
    
    const params = [employeeId, startDate, endDate];
    
    if (excludeId) {
      query += ' AND id != $4';
      params.push(excludeId);
    }

    try {
      const result = await database.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getLeaveStats(year = null) {
    const currentYear = year || new Date().getFullYear();
    
    const query = `
      SELECT 
        e.department,
        lr.leave_type,
        lr.status,
        COUNT(*) as request_count,
        SUM(lr.days_requested) as total_days,
        AVG(lr.days_requested) as avg_days_per_request
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE EXTRACT(YEAR FROM lr.start_date) = $1
      GROUP BY e.department, lr.leave_type, lr.status
      ORDER BY e.department, lr.leave_type, lr.status
    `;
    
    try {
      const result = await database.query(query, [currentYear]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static calculateWorkingDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // Monday = 1, Friday = 5 (excluding weekends)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  static validateLeaveRequest(employeeId, leaveType, startDate, endDate, reason) {
    const errors = [];

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start > end) {
      errors.push('End date must be after start date');
    }

    if (start < today.setHours(0, 0, 0, 0)) {
      errors.push('Cannot apply for leave in the past');
    }

    // Minimum notice validation (3 days for annual leave)
    if (leaveType === 'annual') {
      const minNoticeDate = new Date();
      minNoticeDate.setDate(today.getDate() + 3);
      
      if (start < minNoticeDate) {
        errors.push('Annual leave requires at least 3 days notice');
      }
    }

    // Maximum duration validation
    const duration = this.calculateWorkingDays(start, end);
    
    if (duration > 30) {
      errors.push('Leave duration cannot exceed 30 working days');
    }

    if (duration < 1) {
      errors.push('Leave duration must be at least 1 working day');
    }

    // Reason validation
    if (!reason || reason.trim().length < 5) {
      errors.push('Reason must be at least 5 characters long');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      workingDays: duration
    };
  }

  static async getPendingRequestsCount() {
    const query = 'SELECT COUNT(*) as count FROM leave_requests WHERE status = $1';
    
    try {
      const result = await database.query(query, ['pending']);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw error;
    }
  }

  static async getUpcomingLeaves(days = 7) {
    const query = `
      SELECT 
        lr.*,
        e.name as employee_name,
        e.department as employee_department
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.status = 'approved'
      AND lr.start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
      ORDER BY lr.start_date
    `;
    
    try {
      const result = await database.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LeaveRequest;
