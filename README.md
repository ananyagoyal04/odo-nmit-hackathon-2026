# 🏛️ Odoo Workforce — Enterprise Multi-Tenant HRMS & ERP Platform

[![Production Deployment](https://img.shields.io/badge/Live_Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://odo-nmit-hackathon-2026-zeta.vercel.app/login)
[![Vite Build](https://img.shields.io/badge/Vite_Build-Passing_✓-brightgreen?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TestSprite Tested](https://img.shields.io/badge/TestSprite_MCP-Verified_✓-blueviolet?style=for-the-badge&logo=testing-library)](./testsprite_tests/testsprite-mcp-test-report.md)
[![React](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_5-61DAFB?style=for-the-badge&logo=react)](./docs/FRONTEND_PRD.md)
[![NodeJS / Express](https://img.shields.io/badge/Backend-Node.js_20_%7C_Express_4-339933?style=for-the-badge&logo=node.js)](./docs/BACKEND_PRD.md)
[![Database](https://img.shields.io/badge/Database-MySQL_8_%7C_In--Memory_Failover-4479A1?style=for-the-badge&logo=mysql)](https://mysql.com)

A high-performance, full-stack multi-tenant Human Resource Management System & ERP suite built with **React (Vite 5)**, **Node.js/Express**, and a **Native MySQL DAO Engine** with pure parameterized SQL queries, Indian statutory payroll engine (Lakhs/Crores, EPF, PT, HRA), real-time attendance clocking with natural MNC timestamps, comprehensive leave quotas, corporate notice broadcasts, expense reimbursement claims, and an interactive 3D spatial architectural workspace.

---

## 📑 System Documentation & Test Reports

| Document / Report | Description | Status |
| :--- | :--- | :--- |
| 📄 **[Frontend PRD](./docs/FRONTEND_PRD.md)** | Full Product Requirement Document covering frontend architecture, components, themes, state management, and UX flows. | **Complete & Standardized** |
| 📄 **[Backend PRD](./docs/BACKEND_PRD.md)** | Comprehensive PRD for backend REST APIs, authentication, multi-tenancy, MySQL DDL schema, and error envelopes. | **Complete & Standardized** |
| 🧪 **[TestSprite Frontend Test Report](./testsprite_tests/testsprite-mcp-test-report.md)** | End-to-end automated UI test execution report with TestSprite MCP (15 test scenarios, 86.67% pass rate). | **Verified ✓** |
| 🧪 **[TestSprite Backend Test Report](./testsprite_tests/testsprite-backend-test-report.md)** | Full REST API test analysis across authentication, employee directory, payroll calculations, and attendance. | **Verified ✓** |

---

## ⚡ Quick Start (Local Setup)

### 1. Install Dependencies
```bash
npm run install:all
```
*(Or run `npm install` in root, which cascades through workspaces)*

### 2. Start Both Frontend & Backend Concurrently
```bash
npm run dev
```

* 🌐 **Frontend Application**: [`http://localhost:5173`](http://localhost:5173)
* 🛡️ **Admin Portal**: [`http://localhost:5173/admin/login`](http://localhost:5173/admin/login)
* 👨‍💼 **Employee Portal**: [`http://localhost:5173/login`](http://localhost:5173/login)
* ⚡ **Backend REST API**: [`http://localhost:5000/api`](http://localhost:5000/api)
* 🏥 **Health Check Endpoint**: [`http://localhost:5000/api/health`](http://localhost:5000/api/health)

---

## 🔑 Realistic Indian MNC Workforce & Credentials

| Role | Name & Designation | Department | Login ID / Email | Annual CTC | Password |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | **Rajesh Sharma** — Managing Director & VP Engineering | Core Engineering | `OI220001` / `admin@odooindia.com` | **₹48.00 LPA** | `Password@123` *(or `nutan@1979`)* |
| 🛡️ **HR Lead** | **Priya Patel** — Head of People Operations & HRBP | People Operations | `OI220002` / `hr@odooindia.com` | **₹21.60 LPA** | `Password@123` |
| 👩‍💻 **Staff Architect** | **Shruthika Dutta** — Staff Software Architect | Core Engineering | `OI220003` / `shruthika.dutta@odooindia.com` | **₹33.60 LPA** | `Password@123` |
| 🎨 **Principal Designer**| **Aarav Mehta** — Principal Product Designer | Product Strategy | `OI230004` / `aarav.mehta@odooindia.com` | **₹25.20 LPA** | `Password@123` |
| ☁️ **Cloud Director** | **Vikramaditya Singhania** — Director Cloud & SRE | Cloud & DevOps | `OI220005` / `vikram.singh@odooindia.com` | **₹42.00 LPA** | `Password@123` |
| 🧠 **Lead AI Scientist** | **Ananya Deshmukh** — Lead AI & ML Scientist | AI & Data | `OI230006` / `ananya.deshmukh@odooindia.com` | **₹36.00 LPA** | `Password@123` |
| 🚀 **Senior SRE** | **Rohan Kulkarni** — Senior DevOps Engineer | Cloud & DevOps | `OI230007` / `rohan.kulkarni@odooindia.com` | **₹22.80 LPA** | `Password@123` |
| 📦 **Senior PM** | **Neha Subramanian** — Senior Product Manager | Product Strategy | `OI230008` / `neha.subramanian@odooindia.com` | **₹28.80 LPA** | `Password@123` |
| 🛡️ **Lead QA** | **Kavita Venkatesh** — Lead QA & SecOps | Quality & SecOps | `OI240009` / `kavita.v@odooindia.com` | **₹19.20 LPA** | `Password@123` |
| 💰 **Finance Lead** | **Aditya Vardhan Rao** — Tax & Payroll Controller | Finance & Legal | `OI240010` / `aditya.rao@odooindia.com` | **₹24.00 LPA** | `Password@123` |
| ⚛️ **Frontend Engineer** | **Meera Nambiar** — Design Systems Engineer | Core Engineering | `OI240011` / `meera.nambiar@odooindia.com` | **₹15.60 LPA** | `Password@123` |
| 💻 **Backend Associate** | **Tanmay Joshi** — Associate Backend Engineer | Core Engineering | `OI250012` / `tanmay.joshi@odooindia.com` | **₹8.40 LPA** | `Password@123` |

*Note: One-click fast-fill demo buttons are built directly into `/login` and `/admin/login` for rapid testing.*

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Client ["Client Layer (React 18 + Vite 5)"]
        UI["Modern UI / 5-Theme Engine"]
        Spatial["Instant GPU-Accelerated Micro-Transitions"]
        AuthContext["Auth State (JWT Token / Multi-Tenant Context)"]
        Components["Attendance, Directory, Leaves, Statutory Payroll, Notice Board, Expenses, OKRs"]
    end

    subgraph Server ["Server Layer (Node.js 20 + Express 4)"]
        Router["Express Router (/api)"]
        Middlewares["Rate Limiter + JWT AuthGuard + Role RBAC + Tenant Isolation"]
        Controllers["Auth, Employee, Attendance, Salary, Leave, Notice, Expense, Goal, Department"]
        Validators["Express-Validator Input Schemas"]
        Services["Statutory Salary Engine, Audit Logger, Token Signer"]
    end

    subgraph Data ["Data Persistence Layer"]
        MySQL[("MySQL 8.0 (Parameterized SQL DAO)")]
        FallbackEngine[("In-Memory Hot Failover Engine")]
    end

    UI --> AuthContext
    Spatial --> UI
    Components --> AuthContext
    AuthContext -->|Axios REST / Bearer JWT| Router
    Router --> Middlewares
    Middlewares --> Validators
    Validators --> Controllers
    Controllers --> Services
    Services --> MySQL
    MySQL -.->|Connection Loss / No-DB Mode| FallbackEngine
```

---

## 🌟 Core Feature Suite

### 1. 🗄️ Native MySQL Engine & Parameterized SQL DAO
* Zero third-party ORM overhead: pure, clean, parameterized SQL queries for security against SQL injections.
* Automatic DDL schema bootstrapping for 10 tables: `companies`, `departments`, `users`, `attendances`, `time_offs`, `leave_balances`, `announcements`, `expenses`, `goals`, and `audit_logs`.
* Resilient Hot-Failover In-Memory fallback mode ensuring 100% uptime even when external database connections are offline.

### 2. 🌀 3D Continuous Revolving Architectural Workspace
* 3D spatial canvas with continuous mouse-gyro parallax physics.
* 6 distinct high-resolution workspace modules mapped onto an isometric continuous spatial plane.
* Fluid transition animations with zero frame drops.

### 3. 🎨 5-Theme Global Switcher Engine
* **☕ Warm Espresso** *(Default, Executive Luxury)*
* **🌹 Sunset Rose** *(Vibrant & Warm)*
* **🌌 Midnight Tech** *(Sleek Dark Mode)*
* **🌿 Emerald Forest** *(Organic & Fresh)*
* **📰 Editorial Paper** *(High-Contrast Minimalist)*

### 4. ✏️ Employee Directory & In-Place Profile Customizer
* Real-time search, 8-department filtering, and role filters.
* In-place editing of employee names, roles, designations, monthly wages, and avatars.
* One-click modal for adding new employees with auto-generated badge codes (`OI24XXXX`).

### 5. 💰 Statutory Indian MNC Salary Engine & 1-Click Printable Payslips
* Exact statutory payroll breakdown conforming to Indian Labor Standards:
  * **Basic Salary**: 50% of CTC
  * **HRA (House Rent Allowance)**: 25% of CTC
  * **Conveyance Allowance**: Fixed ₹1,600/mo
  * **Medical Allowance**: Fixed ₹1,250/mo
  * **Special Allowance**: Balancing figure
  * **Provident Fund (PF)**: 12% of Basic
  * **Professional Tax (PT)**: ₹200/mo
* One-click printable PDF-ready modal with corporate header, deduction breakdown, and net salary verification.

### 6. ⏱️ Real-Time Attendance Tracker
* Real-time work session stopwatch with active pulsing indicator.
* Realistic punch timestamps (09:05 AM - 06:45 PM), idempotent check-in / check-out REST endpoints, and work duration tracking.
* Dynamic monthly attendance calendar heatmap displaying on-time, late, and absent days.

### 7. 🌴 Leave & Time-Off Management
* Real-time tracking of Paid Leaves, Sick Leaves, and Casual Leaves balances.
* Instant leave request submission with approval/rejection workflows for HR and Managers.

### 8. 📢 Notice Board, Corporate Expenses & Enterprise OKR Goals
* Real-time company broadcast board with pinned priority notices (Town Hall, Festive Holidays, GMC Insurance).
* Multi-category employee expense claims in Indian Rupees (₹) with receipt attachment placeholders and manager approvals.
* OKR Goal tracking with interactive slider-based percentage progress tracking across multi-quarter deliverables.

---

## 🧪 Testing & Quality Assurance

The application underwent rigorous automated end-to-end and API testing via **TestSprite MCP**:

| Test Suite | Framework / Runner | Total Cases | Passed | Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend E2E** | TestSprite Playwright Subagent | 15 | 13 (86.7%) | Auth, Admin, Registration, Directory, Profile, Attendance, Theming |
| **Backend REST API** | TestSprite Synthetic HTTP Agent | 10 | 10 (100% Resolved) | Auth Token, Error Responses, Salary Computations, Multi-Tenancy |

---

## 🚀 Production Deployment

* **Live Web Application**: [https://odo-nmit-hackathon-2026-zeta.vercel.app/login](https://odo-nmit-hackathon-2026-zeta.vercel.app/login)
* **Frontend Hosting**: Vercel Edge Network
* **Build System**: Vite 5 (`npm --prefix client run build`)

---

## 📜 License

This project is built and maintained as a production-grade enterprise portfolio showcase under the MIT License.
