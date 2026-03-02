# Savings & Loans API (Node.js, Express, Sequelize, PostgreSQL)

## Overview

This project is a **Savings & Loans API** for a Ghanaian financial institution, built with:
- **Node.js + Express**
- **Sequelize + PostgreSQL**
- **JWT authentication with access + refresh tokens**
- **Role-based authorization** (`customer`, `loan_officer`, `admin`)

It supports:
- Customer onboarding and authentication
- Savings accounts (create, deposit, withdraw, view)
- Loans (apply, approve, disburse, repay, view)
- Unified transactions history
- Audit logging foundation

---

## 1. Prerequisites

- **Node.js** v14+ (LTS recommended)
- **PostgreSQL** v12+
- **npm** or **yarn**

---

## 2. Project Setup

### 2.1. Install dependencies

```bash
npm install
```

### 2.2. Environment variables

Copy `.env.example` to `.env` and update with your local settings:

```bash
cp .env.example .env
```

` .env` example:

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

### 2.3. Create database

```bash
# Using psql
createdb savings_loans_db

# Or via SQL
psql -U postgres -c "CREATE DATABASE savings_loans_db;"
```

### 2.4. Run migrations

```bash
npx sequelize-cli db:migrate
```

This creates:
- `users`
- `refresh_tokens`
- `savings_accounts`
- `loans`
- `transactions`
- `audit_logs`

Migrations use snake_case column names, UUID primary keys, and add **CHECK** constraints (e.g. `balance >= 0`, `amount > 0`).

### 2.5. Seed demo data

```bash
npx sequelize-cli db:seed:all
```

This seeds:
- **Admin**: `admin@savingsloans.com` / `Admin123!`
- **Loan Officer**: `loan.officer@savingsloans.com` / `Officer123!`
- **Customer**: `customer@savingsloans.com` / `Customer123!`
- 2 savings accounts for the customer
- 1 approved loan for the customer

### 2.6. Start the server

```bash
npm start
```

Expected logs:

```text
Database connection established successfully
Server is running on port 4000
Environment: development
```

Health check:

```bash
curl http://localhost:4000/health
```

---

## 3. Authentication & Authorization

### 3.1. Models

- `users`:
  - Columns: `user_id`, `first_name`, `last_name`, `other_names`, `email`, `phone_number`, `password`, `date_of_birth`, `ghana_card_no`, `ghana_card_img_url`, `role`, `is_active`, `kyc_status`, `last_login`, timestamps.
  - Unique: `email`, `phone_number`, `ghana_card_no`.
  - Passwords hashed with **bcrypt** (13 rounds).

- `refresh_tokens`:
  - Columns: `token_id`, `user_id`, `token`, `expires_at`, `is_revoked`, timestamps.
  - Foreign key: `user_id → users.user_id`.

### 3.2. JWTs

- **Access token**:
  - Short-lived (default **15 minutes**, `JWT_ACCESS_EXPIRY`).
  - Payload: `userId`, `email`, `role`.

- **Refresh token**:
  - Random 64-byte hex string stored in DB.
  - 7-day expiry (hard-coded in controller).
  - Revoked on logout or expiration.

### 3.3. Auth middleware

File: `middlewares/auth.js`

- `authenticate`:
  - Validates `Authorization: Bearer <accessToken>`.
  - Attaches `req.user` (without password).

- `authorize(...roles)`:
  - Ensures `req.user.role` is in the allowed list.

- `requireRole(...roles)`:
  - Shortcut: `[authenticate, authorize(...roles)]`.

---

## 4. API Endpoints & Usage

Base URL (local): `http://localhost:4000`

### 4.1. Authentication

#### 4.1.1. Register

