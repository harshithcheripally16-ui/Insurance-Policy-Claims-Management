# Insurance Policy & Claims Management System

An educational full-stack enterprise Insurance Policy & Claims Management System built with **Python FastAPI**, **SQLAlchemy ORM**, **SQLite**, and **ReactJS with Material UI (MUI v5)**.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Admin**: System configuration, global user directory, policy catalog creation, and executive dashboards.
   - **Claims Officer**: Claims review workbench, automated risk scores & fraud flags, document verification, and approve/reject workflows with mandatory remarks.
   - **Insurance Agent**: Manage customer policy purchases, assist claim submissions, and track customer portfolios.
   - **Customer**: Browse policy catalog, purchase insurance coverage, submit claims with file attachments, and track real-time status.

2. **Automated Python Risk & Fraud Scoring Engine**:
   - Calculates a **0–100 Risk Score** and determines Risk Levels (`LOW`, `MEDIUM`, `HIGH`).
   - Flags suspicious indicators: High Coverage Ratio (>80%), Early Claim Window (<15 days from policy start), Missing Attachments, and Claim Velocity.

3. **Interactive Material UI (MUI v5) & Responsive Interface**:
   - Built with MUI `Paper`, `Grid`, `TableContainer`, `Dialog`, `Chip`, `AppBar`, `SwipeableDrawer` mobile navigation, and `Recharts`.
   - **1-Click Role Demo Switcher**: Instant switching between Admin, Officer, Agent, and Customer roles.

4. **Indian Localization (₹ / INR)**:
   - Localized demo users (`Aarav Sharma`, `Rajesh Kulkarni`, `Priya Nair`, `Vikram Patel`), Indian addresses, INR (`₹`) currency formatting, and Indian policy plans.

5. **Document Verification & CSV Report Export**:
   - Attach PDF/Image files to claims with verification status tracking (`PENDING`, `VERIFIED`, `REJECTED`).
   - One-click CSV summary report export.

---

## 🚀 How to Clone and Run This Project

Follow these step-by-step instructions to get the application running locally on your machine.

### Prerequisites
- [Git](https://git-scm.com/) installed
- [Python 3.10+](https://www.python.org/downloads/) installed
- [Node.js 18+](https://nodejs.org/) installed

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/harshithcheripally16-ui/Insurance-Policy-Claims-Management.git
cd Insurance-Policy-Claims-Management
```

---

### Step 2: Set Up and Run the Python Backend (FastAPI)

Open a terminal window and execute:

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Seed SQLite database with sample Indian demo data (Users, Policies, Claims)
python -m app.seed

# (Optional) Run backend Pytest test suite
pytest tests/ -v

# Launch FastAPI Server
python run.py
```
> ⚡ **Backend Running at:** `http://127.0.0.1:8000`  
> 📖 **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs`

---

### Step 3: Set Up and Run the ReactJS Frontend (Material UI)

Open a **second terminal window** in the root directory and execute:

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start Vite React development server
npm run dev
```
> 🖥️ **Web Application Running at:** `http://localhost:3000`

---

## 🔑 Default Demo Login Credentials

Password for all pre-seeded accounts: `password123`

| Role | Email | Password | Access / Features |
|---|---|---|---|
| 👑 **Admin** | `admin@insure.com` | `password123` | Global Financial Analytics, User Management, Reports |
| 🔍 **Claims Officer** | `officer@insure.com` | `password123` | Claims Workbench, Automated Risk Scores, Approve/Reject |
| 💼 **Insurance Agent** | `agent@insure.com` | `password123` | Customer Directory, Assisted Policy Purchases |
| 👤 **Customer** | `customer@insure.com` | `password123` | View Policies, Claim Submissions, File Attachments |

---

## 🏗️ Tech Stack Breakdown

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLAlchemy ORM, SQLite (`insurance.db`), Pydantic v2, PyJWT, Bcrypt, Pytest
- **Frontend**: ReactJS 18, Material UI (MUI v5), Recharts, Axios, React Router v6, Vite
