# Policybazaar-Inspired Insurance Policy & Claims Management System

A production-ready, full-stack **Insurance Policy & Claims Management System** inspired by Policybazaar (~70% visual identity & UX match), developed as a **Group Project by Team Antigravity**.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Backend-FastAPI-009688.svg)
![React](https://img.shields.io/badge/Frontend-ReactJS_Vite-61DAFB.svg)
![MUI](https://img.shields.io/badge/UI-Material_UI_v5-007FFF.svg)

---

## 👥 Group Project & Team Collaboration Architecture

This repository forms the core foundation of a multi-module enterprise insurance suite built by **Team Antigravity**. The application architecture has been decoupled to guarantee **zero integration barriers and zero module conflicts** when incorporating modules developed by fellow team members.

### 🧩 Teammate Module Integration Support
Our modular router, role-guard, and component layout structure seamlessly supports plug-and-play integration for the following teammate modules:

1. **Admin Module**: Dedicated administrative control panel, global system settings, agent onboarding, and audit log monitoring.
2. **Customer Module**: Self-service client portal for direct policy browsing, payment gateway checkouts, document uploads, and policy management.
3. **Claims Officer Module**: Specialized adjudication dashboard for insurance claims adjusters, investigation management, and payout approvals.

Each teammate module can be connected directly via independent API routers and React route boundaries without affecting existing agent portal workflows or causing merge conflicts.

---

## 🌟 Key System Capabilities

### 🏢 Policybazaar Visual System Identity (~70% Match)
- **Brand Palette**: Signature Vibrant Orange (`#ff5a00`), Corporate Navy (`#002970`), Coverage Accent Teal (`#00a896`), and Soft Ice Blue background gradient (`#edf5ff`).
- **Glassmorphic Navigation**: Top glassmorphic header bar with a hamburger toggle button positioned immediately to the left of the brand logo, launching an animated sliding Drawer navigation menu.
- **Plain Insurance Terminology**: Avoids developer jargon; uses clear terms like *Insurance Plans*, *Policy Coverages*, and *Client Accounts*.

### 📸 Agent Profile Picture Management
- **Instagram-Style Profile Upload**: Interactive profile picture editing interface inside the Agent Profile modal, featuring a camera overlay button that allows agents to update their display image in real time.

### 📊 Agent Operations & Dashboard (`/dashboard`)
- **Hero Welcome Banner**: Personalized operations overview for Agent Priya Nair (Verified Insurance Agent).
- **KPI Stat Cards**: Total Client Policies, Active Policies, Total Premiums Collected (₹), Client Accounts.
- **Category Sales Performance Chart**: Interactive dual-axis **Recharts** visualization tracking premium revenues collected (₹) and policies issued across *Health*, *Auto*, *Life*, and *Home*.

### 📜 Insurance Plans Catalog (`/policies/catalog`)
- Dedicated catalog grid featuring **BESTSELLER** badges, pricing cards, coverage limit badges, and feature checklists.
- **Issue Policy to Customer Modal**: Customer select dropdown displaying **ONLY Customer Full Names** (strictly hiding email addresses for agent privacy and focus).

### 📑 Customer Policies Portfolio (`/policies`)
- Active customer policy coverages table with status chips (`ACTIVE`, `SUSPENDED`, `EXPIRED`, `CANCELLED`).
- **Advanced Multi-Filter Bar**: Search Query (Policy #, Title, Customer), Category, Status, Valid Dates (*Valid From* / *Valid Until*), and Reset.
- **1-Click SMTP Email Renewal Reminder**: Sends branded HTML renewal email + updates "Last Reminder Sent" audit timestamp + in-app notice.
- **1-Click Phone SMS Renewal Reminder**: Sends SMS renewal notice + updates "Last Reminder Sent" audit timestamp + in-app notice.
- **1-Click PDF Policy Guarantee Certificate**: Downloads official A4 Policy Guarantee Certificate PDF with digital agent seal.

### 👥 Customer Directory (`/users`)
- Verified client accounts directory (`role = CUSTOMER`).
- **Sequential Auto-Reindexed ID Column**: Customer display IDs renumbered dynamically starting from 1 (`1, 2, 3, ...`) with zero gaps.

### ⚠️ Claims Desk & Risk Engine (`/claims`)
- Claim filing modal and automated risk scoring engine (`risk_engine`).
- Color-coded risk badges (*LOW RISK*, *MODERATE*, *HIGH RISK*) based on coverage ratio, incident timing, and claim history.

---

## ⚡ Local Execution Instructions

### 1. Backend Server Setup (Port 8000)
```bash
python -m pip install -r requirements.txt
python run.py
```
> API interactive documentation available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Server Setup (Port 3000)
```bash
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

## 🧪 Automated Testing

```bash
python -m pytest
```

---

## 📜 License

Distributed under the MIT License. Developed by **Team Antigravity**.
