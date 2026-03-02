# Quick Start Guide

## Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update with your database credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=savings_loans_db
DB_HOST=localhost
DB_PORT=5432
POST_URL=postgresql://your_db_user:your_db_password@localhost:5432/savings_loans_db

JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_ACCESS_EXPIRY=15m

PORT=4000
NODE_ENV=development
```

### 3. Create Database
```bash
# Using psql
createdb savings_loans_db

# Or using SQL
psql -U postgres -c "CREATE DATABASE savings_loans_db;"
```

### 4. Run Migrations
```bash
# Make sure sequelize-cli is installed globally or use npx
npx sequelize-cli db:migrate
```

You should see output like:
```
== 20260213012043-users: migrating =======
Creating users table...
== 20260213012043-users: migrated (0.xxx s)

== 20260220162252-refresh-tokens: migrating =======
Creating refresh_tokens table...
== 20260220162252-refresh-tokens: migrated (0.xxx s)

...
```

### 5. Start Server
```bash
npm start
```

You should see:
```
Database connection established successfully
Server is running on port 4000
Environment: development
```

### 6. Test API
```bash
# Health check
curl http://localhost:4000/health

# Register a user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "0241234567",
    "password": "securePassword123",
    "dateOfBirth": "1990-01-01",
    "ghanaCardNo": "GHA-123456789-0"
  }'
```

## Common Issues

### Migration Errors
- **Error: "relation already exists"** - Tables already exist. Use `npx sequelize-cli db:migrate:undo:all` to rollback, then migrate again.
- **Error: "column does not exist"** - Check that migrations ran in correct order.

### Database Connection Errors
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env` file
- Ensure database exists: `psql -l | grep savings_loans_db`

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Use a strong secret (minimum 32 characters)

## Next Steps
1. Review `IMPLEMENTATION_SUMMARY.md` for API documentation
2. Test endpoints using Postman or curl
3. Add input validation (express-validator recommended)
4. Set up production environment variables
