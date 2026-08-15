# Insurance Agent Policy & Claims Management Module

An enterprise-grade **Insurance Agent Management Portal** built with **Python FastAPI**, **SQLAlchemy ORM**, **SQLite**, and **ReactJS with Material UI (MUI v5)**.

---

## 🌟 Key Features

1. **Agent Sales Portfolio & Dashboard**:
   - Track total client policies, active customer coverages, total sales premiums collected (₹), and 10% agent commission earnings.
   - Comprehensive customer policy listing and customer claims overview.

2. **Policy Catalog & Customer Purchase Management**:
   - Browse insurance products (Health, Auto, Home, Life).
   - Issue and purchase insurance policies directly on behalf of assigned customers.

3. **Customer Directory & Account Creation**:
   - Manage customer directory profiles with search and contact details.
   - Register new customer accounts directly from the agent interface.

4. **Customer Claims Tracking & Document Verification**:
   - Monitor customer claim submissions in real time.
   - Inspect claim file attachments (PDF/Images) and verify document statuses (`PENDING`, `VERIFIED`, `REJECTED`).

5. **SMTP OTP Authentication & Password Reset**:
   - 2-step 6-digit OTP email verification for agent signup and password reset.
   - Branded HTML email notifications.

6. **Light / Dark Mode Theme Support**:
   - Global uniform Light and Dark theme toggle integrated into the profile menu bar.

---

## 🚀 How to Set Up and Run the Application

### Prerequisites
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

---

### Step 1: Clone and Navigate to Directory
```bash
git clone https://github.com/harshithcheripally16-ui/Insurance-Policy-Claims-Management.git
cd Insurance-Policy-Claims-Management
```

---

### Step 2: Set Up and Run the Python Backend (FastAPI)

Open a terminal window and run:

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Seed SQLite database with demo accounts & policy catalog
python -m app.seed

# Start FastAPI server
python run.py
```
> ⚡ **Backend Running at:** `http://127.0.0.1:8000`  
> 📖 **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs`

---

### Step 3: Set Up and Run the ReactJS Frontend (Material UI)

Open a **second terminal window** and run:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Launch Vite development server
npm run dev
```
> 🖥️ **Web Application Running at:** `http://localhost:3000`

---

## 🔑 Default Insurance Agent Credentials

| Role | Email | Password | Name |
|---|---|---|---|
| 💼 **Insurance Agent** | `agent@insure.com` | `password123` | Priya Nair |

---

## 🏗️ Tech Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLAlchemy ORM, SQLite (`insurance.db`), Pydantic v2, PyJWT, Bcrypt, Pytest
- **Frontend**: ReactJS 18, Material UI (MUI v5), Recharts, Axios, React Router v6, Vite
