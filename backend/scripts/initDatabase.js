const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory');
}


// Initialize database
require('../config/database-postgres');

console.log('Database initialization completed!');
