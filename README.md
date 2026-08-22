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

* **Frontend Application**: `http://localhost:5173`
* **Admin Portal**: `http://localhost:5173/admin/login`
* **Employee Portal**: `http://localhost:5173/login`
* **Backend REST API**: `http://localhost:5000/api`

---

## 🔑 Demo Credentials

| Role                                    | Portal         | Identifier (Login ID or Email)                | Password       |
| --------------------------------------- | -------------- | --------------------------------------------- | -------------- |
| 👑 **Super Admin (Rajesh Sharma)**      | `/admin/login` | `OI220001` or `admin@odooindia.com`           | `Password@123` |
| 🛡️ **HR Manager (Priya Patel)**        | `/admin/login` | `OI220002` or `hr@odooindia.com`              | `Password@123` |
| 👩‍💻 **Sr Engineer (Shruthika Dutta)** | `/login`       | `OI220003` or `shruthika.dutta@odooindia.com` | `Password@123` |
| 🎨 **Lead Designer (Aarav Mehta)**      | `/login`       | `OI230004` or `aarav.mehta@odooindia.com`     | `Password@123` |

---

## 🌟 Key Features

### 1. 🗄️ Native MySQL Engine & Parameterized SQL DAO

* Zero third-party API dependencies.
* Pure SQL queries for `companies`, `departments`, `users`, `attendances`, `time_offs`, `leave_balances`, `announcements`, `expenses`, `goals`, and `audit_logs`.
* Includes automatic DDL schema initialization and pure SQL fallback engine.

### 2. 🌀 3D Continuous Revolving Architectural Workspace

* 3D spatial canvas with mouse gyro parallax.
* Six high-resolution workspace modules.
* Interactive architectural-style dashboard experience.

### 3. 🎨 5-Theme Global Switcher Engine

Choose between:

* ☕ Warm Espresso *(Default)*
* 🌹 Sunset Rose
* 🌌 Midnight Tech
* 🌿 Emerald Forest
* 📰 Editorial Paper

### 4. ✏️ Employee In-Place Editor & Profile Customizer

* Real-time editing of user roles.
* Update salaries and designations.
* Modify departments.
* Customize employee portrait photos.

### 5. 💰 Automated Salary Engine & 1-Click Printable Payslips

* Automated statutory CTC breakdown.
* Basic Salary — 50%
* HRA — 25%
* Conveyance
* Medical
* Special Allowance
* PF — 12%
* Professional Tax
* One-click printable payslips.

### 6. ⏱️ Real-Time Attendance Tracker

* Live work-session timer.
* Active green pulse indicator.
* Monthly attendance heatmap.
* Real-time attendance tracking.

### 7. 📢 Company Notice Board, Expenses & OKR Goals

* Interactive company notice board.
* Employee reimbursement and expense claims.
* Expense approval workflow.
* OKR goal management.
* Interactive goal-progress sliders.

---

## 🚀 Deployment

The **Odoo Workforce HR Management System is deployed on Vercel** and is available as a production web application.

**Deployment Platform:** Vercel
**Application Type:** Full-stack HR Management System
**Frontend:** React + Vite
**Backend:** Node.js + Express
**Database:** Native MySQL

🌐 **Live Deployment:** *Deployed on Vercel*
