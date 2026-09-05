# 🎨 Frontend Product Requirement Document (PRD)
## Odoo Workforce — Multi-Tenant HR Management System

**Document Version:** 1.0.0  
**Product Name:** Odoo Workforce Web Client  
**Target Platform:** Web (Desktop, Tablet, Mobile Responsive)  
**Author:** Product & Engineering Team  
**Status:** Approved / Production-Ready  
**Related Documents:** [Backend PRD](./BACKEND_PRD.md)

---

## 1. Executive Summary & Vision

### 1.1 Product Vision
Odoo Workforce Web Client is a modern, high-performance, multi-tenant Human Resource Management System (HRMS) frontend. It bridges architectural 3D spatial design with enterprise-grade HR operations, offering frictionless workflows for employee management, biometric-style attendance, leave processing, statutory payroll computation, expense reimbursement, and OKR performance tracking.

### 1.2 Core Design Tenets
1. **Visual Brilliance & Ergonomics**: Continuous 3D revolving workspace cards, mouse gyro-parallax, glassmorphism, and seamless micro-interactions.
2. **5-Theme Dynamic Personalization**: Instant theme switching across *Warm Espresso*, *Sunset Rose*, *Midnight Tech*, *Emerald Forest*, and *Editorial Paper*.
3. **Speed & Zero Friction**: Sub-100ms client route navigation via Vite + React Router v6, optimistic UI updates, and an omni-present Command Palette (`Ctrl/Cmd + K`).
4. **Role-Gated Security**: Strict client-side RBAC (Role-Based Access Control) synchronized with JWT claims.

---

## 2. User Personas & Permissions

| Persona | Primary Needs & Goals | Core Views & Permissions |
| :--- | :--- | :--- |
| **👑 Super Admin** | Full organizational oversight, multi-tenant company settings, system audit trails, department structures, master employee database. | Complete access across all routes (`/dashboard`, `/employees`, `/payroll`, `/departments`, `/audit-logs`, `/attendance`, `/timeoff`, `/announcements`, `/expenses`, `/performance`). |
| **🛡️ HR Manager** | Employee onboarding/offboarding, statutory salary breakdowns, leave policy enforcement, expense approvals, company announcements. | Access to all HR routes (`/payroll`, `/departments`, `/employees`, `/timeoff`, `/attendance`, `/expenses`, `/announcements`). Excludes raw `/audit-logs` system internals if restricted. |
| **👩‍💼 Department Manager** | Team attendance visibility, team leave approvals, expense validation, OKR goal reviews for direct reports. | `/dashboard`, `/employees` (Directory), `/attendance`, `/timeoff` (Approval controls), `/expenses` (Approval controls), `/performance`. |
| **👩‍💻 Regular Employee** | Daily punch in/out, view payslips, request time off, submit reimbursement receipts, track personal OKR goals, update personal portfolio. | `/dashboard`, `/profile` (Self), `/attendance` (Self), `/timeoff` (Self), `/expenses` (Self), `/performance` (Self), `/announcements`. |

---

## 3. Information Architecture & Navigation

```
Public Routes:
├── /login                   (Employee & Manager Portal)
├── /admin/login             (Super Admin & HR Executive Portal)
└── /register                (Self-Serve Tenant / User Signup)

Protected Workspace (/ [Layout]):
├── /dashboard               (Executive KPI Metrics, 3D Spatial Canvas, Notice Board)
├── /profile                 (Self Profile & Editable Dossier)
├── /employees               (Directory, Search, Filter, Add Employee Modal)
├── /employees/:id           (Deep Employee Dossier, In-Place Editor, Salary & Bank Info)
├── /attendance              (Real-Time Punch Timer, Live Heatmap Calendar, Punch Logs)
├── /timeoff                 (Leave Balance Cards, Request Modal, Approval Ledger)
├── /payroll                 [Super Admin / HR] (CTC Engine, 1-Click Printable Payslip Modal)
├── /departments             [Super Admin / HR] (Department CRUD, Heads, Headcounts)
├── /expenses                (Claim Submission, Receipt Viewer, Workflow Tracker)
├── /performance             (OKR Objective Progress Sliders, Quarter Filtering)
├── /announcements           (Pinned Bulletin Board, Tag Filtering, Rich Post Creation)
└── /audit-logs              [Super Admin] (Security Trails, Action Filters, IP Inspector)
```

