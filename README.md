# InsurCare - Insurance Policy & Claims Management System

A production-ready, full-stack **Enterprise Insurance Policy & Claims Management Platform** built with **FastAPI**, **React (Vite)**, and **Material UI (MUI v5)**. Designed with a modern, high-conversion visual identity inspired by **InsurCare** (~70% visual match).

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Backend-FastAPI-009688.svg)
![React](https://img.shields.io/badge/Frontend-ReactJS_Vite-61DAFB.svg)
![MUI](https://img.shields.io/badge/UI-Material_UI_v5-007FFF.svg)
![Architecture](https://img.shields.io/badge/Architecture-Role--Based_Decoupled-orange.svg)

---

## 🌟 System Architecture & Portals

The platform is structured into four decoupled, role-guarded enterprise portals sharing a unified design language, centralized database schema, and RESTful API backend:

```
                                  ┌──────────────────────────────┐
                                  │   InsurCare Unified Portal   │
                                  └──────────────┬───────────────┘
                                                 │
          ┌───────────────────────┬──────────────┴──────────────┬─────────────────────────┐
          │                       │                             │                         │
┌─────────▼───────────┐ ┌─────────▼───────────┐ ┌───────────────▼───────────┐ ┌───────────▼───────────┐
│   🛡️ Admin Portal   │ │  👤 Customer Portal │ │ ⚖️ Claims Officer Portal │ │ 💼 Agent Portal       │
│      (/admin)       │ │     (/customer)     │ │        (/officer)         │ │       (/agent)        │
└─────────────────────┘ └─────────────────────┘ └───────────────────────────┘ └───────────────────────┘
```

### 1. 🛡️ **Admin Portal (`/admin/*`)**
- **User & Role Administration**: Full CRUD lifecycle management for Admins, Agents, Officers, and Customers with account status toggling (`Active` / `Inactive`) and self-modification security guards.
- **Insurance Policy Configuration**: Catalog plan creation, coverage limits, terms, premium pricing tiers, and category management.
- **Agent & Claims Officer Onboarding**: Dedicated onboarding portals, credential provisioning, and performance tracking.
- **Claims Desk & Adjudication Oversight**: Global claims visibility, officer reassignments, payout oversight, and document verification.
- **Executive Analytics & Audit Logs**: Revenue breakdown reports, policy distribution charts, claim settlement analytics, and tamper-resistant security audit logs.

### 2. 👤 **Customer Portal (`/customer/*`)**
- **Self-Service Dashboard**: Real-time overview of active policies, pending claim statuses, renewal deadlines, and notification alerts.
- **Plan Catalog & Instant Purchase**: Interactive policy browser with dynamic category filtering, detailed coverage breakdowns, and 1-click plan subscription checkout.
- **My Policies Portfolio**: Active policy coverage manager with digital policy terms inspection and **1-click A4 Policy Guarantee Certificate PDF** download.
- **Claims Filing Desk**: Guided multi-step claim filing with incident details, loss date, requested amounts, and supporting document file uploads.
- **Real-Time Claims Tracking**: Visual timeline tracking claim progression (`Submitted` ➔ `Under Review` ➔ `Approved / Rejected` ➔ `Paid`).

### 3. ⚖️ **Claims Officer Portal (`/officer/*`)**
- **Adjudication Dashboard**: Key metrics on pending reviews, assigned queues, approval percentages, and flagged cases.
- **Claim Review Workspace**: In-depth claim review interface featuring incident details, attached evidentiary documents preview, and an automated risk engine (*Low Risk*, *Moderate*, *High Risk*).
- **Decision Engine**: Formal adjudication workflow with approved settlement amount inputs, rejection reasoning, adjuster remarks, and audit trail generation.
- **Review History**: Historical catalog and audit logs of all processed claims.

### 4. 💼 **Insurance Agent Portal (`/agent/*`)** - **(Done by Harshith Cheripally)**
- **Agent Operations Dashboard**: KPI metrics on active customer policies, total premiums collected (₹), and dual-axis **Recharts** sales performance across categories (*Health*, *Auto*, *Life*, *Home*).
- **Client Policy Issuance**: Issue plans to verified customers with dynamic customer auto-completion.
- **Customer Policy Management**: Filterable portfolio table with status chips (`ACTIVE`, `SUSPENDED`, `EXPIRED`, `CANCELLED`).
- **Renewal Notifications**: 1-click branded HTML Email & SMS renewal reminders updating audit timestamps.
- **Agent Profile Management**: Real-time profile editing and display picture management.

---

## 🎨 Visual System & Branding (InsurCare Identity)

- **Brand Palette**: Signature Vibrant Orange (`#ff5a00`), Corporate Navy (`#002970`), Coverage Accent Teal (`#00a896`), and Soft Ice Blue background gradient (`#edf5ff`).
- **Glassmorphic Navigation**: Top glassmorphic header bar with quick-switch notification popovers, dynamic role badges, and an animated drawer navigation menu.
- **Data Visualization**: Rich interactive charts powered by **Recharts** (Distribution Pie Charts, Category Revenue Bar Charts).
- **PDF Guarantee Generation**: Client-side official Policy Guarantee Certificates generated via **jsPDF** & **AutoTable**.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React.js 18 (Vite)
- **UI Component Library**: Material UI (MUI v5)
- **Icons**: MUI Icons Material
- **Data Visualization**: Recharts (Pie, Bar & Area charts)
- **PDF Generation**: jsPDF & jsPDF-AutoTable
- **Routing**: React Router v6 (Role-Based Protected Routes)
- **HTTP Client**: Axios with automatic JWT interceptors

### **Backend**
- **Framework**: Python 3.12+ / FastAPI
- **Database ORM**: SQLAlchemy 2.0
- **Data Validation & Schemas**: Pydantic v2
- **Authentication**: JWT (JSON Web Tokens) with Passlib & Bcrypt password hashing
- **Database Engine**: SQLite (Default development) / PostgreSQL compatible
- **Testing**: Pytest

---

## 🚀 Getting Started Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/harshithcheripally16-ui/Insurance-Policy-Claims-Management.git
cd Insurance-Policy-Claims-Management
```

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# (Optional) Create & activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server on http://127.0.0.1:8000
python run.py
```

> 📄 **Interactive API Docs (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
> 📄 **Alternative API Docs (ReDoc)**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 3. Frontend Setup (React + Vite)

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Vite development server on http://127.0.0.1:3000
npm run dev
```

> 🌐 **Web Portal**: [http://127.0.0.1:3000](http://127.0.0.1:3000)

---

## 🔑 Demo Login Credentials

You can use the 1-click **Quick Login Chips** on the `/login` page or enter the credentials below:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | `admin@insurance.com` | `Admin@123` | Full System Management, Users, Policies, Claims & Reports |
| 👤 **Customer** | `customer@insurance.com` | `Customer@123` | Self-Service Policy Subscriptions, Document Uploads & Claims |
| ⚖️ **Claims Officer** | `officer@insurance.com` | `Officer@123` | Claims Review, Risk Scoring & Payout Approvals |
| 💼 **Insurance Agent** | `agent@insurance.com` | `Agent@123` | Client Portfolios, Policy Issuance & Renewal Reminders |

---

## 🧪 Automated Testing

Run the automated backend test suite using `pytest`:

```bash
cd backend
python -m pytest
```

---

## 📜 License

This project is licensed under the MIT License.
