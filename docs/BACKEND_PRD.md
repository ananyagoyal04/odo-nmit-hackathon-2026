# ⚙️ Backend Product Requirement Document (PRD)
## Odoo Workforce — Multi-Tenant HR Management System

**Document Version:** 1.0.0  
**Product Name:** Odoo Workforce REST API & Database Engine  
**Target Platform:** Node.js / Express / MySQL / Vercel Serverless  
**Author:** Product & Backend Engineering Team  
**Status:** Approved / Production-Ready  
**Related Documents:** [Frontend PRD](./FRONTEND_PRD.md)

---

## 1. Executive Summary & Architecture Overview

### 1.1 System Architecture
Odoo Workforce Backend is a multi-tenant RESTful API engine engineered in **Node.js (Express)** backed by a **Native MySQL Connection Pool** with handcrafted parameterized SQL queries. It eliminates ORM bloat, ensures sub-millisecond query execution, and enforces multi-tenant isolation at the database query layer.

```
                           ┌──────────────────────────────┐
                           │      React Vite Client       │
                           └──────────────┬───────────────┘
                                          │ HTTPS / REST (JWT)
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Express API Gateway                                    │
│  ┌────────────────────┬────────────────────┬────────────────────┬───────────────────┐  │
│  │   CORS / Helmet    │  Rate Limit / Sec  │  Audit Logger      │ Error Middleware  │  │
│  └────────────────────┴────────────────────┴────────────────────┴───────────────────┘  │
│                                         │                                              │
│  ┌─────────────────┬────────────────────┼───────────────────┬───────────────────────┐  │
│  │  Auth Router    │  Employee Router   │ Attendance Router │  TimeOff Router       │  │
│  │  Salary Router  │  Department Router │ Expense Router    │  Goal & Announce Router│  │
│  └─────────────────┴────────────────────┼───────────────────┴───────────────────────┘  │
│                                         │                                              │
│  ┌──────────────────────────────────────┴───────────────────────────────────────────┐  │
│  │                      Parameterized SQL DAO Layer (`queries.js`)                  │  │
│  │                 (Anti-SQL Injection, Atomic Sequence Counters)                   │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
└─────────────────────────────────────────┼──────────────────────────────────────────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
          ┌───────────────────────────┐       ┌───────────────────────────┐
          │     MySQL 8.0 Engine      │  OR   │ Pure SQL In-Memory Engine │
          │   (Production Relational) │       │ (Zero-Config / Fallback)  │
          └───────────────────────────┘       └───────────────────────────┘
```

### 1.2 Core Architectural Principles
1. **Zero ORM Overhead**: Direct parameterized SQL using `mysql2/promise` with automatic placeholder (`?`) mapping.
2. **Multi-Tenant Scoping**: All tenant queries require explicit `company_id` filters, preventing cross-tenant data leaks.
3. **Atomic Identifier Generation**: Concurrency-safe, race-condition-free sequential ID generation (`counters` table with `ON DUPLICATE KEY UPDATE seq = seq + 1`).
4. **Dual Engine Reliability**: Primary MySQL connection pool with an automatic zero-config In-Memory pure SQL execution engine for standalone testing and instant serverless deployment.

---

## 2. Multi-Tenant Database Schema & Entity Relationship DDL

The database consists of **11 relational tables** designed for high write throughput and indexed lookups.

### 2.1 Complete Relational Schema (DDL)

