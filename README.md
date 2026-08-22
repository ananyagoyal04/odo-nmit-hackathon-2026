# 🏛️ Odoo Workforce — Multi-Tenant HR Management System

A production-quality, multi-tenant Human Resource Management System built with **React (Vite)**, **Node.js/Express**, and a **Native MySQL Engine** with handcrafted parameterized SQL queries and a 3D architectural spatial interface.

---

## ⚡ Quick Start (Run in 2 Steps)

### 1. Install Dependencies
```bash
npm run install:all
```
*(Or simply `npm install`)*

### 2. Start Application
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Admin Portal**: `http://localhost:5173/admin/login`
- **Employee Portal**: `http://localhost:5173/login`
- **Backend REST API**: `http://localhost:5000/api`

---

## 🔑 Demo Credentials

| Role | Portal | Identifier (Login ID or Email) | Password |
|---|---|---|---|
| 👑 **Super Admin** (Rajesh Sharma) | `/admin/login` | `OI220001` or `admin@odooindia.com` | `Password@123` |
| 🛡️ **HR Manager** (Priya Patel) | `/admin/login` | `OI220002` or `hr@odooindia.com` | `Password@123` |
| 👩‍💻 **Sr Engineer** (Shruthika Dutta) | `/login` | `OI220003` or `shruthika.dutta@odooindia.com` | `Password@123` |
| 🎨 **Lead Designer** (Aarav Mehta) | `/login` | `OI230004` or `aarav.mehta@odooindia.com` | `Password@123` |

---

## 🌟 Key Features

1. **🗄️ Native MySQL Engine & Parameterized SQL DAO**:
   - Zero third-party API dependencies.
   - Pure SQL queries for `companies`, `departments`, `users`, `attendances`, `time_offs`, `leave_balances`, `announcements`, `expenses`, `goals`, and `audit_logs`.
   - Includes automatic DDL schema initialization and pure SQL fallback engine.
2. **🌀 3D Continuous Revolving Architectural Workspace**:
   - 3D spatial canvas with mouse gyro parallax and 6 high-res workspace modules.
3. **🎨 5-Theme Global Switcher Engine**:
   - Warm Espresso *(Default)*, Sunset Rose, Midnight Tech, Emerald Forest, and Editorial Paper.
4. **✏️ Employee In-Place Editor & Profile Customizer**:
   - Real-time editing of user roles, salaries, designations, departments, and portrait photos.
5. **💰 Automated Salary Engine & 1-Click Printable Payslips**:
   - Statutory CTC breakdown (Basic 50%, HRA 25%, Conveyance, Medical, Special, PF 12%, Professional Tax).
6. **⏱️ Real-Time Attendance Tracker**:
   - Live work session timer with active green pulse and monthly attendance heatmap.
7. **📢 Company Notice Board, Expenses & OKR Goals**:
   - Interactive company feed, reimbursement claims workflow, and OKR progress sliders.

---

## 🚀 Deployment (Vercel)

The React client includes `client/vercel.json` for single-page application routing.
To deploy to Vercel:
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Set Framework to `Vite`.
4. Click **Deploy**!