- **Endpoint**: `POST /api/auth/register`
- **Auth**: Public
- **Content type**: `multipart/form-data`
- **Fields**:
  - `firstName` (string, required)
  - `lastName` (string, required)
  - `otherNames` (string, optional)
  - `email` (string, required, unique)
  - `phoneNumber` (string, required, `0` + 9 digits)
  - `password` (string, required)
  - `dateOfBirth` (YYYY-MM-DD, required)
  - `ghanaCardNo` (string, required, unique)
  - `ghanaCardImage` (file, optional, `jpg|jpeg|png|webp`, max 5MB)

**Postman setup**:
- Body → **form-data**
  - All fields above as `Text`
  - Optional: `ghanaCardImage` as `File`

**Example (no image, curl JSON-style)**:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: multipart/form-data" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "otherNames=Smith" \
  -F "email=user123@test.com" \
  -F "phoneNumber=0123456789" \
  -F "password=pass1234" \
  -F "dateOfBirth=2004-01-01" \
  -F "ghanaCardNo=GHA-00000000-0"
```

#### 4.1.2. Login

- **Endpoint**: `POST /api/auth/login`
- **Auth**: Public
- **Content type**: `application/json`

**Body**:

```json
{
  "email": "user123@test.com",
  "password": "pass1234"
}
```

**Response**:
- `user` (basic info)
- `tokens.accessToken` (use in `Authorization` header)
- `tokens.refreshToken`

#### 4.1.3. Refresh access token

- **Endpoint**: `POST /api/auth/refresh`
- **Auth**: Public (but requires valid refresh token)
- **Body**:

```json
{
  "refreshToken": "REFRESH_TOKEN_FROM_LOGIN"
}
```

**Response**:
- New `accessToken`

#### 4.1.4. Logout

- **Endpoint**: `POST /api/auth/logout`
- **Auth**: Public (but requires refresh token)
- **Body**:

```json
{
  "refreshToken": "REFRESH_TOKEN_FROM_LOGIN"
}
```

Revokes that refresh token in DB.

#### 4.1.5. Get profile

- **Endpoint**: `GET /api/auth/profile`
- **Auth**: **Bearer token required**

**Headers**:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

---

### 4.2. Savings Accounts

All these endpoints require **Authorization: Bearer <ACCESS_TOKEN>**.

#### 4.2.1. Create account

- **Endpoint**: `POST /api/savings/accounts`
- **Body**:

```json
{
  "accountType": "regular"
}
```

#### 4.2.2. Get my accounts

- **Endpoint**: `GET /api/savings/accounts`

#### 4.2.3. Get specific account

- **Endpoint**: `GET /api/savings/accounts/:accountId`

#### 4.2.4. Deposit

- **Endpoint**: `POST /api/savings/accounts/:accountId/deposit`

**Body**:

```json
{
  "amount": 1000.0,
  "description": "Initial deposit"
}
```

#### 4.2.5. Withdraw

- **Endpoint**: `POST /api/savings/accounts/:accountId/withdraw`

**Body**:

```json
{
  "amount": 500.0,
  "description": "Cash withdrawal"
}
```

Withdrawals check for **sufficient balance** and run inside a DB transaction.

---

### 4.3. Loans

All require **Bearer token**. Some require specific roles.

#### 4.3.1. Apply for loan (customer)

- **Endpoint**: `POST /api/loans/apply`

**Body**:

```json
{
  "principalAmount": 2000.0,
  "interestRate": 12.0,
  "termMonths": 12,
  "purpose": "Business capital"
}
```

#### 4.3.2. Get my loans

- **Endpoint**: `GET /api/loans/my-loans`
- Optional query: `?status=pending|approved|active|completed|defaulted|rejected`

#### 4.3.3. Get specific loan

- **Endpoint**: `GET /api/loans/:loanId`

#### 4.3.4. Approve loan (loan_officer/admin)

- **Endpoint**: `POST /api/loans/:loanId/approve`
- **Auth**: `loan_officer` or `admin` (via `requireRole("loan_officer", "admin")`)

#### 4.3.5. Disburse loan (loan_officer/admin)

- **Endpoint**: `POST /api/loans/:loanId/disburse`

**Body**:

```json
{
  "accountId": "SAVINGS_ACCOUNT_ID_TO_CREDIT"
}
```

Funds are credited to the customer’s savings account and a `loan_disbursement` transaction is created.

#### 4.3.6. Repay loan (customer)

- **Endpoint**: `POST /api/loans/:loanId/repay`

**Body**:

```json
{
  "amount": 200.0,
  "accountId": "CUSTOMER_SAVINGS_ACCOUNT_ID"
}
```

Withdraws from the given savings account, reduces remaining loan balance, and completes the loan when balance reaches 0.

---

### 4.4. Transactions

#### 4.4.1. Get transaction history

- **Endpoint**: `GET /api/transactions`
- **Query params** (all optional):
  - `accountId` – filter by specific account
  - `loanId` – filter by specific loan
  - `transactionType` – `deposit`, `withdrawal`, `loan_disbursement`, `loan_repayment`, etc.
  - `startDate`, `endDate` – ISO dates
  - `page` (default 1), `limit` (default 20)

#### 4.4.2. Get single transaction

- **Endpoint**: `GET /api/transactions/:transactionId`
- User must own the related account or loan.

---

## 5. Database & Schema Notes

- All DB columns use **snake_case**.
- JS models use **camelCase** with `underscored: true`.
- UUID primary keys via `UUIDV4`.
- Monetary amounts use `DECIMAL(15, 2)`.
- Constraints:
  - `balance >= 0` on `savings_accounts`.
  - `amount > 0` on `transactions` and `loans`.
  - Interest rate range: `0–100%`.
  - Unique: `email`, `phone_number`, `ghana_card_no`, `account_number`, `loan_number`.

Key relationships:
- `users 1→* savings_accounts`
- `users 1→* loans` (as borrower)
- `users 1→* refresh_tokens`
- `users 1→* audit_logs` (performed_by, nullable)
- `savings_accounts 1→* transactions`
- `loans 1→* transactions`
- `users` (loan_officer/admin) → `loans` (approved_by)

---

## 6. Error Handling & Common Issues

Global error middleware (`middlewares/errorHandler.js`) handles:
- Sequelize validation errors
- Unique constraint errors
- Foreign key errors
- JWT errors (invalid/expired token)

### Common issues

- **Migrations**:
  - *“relation already exists”*: run `npx sequelize-cli db:migrate:undo:all` then `db:migrate` again.
  - *“column does not exist”*: ensure all migrations ran in order and DB is clean.

- **Database connection**:
  - Check PostgreSQL is running: `pg_isready`
  - Verify `.env` matches your DB credentials
  - Confirm DB exists: `psql -l | grep savings_loans_db`

- **JWT problems**:
  - Ensure `JWT_SECRET` is set and long enough (≥ 32 chars).
  - If access token expired, use `/api/auth/refresh` with the refresh token.

---

## 7. File Structure (High-level)

```text
config/
  config.js        # Sequelize CLI config
  db.js            # Sequelize instance (POST_URL)
migrations/        # DB schema migrations
models/            # Sequelize models (users, loans, savings, transactions, etc.)
controllers/       # Route handlers (auth, savings, loans, transactions)
middlewares/       # auth, errorHandler, upload (Ghana card)
routes/            # Express routers
seeders/           # Demo seed data
server.js          # App entry point
.env.example       # Env template
README.md          # This document
```

---

## 8. Next Steps (Production Hardening)

- Add **input validation** (e.g. `express-validator` or `Joi`) on all endpoints.
- Add **rate limiting** and **CORS** configuration.
- Add **request logging** (e.g. `morgan` or Winston).
- Implement **audit logging** in controllers (write to `audit_logs`).
- Add **unit/integration tests**.
- Generate formal **OpenAPI/Swagger** docs.
- Implement **KYC checks** and account freezing logic before allowing some operations.

