const database = require('../config/database-postgres');
const bcrypt = require('bcryptjs');

class User {
  static async createUsersTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'manager', 'employee')),
        employee_id INTEGER REFERENCES employees(id),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await database.query(query);
      
      // Create indexes
      await database.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await database.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
      await database.query('CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id)');
      
      console.log('✅ Users table created successfully');
    } catch (error) {
      console.error('❌ Error creating users table:', error);
      throw error;
    }
  }

  static async create(userData) {
    const { name, email, password, role = 'employee', employee_id = null } = userData;
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (name, email, password, role, employee_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, employee_id, is_active, created_at
    `;

    try {
      const result = await database.query(query, [name, email, hashedPassword, role, employee_id]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    
    try {
      const result = await database.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.employee_id, u.is_active, 
        u.last_login, u.created_at, u.updated_at,
        e.name as employee_name, e.department as employee_department
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.id = $1 AND u.is_active = true
    `;
    
    try {
      const result = await database.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.employee_id, u.is_active, 
        u.last_login, u.created_at,
        e.name as employee_name, e.department as employee_department
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.id
      WHERE u.is_active = true
      ORDER BY u.created_at DESC
    `;
    
    try {
      const result = await database.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error('Password verification failed');
    }
  }

  static async updatePassword(userId, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const query = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role
    `;

    try {
      const result = await database.query(query, [hashedPassword, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateLastLogin(userId) {
    const query = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING last_login
    `;

    try {
      const result = await database.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId, updateData) {
    const { name, email, role } = updateData;
    
    const query = `
      UPDATE users 
      SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, role, employee_id, updated_at
    `;

    try {
      const result = await database.query(query, [name, email, role, userId]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async deactivateUser(userId) {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email, is_active
    `;

    try {
      const result = await database.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async createDefaultAdmin() {
    try {
      // Check if admin already exists
      const existingAdmin = await this.findByEmail('admin@symplora.com');
      if (existingAdmin) {
        console.log('✅ Default admin user already exists');
        return existingAdmin;
      }

      // Create default admin user
      const adminUser = await this.create({
        name: 'System Administrator',
        email: 'admin@symplora.com',
        password: 'admin123', // Should be changed on first login
        role: 'admin'
      });

      console.log('✅ Default admin user created: admin@symplora.com (password: admin123)');
      return adminUser;
    } catch (error) {
      console.error('❌ Error creating default admin:', error);
      throw error;
    }
  }

  static async createHRUsers() {
    const hrUsers = [
      {
        name: 'Priya Patel',
        email: 'priya.patel@symplora.com',
        password: 'hr123',
        role: 'hr'
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@symplora.com',
        password: 'hr123',
        role: 'hr'
      }
    ];

    const createdUsers = [];

    for (const userData of hrUsers) {
      try {
        const existingUser = await this.findByEmail(userData.email);
        if (!existingUser) {
          const newUser = await this.create(userData);
          createdUsers.push(newUser);
        }
      } catch (error) {
        console.error(`Error creating HR user ${userData.email}:`, error);
        continue;
      }
    }

    if (createdUsers.length > 0) {
      console.log(`✅ Created ${createdUsers.length} HR users`);
    }

    return createdUsers;
  }
}

module.exports = User;
