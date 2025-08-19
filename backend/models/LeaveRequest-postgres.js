const database = require('../config/database-postgres');

class LeaveRequest {
  static async create(leaveData) {
    const { employee_id, leave_type, start_date, end_date, reason } = leaveData;
    
    // Convert DD/MM/YYYY to YYYY-MM-DD if needed
    const formattedStartDate = start_date.includes('/') ? 
      start_date.split('/').reverse().join('-') : 
      start_date;
    
    const formattedEndDate = end_date.includes('/') ? 
      end_date.split('/').reverse().join('-') : 
      end_date;
    
    // Calculate number of days (excluding weekends)
    const days_requested = this.calculateWorkingDays(new Date(formattedStartDate), new Date(formattedEndDate));

    const query = `
      INSERT INTO leave_requests (
        employee_id, 
        leave_type, 
        start_date, 
        end_date, 
        days_requested, 
        reason,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    try {
      const result = await database.query(query, [
        employee_id, 
        leave_type, 
        formattedStartDate, 
        formattedEndDate, 
        days_requested, 
        reason,
        'Pending'
      ]);
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
      WHERE lr.id = $1;
    `;
    
    try {
      const result = await database.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll(status = null) {
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
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE lr.status = $1';
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

  static async updateStatus(id, status, comment = null) {
    const query = `
      UPDATE leave_requests 
      SET 
        status = $1,
        comments = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;

    try {
      const result = await database.query(query, [status, comment, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static calculateWorkingDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Monday = 1, Friday = 5 (excluding weekends)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
}

module.exports = LeaveRequest;