```sql
-- 1. COMPANIES (Tenant Master)
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  company_code VARCHAR(10) UNIQUE NOT NULL,
  logo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. COUNTERS (Atomic Sequence Generator for Login IDs)
CREATE TABLE IF NOT EXISTS counters (
  id VARCHAR(64) PRIMARY KEY, -- Formatted as: '{COMPANY_CODE}_{YY}'
  seq INT DEFAULT 0
);

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_id VARCHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dept_company (company_id)
);

-- 4. USERS (Employees & Admins)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  login_id VARCHAR(64) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) DEFAULT '',
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) DEFAULT '',
  role VARCHAR(20) DEFAULT 'EMPLOYEE', -- 'SUPER_ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE'
  department_id VARCHAR(36),
  designation VARCHAR(150) DEFAULT '',
  employee_code VARCHAR(50) DEFAULT '',
  joining_date DATE NOT NULL,
  location VARCHAR(255) DEFAULT '',
  status VARCHAR(20) DEFAULT 'present',
  gender VARCHAR(20) DEFAULT '',
  dob DATE,
  marital_status VARCHAR(20) DEFAULT '',
  nationality VARCHAR(50) DEFAULT 'Indian',
  address TEXT,
  personal_email VARCHAR(255) DEFAULT '',
  bank_name VARCHAR(100) DEFAULT '',
  account_number VARCHAR(50) DEFAULT '',
  ifsc VARCHAR(20) DEFAULT '',
  pan VARCHAR(20) DEFAULT '',
  uan VARCHAR(30) DEFAULT '',
  about TEXT,
  job_description TEXT,
  hobbies TEXT,
  skills TEXT,
  certifications TEXT,
  monthly_wage DECIMAL(12, 2) DEFAULT 0,
  avatar_color VARCHAR(20) DEFAULT '#e09f67',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_company (company_id),
  INDEX idx_user_login (login_id),
  INDEX idx_user_email (email)
);

-- 5. ATTENDANCES
CREATE TABLE IF NOT EXISTS attendances (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  date VARCHAR(10) NOT NULL, -- Format: 'YYYY-MM-DD'
  check_in DATETIME,
  check_out DATETIME,
  total_work_hours DECIMAL(5, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'present', -- 'present' | 'late' | 'half_day' | 'absent'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_att_emp_date (employee_id, date),
  INDEX idx_att_company (company_id)
);

-- 6. TIME OFFS (Leave Requests)
CREATE TABLE IF NOT EXISTS time_offs (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  leave_type VARCHAR(20) NOT NULL, -- 'paid' | 'sick' | 'unpaid'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  approved_by VARCHAR(36),
  approved_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timeoff_emp (employee_id),
  INDEX idx_timeoff_company (company_id)
);

-- 7. LEAVE BALANCES
CREATE TABLE IF NOT EXISTS leave_balances (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  pto_total INT DEFAULT 24,
  pto_used INT DEFAULT 0,
  sick_total INT DEFAULT 10,
  sick_used INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lb_emp (employee_id)
);

-- 8. EXPENSES (Reimbursements)
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'Other',
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'disbursed'
  approved_by VARCHAR(36),
  approved_at DATETIME,
  rejection_reason TEXT,
  receipt_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_exp_emp (employee_id),
  INDEX idx_exp_company (company_id)
);

-- 9. GOALS (OKR Management)
CREATE TABLE IF NOT EXISTS goals (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  quarter VARCHAR(20) DEFAULT 'Q3 2026',
  progress INT DEFAULT 0, -- 0 to 100
  category VARCHAR(100) DEFAULT 'Engineering',
  status VARCHAR(50) DEFAULT 'on_track', -- 'on_track' | 'at_risk' | 'completed'
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_goal_emp (employee_id),
  INDEX idx_goal_company (company_id)
);

-- 10. ANNOUNCEMENTS (Company Bulletin)
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  pinned BOOLEAN DEFAULT FALSE,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ann_company (company_id)
);

-- 11. AUDIT LOGS (Compliance & Security)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  actor_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100),
  target_id VARCHAR(36),
  metadata TEXT,
  ip VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_company (company_id)
);
```

---

## 3. Core Business Logic Engines

### 3.1 Atomic Concurrency-Safe Login ID Generator
To eliminate race conditions when generating sequential identifiers (e.g., `OI220001`, `OI220002`):
```sql
INSERT INTO counters (id, seq) 
VALUES ('OI_26', 1) 
ON DUPLICATE KEY UPDATE seq = seq + 1;
```
Resulting ID format: `{COMPANY_CODE}{YEAR_2_DIGITS}{SEQUENCE_PADDED_4_DIGITS}` (e.g. `OI` + `26` + `0001` = `OI260001`).