---

## 4. UI/UX & Design System Specifications

### 4.1 Theme Engine (CSS Custom Properties)
The application dynamically toggles `data-theme` on the `document.documentElement` with custom CSS token sets:
- **Warm Espresso** (Default): `#1c1917` base, `#d97706` / `#e09f67` amber accents, creamy card surfaces.
- **Sunset Rose**: `#1a0f14` base, `#f43f5e` / `#fb7185` rose accents, soft glowing gradients.
- **Midnight Tech**: `#030712` base, `#38bdf8` cyan / `#6366f1` indigo accents, high-contrast dark neon highlights.
- **Emerald Forest**: `#051f15` base, `#10b981` / `#34d399` emerald accents, natural lush styling.
- **Editorial Paper**: `#f8fafc` crisp white/slate canvas, sharp serif headers, ink-black text `#0f172a`, minimal high-end editorial feel.

### 4.2 3D Spatial Stage & Micro-Interactions
- **`SpatialStage.jsx` & `RevolvingFrames3D.jsx`**: CSS 3D perspective (`perspective: 1200px`), rotational transform matrix driven by mouse gyro coordinates.
- **`Tilt3DCard.jsx`**: Interactive tilt effect with dynamic specular glare highlight on mouse hover.
- **`AmbientLivingCanvas.jsx`**: Subtle background particle/mesh animation providing depth without CPU throttling.
- **`CommandPalette.jsx`**: Global spotlight modal (`Ctrl+K` / `Cmd+K`) with fuzzy search across pages, quick actions (Punch In, Apply Leave, Add Employee), and keyboard navigation (`↑`, `↓`, `Enter`, `Esc`).

---

## 5. Functional Module Specifications

### 5.1 Authentication & Onboarding
- **Split Portals**: Dedicated `/admin/login` for elevated roles and `/login` for workforce members.
- **Credential Identification**: Supports dual identifier input (`login_id` e.g., `OI220001` or corporate `email`).
- **Password Strength Analyzer**: Real-time entropy evaluation checking length, casing, numbers, and special symbols with visual colored meter.
- **Session Persistence**: JWT token stored in browser `localStorage` with automated HTTP header injection and token expiration handling.

### 5.2 Dynamic KPI Dashboard
- **Stat Cards**: Real-time aggregated counts (Total Staff, Present Today, On Leave, Pending Claims/Leaves, Monthly Payroll Run).
- **Living Attendance Widget**: Real-time timer showing elapsed session time with green pulsing state indicator.
- **Notice Board Highlights**: Pinned corporate bulletins with timestamp badges and one-click expand.

### 5.3 Employee Management & In-Place Profile Dossier
- **Directory Grid & List Views**: Fast searching by name/code/designation with department filter chips.
- **In-Place Field Editing**: Instant editing of designations, department assignment, contact info, bank details (IFSC, Account Number, PAN, UAN), and bio.
- **Avatar & Portrait Customizer**: Preset geometric color palettes + direct image URL preview.
- **Skill & Certification Tagging**: Interactive pill tags with additive input and one-click removal.

### 5.4 Real-Time Attendance Tracker
- **Single-Click Punch In / Punch Out**: Captures current browser ISO timestamp, updates active session, and logs daily duration.
- **Visual Monthly Heatmap**: Interactive calendar grid color-coding Present (Emerald), Late (Amber), Half-Day (Purple), and Absent (Rose).
- **Punch History Ledger**: Tabular audit trail with Check-In, Check-Out, and computed Total Work Hours.

### 5.5 Leave Management & Time-Off Ledger
- **Leave Quota Cards**: Visual progress rings for Paid Time Off (PTO / Casual) and Sick Leave balances.
- **Application Flow**: Date range selector, auto-computed day count, leave type dropdown, and mandatory justification note.
- **Manager Approval Actions**: Approve / Reject buttons with prompt for rejection reason, instant badge status transition (`pending` ➔ `approved` / `rejected`).

### 5.6 Automated Payroll Engine & 1-Click Printable Payslip
- **Dynamic CTC Breakdown Calculator**:
  - Basic Salary = 50% of CTC
  - House Rent Allowance (HRA) = 25% of CTC
  - Special Allowances / Conveyance / Medical Allowances
  - Statutory Deductions: Employee PF (12% of Basic), Professional Tax (₹200), TDS.
