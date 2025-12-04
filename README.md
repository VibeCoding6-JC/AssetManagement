# 🖥️ IT Asset Management System

Sistem manajemen aset IT berbasis web menggunakan React + Express.js + MySQL.

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0
- npm atau yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ProjectAssetManagement

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE it_asset_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Configure environment (backend/.env)
cp backend/.env.example backend/.env
# Edit .env with your database credentials

# Run seeder
cd backend
npm run seed
```

### Running the Application

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Staff | staff@company.com | admin123 |

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

Setiap push atau pull request ke branch `main` akan trigger CI pipeline:

1. **Backend Unit Tests** - Test dengan mock database
2. **Backend Integration Tests** - Test dengan MySQL container
3. **Frontend Tests** - Test dengan mocked API
4. **PR Comment** - Post hasil test ke Pull Request

### Branch Protection (Setup Required)

Untuk mengaktifkan blocking merge jika test gagal:

1. Buka **Settings > Branches** di GitHub repository
2. Klik **Add rule** 
3. Branch name pattern: `main`
4. Centang:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Search dan tambahkan:
       - `Backend Unit Tests`
       - `Backend Integration Tests`
       - `Frontend Tests`
   - ✅ Require branches to be up to date before merging
5. Klik **Create** atau **Save changes**

### Workflow File

```yaml
.github/workflows/ci.yml
```

---

## 📁 Project Structure

```
ProjectAssetManagement/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI workflow
├── backend/
│   ├── config/                 # Database configuration
│   ├── controllers/            # API controllers
│   ├── middleware/             # Auth & validation middleware
│   ├── models/                 # Sequelize models
│   ├── routes/                 # Express routes
│   ├── seeders/                # Database seeders
│   ├── tests/                  # Jest tests
│   │   ├── unit/              # Unit tests
│   │   ├── integration/       # Integration tests
│   │   └── helpers/           # Test utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios instance
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React contexts
│   │   ├── layouts/           # Page layouts
│   │   ├── pages/             # Page components
│   │   ├── __tests__/         # Vitest tests
│   │   └── __mocks__/         # Test mocks
│   ├── vitest.config.js
│   └── package.json
└── docs/
    └── plan.md                # Development plan
```

---

## 📊 Test Coverage Requirements

| Component | Minimum Coverage |
|-----------|------------------|
| Backend | 80% |
| Frontend | 70% |

---

## 🔧 Tech Stack

### Backend
- Express.js 5
- Sequelize ORM
- MySQL 8
- JWT Authentication
- Jest + Supertest (Testing)

### Frontend
- React 19
- React Router 7
- Tailwind CSS 4
- React Query / Axios
- Vitest + Testing Library

---

## 📝 License

MIT License