### 3.2 Automated Statutory Payroll & CTC Engine
Calculates statutory breakdown for any given Monthly Base Wage / Annual CTC:
- **Basic Pay**: $50\%$ of Gross Monthly Wage
- **House Rent Allowance (HRA)**: $50\%$ of Basic Pay ($25\%$ of Gross Wage)
- **Special Allowance**: Gross Wage - (Basic + HRA + Conveyance + Medical)
- **Provident Fund (PF)**: $12\%$ of Basic Pay
- **Professional Tax (PT)**: Flat ₹200 / month
- **Net Take-Home**: $\text{Gross Wage} - (\text{PF} + \text{PT} + \text{TDS})$

### 3.3 Biometric Attendance & Duration Engine
- On `clockIn`: Validates no active open punch for today; records `check_in = CURRENT_TIMESTAMP`, `status = 'present'`.
- On `clockOut`: Validates existing punch; records `check_out = CURRENT_TIMESTAMP`, computes exact difference in decimal hours:
  $$\text{total\_work\_hours} = \frac{\text{check\_out} - \text{check\_in}}{3600 \text{ seconds}}$$

### 3.4 Leave Balance & Deduction State Machine
- When a leave request is approved by HR/Manager:
  - Validates `days <= (pto_total - pto_used)` (for Paid Leave) or `days <= (sick_total - sick_used)` (for Sick Leave).
  - Atomically increments `pto_used = pto_used + days` or `sick_used = sick_used + days`.
  - Emits audit log entry and notifies requester.

---

## 4. Complete REST API Specifications

### Base URL: `/api`
Standard Headers: `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`