- **Net Take-Home Pay Calculation**: Dynamic deduction summation and net disbursement calculation.
- **Payslip Modal (`PayslipModal.jsx`)**: Print-ready formal salary slip template with company letterhead, employee statutory numbers, earnings vs. deductions table, and browser `window.print()` styling optimization.

### 5.7 Expense Reimbursement Portal
- **Expense Claim Form**: Title, Category (Travel, Meals, Equipment, Client, Misc), Amount (₹), Date, Receipt URL, and notes.
- **Claim Status Pipeline**: Visual badge statuses (`Pending Review`, `Approved`, `Rejected`, `Disbursed`).

### 5.8 OKR & Performance Management
- **Goal Cards**: Categorized by department (Engineering, Sales, Design, HR) and Quarter (e.g. `Q3 2026`).
- **Interactive Progress Slider**: Direct drag-and-drop or click percentage updater (0% to 100%) with status transitions (`on_track`, `at_risk`, `completed`).

### 5.9 Audit & Compliance Inspector (Super Admin)
- **Security Action Stream**: Real-time audit log viewer capturing Actor Name, Action Type (e.g., `USER_LOGIN`, `EMPLOYEE_CREATE`, `SALARY_UPDATE`), Target Resource, IP Address, and timestamp.

---

## 6. Technical Stack & Frontend Architecture

```
Frontend Architecture (React + Vite):
├── src/
│   ├── components/       # Reusable Atomic UI & 3D Widgets
│   │   ├── Layout.jsx               # Sidebar, Header, Breadcrumbs, Profile Menu
│   │   ├── ProtectedRoute.jsx       # RBAC Route Guard
│   │   ├── CommandPalette.jsx       # Omni Search Modal
│   │   ├── RevolvingFrames3D.jsx    # 3D Gyro Carousel
│   │   ├── SpatialStage.jsx         # 3D Perspective Wrapper
│   │   ├── Tilt3DCard.jsx           # Parallax Tilt Card
│   │   ├── PayslipModal.jsx         # Printable Payslip Generator
│   │   ├── ThemeSwitcher.jsx        # 5-Theme Selector
│   │   └── PasswordStrengthMeter.jsx# Entropy Calculator
│   ├── context/          # React Context Providers
│   │   ├── AuthContext.jsx          # User Session & JWT State
│   │   ├── ThemeContext.jsx         # Global Theme Provider
│   │   └── ToastContext.jsx         # Notification Toast Pipeline
│   ├── pages/            # Page-Level Views (16 Pages)
│   ├── services/         # Axios/Fetch API Clients
│   │   ├── api.js                   # Base Axios Instance & Interceptors
│   │   ├── authApi.js
│   │   ├── employeesApi.js
│   │   ├── attendanceApi.js
│   │   ├── timeOffApi.js
│   │   ├── salaryApi.js
│   │   ├── departmentsApi.js
│   │   ├── expensesApi.js
│   │   ├── goalsApi.js
│   │   ├── announcementsApi.js
│   │   └── auditLogApi.js
│   ├── index.css         # Global Theme Variables, Animations, Tailwind/Reset
│   └── App.jsx           # Master Route Matrix
```

---

## 7. Non-Functional Requirements (NFR)

1. **Performance**:
   - Initial Bundle Size < 250 KB (gzipped).
   - First Contentful Paint (FCP) < 0.8s on 4G connections.
   - Lighthouse Performance Score >= 95.
2. **Accessibility (a11y)**:
   - Full keyboard navigability (Tab sequence, Escape modal dismiss, Arrow navigation in Command Palette).
   - ARIA roles and labels on all icon buttons and modals.
3. **Cross-Browser Compatibility**:
   - Chromium-based browsers (Chrome, Edge, Brave, Opera) >= v100.
   - Mozilla Firefox >= v100.
   - Apple Safari >= v15.4 (Full CSS 3D Transforms and backdrop-filter support).
4. **Security**:
   - Zero DOM XSS injection (React JSX sanitization + strict prop typing).
   - Automatic session purge on 401 Unauthorized API responses.
