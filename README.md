# 🚀 Symplora Leave Management System

A modern, scalable leave management system built with React, Node.js, and PostgreSQL. Designed to handle employee growth from 50 to 500+ employees with enterprise-grade architecture.

## ✨ Features

- **📊 Dashboard**: Real-time statistics and overview
- **👥 Employee Management**: Add, edit, and manage employee records
- **📝 Leave Requests**: Submit, approve, and track leave requests
- **📈 Analytics**: Department-wise reports and insights
- **🔐 Authentication**: JWT-based secure authentication
- **📱 Responsive Design**: Mobile-first approach with Material-UI
- **🚀 Scalable Architecture**: Built for growth and performance

## 🏗️ System Architecture

```
Frontend (React + Material-UI) 
    ↓ HTTP/HTTPS
Backend (Node.js + Express) 
    ↓ Database Queries
Database (PostgreSQL + Redis)
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **PostgreSQL** 15+ (or SQLite for development)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/Sonal-Jaiswal/Symplora-Task.git
cd Symplora-Task
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.template .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/symplora
# JWT_SECRET=your_secret_key

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 4. Database Setup

```bash
# PostgreSQL
psql -U postgres
CREATE DATABASE symplora;
CREATE USER symplora_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE symplora TO symplora_user;

# Or use the provided script
cd backend
node scripts/initDatabase.js
```

### 5. Load Demo Data

Visit `http://localhost:3001/api/quick-setup` to load sample Indian employee data.

## 🐳 Docker Development

### Using Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Individual Services

```bash
# Backend only
docker-compose -f docker-compose.dev.yml up backend

# Database only
docker-compose -f docker-compose.dev.yml up postgres
```

## 🚀 Deployment

### Option 1: Render (Recommended - Free)

1. **Fork/Clone** this repository
2. **Connect** to Render
3. **Deploy** using `render.yaml` configuration
4. **Set environment variables** in Render dashboard

```bash
# Render will automatically:
# - Build and deploy backend
# - Deploy frontend as static site
# - Provision PostgreSQL database
```

### Option 2: Vercel + Railway

#### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

#### Backend (Railway)
```bash
cd backend
railway login
railway init
railway up
```

### Option 3: Heroku

```bash
# Backend
cd backend
heroku create symplora-backend
heroku addons:create heroku-postgresql:mini
git push heroku main

# Frontend
cd frontend
heroku create symplora-frontend
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static
git push heroku main
```

## 🔧 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/symplora
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Add new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Leave Requests
- `GET /api/leave-requests` - List all leave requests
- `POST /api/leave-requests` - Submit new leave request
- `PATCH /api/leave-requests/:id/status` - Approve/reject request

### System
- `GET /api/health` - Health check
- `POST /api/quick-setup` - Load demo data

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📈 Scaling Strategy

### Current (50 Employees)
- Single server architecture
- SQLite/PostgreSQL database
- Basic caching

### Target (500 Employees)
- Load balancer (Nginx)
- Multiple backend instances
- Database read replicas
- Redis caching layer
- CDN for static assets

### Implementation Steps
1. **Phase 1**: Add Redis caching
2. **Phase 2**: Implement load balancing
3. **Phase 3**: Database scaling
4. **Phase 4**: Microservices architecture

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Prevent SQL injection and XSS
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request security
- **Password Hashing**: Bcrypt encryption
- **Audit Logging**: Track all system activities

## 📱 Mobile Support

- **Responsive Design**: Mobile-first approach
- **PWA Ready**: Progressive Web App capabilities
- **Touch Optimized**: Mobile-friendly interactions
- **Offline Support**: Service worker implementation

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: WebP format and lazy loading
- **Caching Strategy**: Browser and service worker caching
- **Database Indexing**: Optimized query performance

## 🔍 Monitoring & Logging

### Application Monitoring
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: Automatic error reporting
- **User Analytics**: Usage patterns and behavior

### Infrastructure Monitoring
- **Server Health**: CPU, memory, disk usage
- **Database Performance**: Query execution times
- **Network Latency**: API response times

## 📚 API Documentation

### Swagger/OpenAPI
```bash
# Access API docs
http://localhost:3001/api-docs
```

### Postman Collection
Import `postman_collection.json` for API testing.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Commit** your changes
4. **Push** to the branch
5. **Create** a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U symplora_user -d symplora -h localhost
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :3001
lsof -i :5173

# Kill process if needed
kill -9 <PID>
```

#### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📋 Assumptions

1. **User Growth**: Linear growth from 50 to 500 employees over 2-3 years
2. **Geographic Distribution**: Single office location initially
3. **Data Volume**: Moderate growth in leave requests
4. **Compliance**: Basic HR compliance requirements
5. **Budget**: Limited initial budget, scaling costs justified by growth

## 🎯 Potential Improvements

### Short Term (1-3 months)
- [ ] Implement Redis caching
- [ ] Add comprehensive logging
- [ ] Set up monitoring dashboards
- [ ] Implement automated testing
- [ ] Add email notifications

### Medium Term (3-6 months)
- [ ] Microservices architecture
- [ ] Message queues (RabbitMQ)
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

### Long Term (6+ months)
- [ ] Machine learning for leave prediction
- [ ] Integration with HR systems
- [ ] Advanced reporting and BI tools
- [ ] Multi-tenant architecture
- [ ] Internationalization (i18n)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Sonal Jaiswal
- **Project**: Symplora Leave Management System
- **Contact**: [Your Contact Information]

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- Express.js community for the robust backend framework
- PostgreSQL for the reliable database system
- Vite for the fast build tooling

---

**⭐ Star this repository if you find it helpful!**

**🚀 Ready to scale your leave management system? Start with Symplora!**
