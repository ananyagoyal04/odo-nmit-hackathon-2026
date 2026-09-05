# 🏛️ Odoo Workforce — Master Product Requirement Document (PRD)

Welcome to the central Product Requirement Documentation for **Odoo Workforce Multi-Tenant HR Management System**.

## 📑 Detailed PRD Documents

1. 🎨 **[Frontend Product Requirement Document (PRD)](./FRONTEND_PRD.md)**
   - UI/UX Design System & 5 Dynamic Theme Engines
   - 3D Continuous Revolving Spatial Canvas & Gyro Parallax
   - Complete Route Matrix & Role-Based Navigation
   - Omni Command Palette (`Ctrl/Cmd + K`)
   - 16 Interactive Modules (Attendance Heatmap, Payslip Generator, In-Place Editor, etc.)
   - State Management & Context Architecture

2. ⚙️ **[Backend Product Requirement Document (PRD)](./BACKEND_PRD.md)**
   - Multi-Tenant Relational Isolation Model
   - 11 Relational Tables & Complete SQL DDL Schema
   - Native Parameterized SQL DAO Layer (Zero-ORM Overhead)
   - Atomic Concurrency-Safe Login ID Generator
   - Automated Statutory CTC / Payroll Engine
   - Real-Time Biometric Attendance & Duration Engine
   - 30+ REST API Endpoints with Request/Response Contracts
   - JWT & RBAC Security Infrastructure

---

## 🚀 Quick Reference Architecture

```
                                  [ Users & Admins ]
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    Vite + React 18 SPA Frontend       │
                      │  - 5 Dynamic Themes                   │
                      │  - 3D Spatial Canvas Stage            │
                      │  - Omni Command Palette (Ctrl+K)      │
                      │  - 1-Click Printable Payslip Engine   │
                      └───────────────────┬───────────────────┘
                                          │ REST API (JSON / JWT)
                                          ▼
                      ┌───────────────────────────────────────┐
                      │      Node.js / Express REST API       │
                      │  - RBAC Middleware                    │
                      │  - Atomic ID Sequence Generator       │
                      │  - Automated Audit Logger             │
                      └───────────────────┬───────────────────┘
                                          │ Parameterized SQL
                                          ▼
                      ┌───────────────────────────────────────┐
                      │     Native MySQL 8.0 Relational DB    │
                      │  - 11 Tables with Company Scoping     │
                      │  - Pure SQL In-Memory Engine Fallback │
                      └───────────────────────────────────────┘
```
