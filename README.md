# Policybazaar-Inspired Insurance Policy & Claims Management System

A production-ready, full-stack **Insurance Policy & Claims Management System** inspired by Policybazaar (~70% visual identity & UX match) with a dedicated **Insurance Agent Portal** designed for Agent Priya Nair.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Backend-FastAPI-009688.svg)
![React](https://img.shields.io/badge/Frontend-ReactJS_Vite-61DAFB.svg)
![MUI](https://img.shields.io/badge/UI-Material_UI_v5-007FFF.svg)

---

## 🌟 Key Features

### 🏢 Policybazaar Visual System Identity (~70% Match)
- **Brand Palette**: Signature Vibrant Orange (`#ff5a00`), Corporate Navy (`#002970`), Coverage Accent Teal (`#00a896`), and Soft Ice Blue background gradient (`#edf5ff`).
- **Glassmorphic Navigation**: Top glassmorphic header bar with a hamburger toggle button placed immediately to the left of the brand logo, launching an animated sliding Drawer navigation menu.
- **Plain Insurance Terminology**: Avoids technical developer jargon; uses clear terms like *Insurance Plans*, *Policy Coverages*, and *Client Accounts*.

### 📊 Agent Dashboard (`/dashboard`)
- **Hero Welcome Banner**: Personalized dashboard for Agent Priya Nair (Verified Agent).
- **KPI Stat Cards**: Total Client Policies, Active Policies, Total Premiums Collected (₹), Client Accounts.
- **Category Sales Performance Chart**: Interactive dual-axis **Recharts** visualization tracking premium revenues collected (₹) and policies issued across *Health*, *Auto*, *Life*, and *Home*.

### 📜 Insurance Plans Catalog (`/policies/catalog`)
- Dedicated catalog grid featuring **BESTSELLER** badges, pricing cards, coverage limit badges, and feature checklists.
- **Issue Policy to Customer Modal**: Select customer dropdown displaying **ONLY Customer Full Names** (strictly hiding email addresses for agent focus).

### 📑 Customer Policies Portfolio (`/policies`)
- Table of active customer policy coverages with status chips (`ACTIVE`, `SUSPENDED`, `EXPIRED`, `CANCELLED`).
- **Advanced Multi-Filter Bar**: Search Query (Policy #, Title, Customer), Category, Status, Valid Dates (*Valid From* / *Valid Until*), and Reset.
- **1-Click SMTP Email Renewal Reminder**: Sends branded HTML renewal email + updates "Last Reminder Sent" audit timestamp + in-app notice.
- **1-Click Phone SMS Renewal Reminder**: Sends SMS renewal notice + updates "Last Reminder Sent" audit timestamp + in-app notice.
- **1-Click PDF Policy Guarantee Certificate**: Downloads official A4 Policy Guarantee Certificate PDF with digital agent seal.

### 👥 Customer Directory (`/users`)
- Filtered directory of verified client accounts (`role = CUSTOMER`).
- **Sequential Auto-Reindexed ID Column**: Customer display IDs renumbered dynamically starting from 1 (`1, 2, 3, ...`) with zero gaps.

### ⚠️ Claims Desk & Risk Engine (`/claims`)
- Claim filing modal and automated risk scoring engine (`risk_engine`).
- Color-coded risk badges (*LOW RISK*, *MODERATE*, *HIGH RISK*) based on coverage ratio, incident timing, and claim history.

---

## 📁 Repository Structure

```
insurance-policy-claims-management/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app instance, CORS & router registrations
│   │   ├── config.py                  # Environment config (JWT secret, SMTP settings)
│   │   ├── database.py                # SQLAlchemy engine & get_db dependency
│   │   ├── models.py                  # SQLAlchemy Models & Enums
│   │   ├── schemas.py                 # Pydantic v2 validation models & response schemas
│   │   ├── dependencies.py           # JWT auth dependencies & role guards
│   │   ├── routers/
│   │   │   ├── auth_router.py         # Login, Register, OTP verification, Password Reset
│   │   │   ├── policies_router.py     # Policy catalog, Purchase, Reminders
│   │   │   ├── users_router.py        # Customer directory query & User CRUD
│   │   │   ├── claims_router.py       # Claim filing & document attachments
│   │   │   ├── analytics_router.py    # Dashboard KPI stats & sales aggregation
│   │   │   └── notifications_router.py# In-app notifications
│   │   └── services/
│   │       ├── smtp_service.py        # HTML OTP email & Policy Renewal Email dispatch
│   │       ├── sms_service.py         # Phone SMS Renewal Reminder dispatch
│   │       ├── notification.py       # In-app DB notification helper
│   │       └── risk_engine.py         # Claim risk assessment engine
│   ├── tests/
│   │   └── test_api.py                # Automated Pytest API test suite
│   ├── run.py                         # FastAPI runner script (port 8000)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.jsx                    # App routes, ProtectedLayout, ErrorBoundary wrapper
    │   ├── main.jsx                   # Vite entry point
    │   ├── theme.js                   # Policybazaar Material UI theme
    │   ├── context/
    │   │   └── AuthContext.jsx        # Auth state provider
    │   ├── services/
    │   │   └── api.js                 # Axios instance with JWT interceptor
    │   ├── utils/
    │   │   └── pdfGenerator.js        # jsPDF A4 Policy Certificate generator
    │   ├── components/
    │   │   ├── Navbar.jsx             # Top glassmorphic bar + Hamburger button
    │   │   ├── Sidebar.jsx            # Animated sliding Drawer navigation menu
    │   │   ├── StatCard.jsx           # Policybazaar KPI stat card
    │   │   └── ErrorBoundary.jsx      # React ErrorBoundary component
    │   └── pages/
    │       ├── Login.jsx              # Sign-in & 3-step Forgot Password OTP modal
    │       ├── Register.jsx           # Sign-up & Email OTP verification modal
    │       ├── Dashboard.jsx          # Agent Dashboard & Recharts Performance Chart
    │       ├── InsurancePlansPage.jsx # Dedicated Insurance Plans Catalog (/policies/catalog)
    │       ├── PoliciesPage.jsx       # Customer Policies (/policies) + Reminders
    │       ├── UsersPage.jsx          # Customer Directory (/users) + Gapless Reindexing
    │       └── ClaimsPage.jsx         # Claims filing & risk viewer
    ├── package.json
    └── vite.config.js
```

---

## ⚡ Quick Start & Local Execution

### 1. Backend Setup (Port 8000)
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
> API interactive documentation available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
> Web Application available at: `http://127.0.0.1:3000`

---

## 🔑 Default Credentials

- **Role**: Verified Insurance Agent
- **Email**: `agent@insure.com`
- **Password**: `password123`

---

## 🧪 Running Automated Tests

```bash
cd backend
python -m pytest
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