| Module | Method | Endpoint | Access Control | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticates employee/manager using Login ID or Email + Password. |
| **Auth** | `POST` | `/api/auth/admin-login` | Public | Authenticates elevated roles (SUPER_ADMIN, HR). |
| **Auth** | `POST` | `/api/auth/register` | Public | Creates new company tenant and root Super Admin. |
| **Auth** | `GET` | `/api/auth/me` | Authenticated | Returns currently authenticated user context and company metadata. |
| **Auth** | `POST` | `/api/auth/change-password` | Authenticated | Updates current user password after verifying existing hash. |
| **Employees**| `GET` | `/api/employees` | Authenticated | Lists all company employees (Supports search, filter by dept/role). |
| **Employees**| `POST` | `/api/employees` | SUPER_ADMIN, HR | Creates new employee with auto-generated Login ID and leave balance. |
| **Employees**| `GET` | `/api/employees/:id` | Authenticated | Returns complete employee profile dossier. |
| **Employees**| `PUT` | `/api/employees/:id` | SUPER_ADMIN, HR, Self* | In-place update of profile fields (*Self can only update bio/contact). |
| **Employees**| `DELETE`| `/api/employees/:id` | SUPER_ADMIN | Soft/Hard deactivation of employee. |
| **Salary** | `GET` | `/api/employees/:id/salary` | SUPER_ADMIN, HR, Self | Returns statutory CTC salary breakdown. |
| **Salary** | `PUT` | `/api/employees/:id/salary` | SUPER_ADMIN, HR | Updates monthly wage and recalibrates structure. |
| **Salary** | `GET` | `/api/employees/:id/salary/payslip` | SUPER_ADMIN, HR, Self | Generates printable payslip payload for specified month/year. |
| **Attendance**| `POST` | `/api/attendance/clock-in` | Authenticated | Records timestamped punch-in. |
| **Attendance**| `POST` | `/api/attendance/clock-out` | Authenticated | Records timestamped punch-out and computes hours. |
| **Attendance**| `GET` | `/api/attendance/today` | Authenticated | Returns current user's punch status for today. |
| **Attendance**| `GET` | `/api/attendance/history` | Authenticated | Returns personal or company-wide punch logs. |
| **Attendance**| `GET` | `/api/attendance/heatmap` | Authenticated | Returns month-level status array for attendance heatmap. |
| **Time Off** | `POST` | `/api/timeoff/request` | Authenticated | Submits new leave application. |
| **Time Off** | `GET` | `/api/timeoff/my-leaves` | Authenticated | Returns leave history for calling user. |
| **Time Off** | `GET` | `/api/timeoff/balances` | Authenticated | Returns remaining PTO and Sick Leave balances. |
| **Time Off** | `GET` | `/api/timeoff/all` | SUPER_ADMIN, HR, MANAGER | Returns all pending and past leave applications in tenant. |
| **Time Off** | `PATCH`| `/api/timeoff/:id/status` | SUPER_ADMIN, HR, MANAGER | Approves or rejects leave with justification. |
| **Departments**| `GET`| `/api/departments` | Authenticated | Lists all departments with employee counts and manager names. |
| **Departments**| `POST`| `/api/departments` | SUPER_ADMIN, HR | Creates new department. |
| **Departments**| `PUT` | `/api/departments/:id` | SUPER_ADMIN, HR | Updates department name, manager, or description. |
| **Departments**| `DELETE`| `/api/departments/:id` | SUPER_ADMIN | Deletes department. |
| **Expenses** | `GET` | `/api/expenses` | Authenticated | Lists personal (or all if HR/Admin) expense claims. |
| **Expenses** | `POST` | `/api/expenses` | Authenticated | Submits expense claim with receipt URL. |
| **Expenses** | `PATCH`| `/api/expenses/:id/status` | SUPER_ADMIN, HR, MANAGER | Approves, rejects, or marks claim disbursed. |
| **Goals** | `GET` | `/api/goals` | Authenticated | Lists OKR goals filtered by employee or quarter. |
| **Goals** | `POST` | `/api/goals` | Authenticated | Creates new OKR objective. |
| **Goals** | `PATCH`| `/api/goals/:id/progress` | Authenticated | Updates progress percentage (0-100%) and status. |
| **Announcements**| `GET`| `/api/announcements` | Authenticated | Returns company announcements sorted by pinned status. |
| **Announcements**| `POST`| `/api/announcements` | SUPER_ADMIN, HR | Creates new broadcast bulletin. |
| **Audit Logs** | `GET` | `/api/audit-logs` | SUPER_ADMIN | Returns chronologically ordered security audit trails. |
| **Health** | `GET` | `/api/health` | Public | Healthcheck endpoint reporting uptime and service status. |

---

## 5. Security, Middleware & Non-Functional Requirements

### 5.1 Security Architecture
- **Password Security**: Passwords hashed with `bcryptjs` (Cost factor = 10).
- **JWT Authorization**: Signed using `JWT_SECRET` with configurable expiry (`7d`).
- **SQL Injection Prevention**: $100\%$ parameterized queries using `?` positional parameters.
- **RBAC Middleware**: Strict role validation (`requireRoles(['SUPER_ADMIN', 'HR'])`).

### 5.2 Error Handling & Response Contract
All API responses adhere to a consistent JSON contract:

**Success Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response (HTTP 400/401/403/404/500):**
```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "ERROR_CODE_OR_STACK"
}
```

---

## 6. Deployment & Runtime Configuration

### 6.1 Environment Variables
```ini
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=odoo_user
MYSQL_PASSWORD=odoo_secure_password
MYSQL_DATABASE=odoo_workforce
CORS_ORIGIN=*
```

### 6.2 Deployment Topology
- **Vercel Serverless Function**: Mounted via `/api/index.js` handling microservice invocations with pure SQL fallback.
- **Dedicated Node.js Process**: Run via `node src/server.js` with auto-reconnecting MySQL connection pool.
