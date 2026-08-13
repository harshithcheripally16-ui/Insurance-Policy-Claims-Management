# InsurCare - Full-Stack Insurance Policy & Claims Management System

An educational enterprise-grade Insurance Policy & Claims Management System built with **Python FastAPI**, **SQLAlchemy ORM**, **SQLite**, and **ReactJS with Material UI (MUI v5)**.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Admin**: System configuration, global user management, policy catalog creation, and executive financial dashboards.
   - **Claims Officer**: Review claims, analyze automated risk scores & fraud flags, verify document attachments, and approve/reject with mandatory remarks.
   - **Insurance Agent**: Manage customer policy purchases, assist claim submissions, and track customer portfolios.
   - **Customer**: Browse policy catalog, purchase insurance coverage, submit claims with file attachments, and track real-time status.

2. **Automated Python Risk & Fraud Scoring Engine**:
   - Calculates a **0–100 Risk Score** and determines Risk Levels (`LOW`, `MEDIUM`, `HIGH`).
   - Flags suspicious indicators: High Coverage Ratio (>80%), Early Claim Window (<15 days from start date), Missing Attachments, and Claim Velocity.

3. **Interactive Material UI (MUI v5) Interface**:
   - Built with MUI `Paper`, `Grid`, `Table`, `Dialog`, `Chip`, `AppBar`, and `Recharts`.
   - **1-Click Role Demo Switcher**: Instant switching between Admin, Officer, Agent, and Customer roles.

4. **Document Verification & Report Export**:
   - Attach PDF/Image files to claims with verification status tracking (`PENDING`, `VERIFIED`, `REJECTED`).
   - One-click CSV summary report export.

---

## 🚀 Quick Setup & Run Instructions

### 1. Start Python FastAPI Backend
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Seed database with sample demo data
python -m app.seed

# Run Pytest test suite
pytest tests/ -v

# Launch Backend Server (http://localhost:8000)
python run.py
```
*Swagger API Documentation available at: `http://localhost:8000/docs`*

---

### 2. Start ReactJS Material UI Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend Application running at: `http://localhost:3000`*

---

## 🔐 Default Demo Login Credentials

All demo accounts use password: `password123`

| Role | Email | Access |
|---|---|---|
| **Admin** | `admin@insure.com` | Full System Access, Reports, Users |
| **Claims Officer** | `officer@insure.com` | Claims Workbench, Document Verification, Approve/Reject |
| **Insurance Agent** | `agent@insure.com` | Customer Management, Policy Purchases |
| **Customer** | `customer@insure.com` | View Policies, Claim Submission, Status Tracking |

---

## 🏗️ Technology Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLAlchemy ORM, SQLite (`insurance.db`), Pydantic v2, PyJWT, Bcrypt, Pytest
- **Frontend**: ReactJS 18, Material UI (MUI v5), Recharts, Axios, React Router v6, Vite
