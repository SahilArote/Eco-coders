# Krishi-Setu APMC — Intelligent Agricultural Procurement & Queue Management System

> **Enterprise Mandi Operations, Queue Automation, Quality Assaying & Direct Benefit Transfer Platform**  
> *Built for Ministry of Consumer Affairs, Food & Public Distribution / SIH Problem Statement 26032*

---

## 🌾 Overview

**Krishi-Setu APMC** is a high-density, frontend-driven operational ERP and digital mandi management platform built specifically for **APMC Mandi Staff, Gate Operators, Weighbridge Operators, Laboratory Assayers, Auction Officers, Procurement Officers, Accounts Officers, and Mandi Supervisors/Admins**.

The platform streamlines and digitizes physical market yard operations: from vehicle gate entry and waiting queues to automated dual-scale weighment, Fair Average Quality (FAQ) grading, live Mandi auction bidding, lot procurement clearance, and PFMS Direct Benefit Transfer (DBT) bank disbursements.

---

## ⚠️ Important Architectural Boundaries

- **100% Frontend-Only**: Zero backend servers, zero database connections, and zero external REST/GraphQL APIs. All transactions, queue movements, and financial calculations are reactively simulated using `ProcurementContext` with persistent `localStorage` synchronization.
- **No Farmer User Role**: A separate mobile/web application is dedicated to farmers. On this APMC management platform, there is **no Farmer Login, no Farmer Dashboard, and no Farmer-specific navigation**.
- **Farmer as Core Business Entity**: Mandi staff inspect and manage all farmer records (KYC verification, landholding acreage, arrival tokens, weighment slips, quality assay results, lots, auctions, and DBT vouchers) through the administrative **Farmer Records** module (`/farmers`).

---

## 👥 7 APMC Staff Operational Roles & Desks

The platform features dedicated dashboards tailored to each ground station at the Mandi:

| Role ID | Desk Title | Route | Core Operations & Features |
| :--- | :--- | :--- | :--- |
| `gate_operator` | **Gate / Entry Operator** | `/dashboard/gate` | Rapid vehicle arrival check-in, driver & token verification, gate pass issuance, and RFID/barcode simulation. |
| `weighbridge_operator` | **Weighbridge Operator** | `/dashboard/weighbridge` | Dual-scale console, gross and tare weight capture, automated net formula calculation ($Net = Gross - Tare$), and Avery certified weighment slips. |
| `quality_assayer` | **Quality / Assay Officer** | `/dashboard/quality` | Moisture % meter, foreign matter % analysis, FAQ Grade A/B/C auto-assignment, and laboratory testing sign-off. |
| `auction_officer` | **Auction / Mandi Officer** | `/dashboard/auction` | Real-time Mandi bidding floor, MSP floor rate enforcement, commercial trader bid management (+₹25/50/100), and buyer allotment. |
| `procurement_officer` | **Procurement Officer** | `/dashboard/procurement` | Lot clearance ledger, moisture deduction approvals, storage warehouse allocation, and Form J (Tak-Patti) generation. |
| `accounts_officer` | **Payment / Accounts Officer** | `/dashboard/accounts` | Public Financial Management System (PFMS) Direct Benefit Transfer (DBT) console, batch payout approval, and instant UTR generation. |
| `admin` | **Mandi Supervisor / Admin** | `/dashboard/admin` | APMC center overview, cross-commodity volume analytics, MSP price configuration, and staff activity audits. |

---

## 🚀 Key Modules & Features

### 1. Mandi Live Auction Floor (`/procurement/auctions` & `/dashboard/auction`)
- Real-time trading terminal displaying active lots, MSP floor rate validation, and live timer.
- Live bids submitted by licensed commercial buyers (*Patanjali Agro*, *ITC Choupal*, *Adani Wilmar*, etc.).
- Officers can increment bids (+₹25, +₹50, +₹100) or manually submit bids.
- 1-click **Accept & Close Auction** transitions winning bids to lot procurement clearance.

### 2. Dual-Phase Electronic Weighbridge (`/procurement/weighbridge`)
- Real-time digital weight scale readout.
- Record Gross Weight (loaded truck) and Tare Weight (empty truck):
  $$\text{Net Weight} = \text{Gross (4,850 kg)} - \text{Tare (1,620 kg)} = 3,230\text{ kg } (32.30\text{ Quintals})$$
- Generates official Avery certified weighment slips with weighman signatures.

### 3. Laboratory Quality Assaying (`/procurement/quality`)
- Calibrated digital testing bench for Moisture %, Foreign Matter %, and Shriveled Grains %.
- Real-time FAQ compliance calculation:
  - Moisture $\le 12.0\%$ & Foreign Matter $\le 1.5\% \implies$ **Grade A (FAQ Passed)**
  - Moisture $> 14.0\% \implies$ **Deduction Required / Rejected**

### 4. Direct Benefit Transfer (PFMS DBT) (`/payments/pending`)
- Bulk disbursement engine with masked bank account validation (e.g., `••••••••5412`).
- 1-click batch processing generates bank UTR codes (e.g., `UTR-SBI-20260305-998812`).
- Issues printable official **PFMS DBT Credit Certificates**.

### 5. Administrative Farmer Directory (`/farmers`)
- Search and audit 52 registered farmers by name, Aadhaar, village, taluka, or crop.
- Slide-over drawer provides 360° profile view: KYC status, landholding acreage, bank account details, and full historical arrival lots.

### 6. APMC Statutory Document Generation (`/documents`)
Pixel-perfect `@media print` layouts formatted to Indian government APMC standards:
- **Form J (Mandi Tak-Patti)**: Statutory sale slip with market cess (1.5%), handling fees, and net farmer credit.
- **Weighment Certificate**: Dual-phase gross/tare weight slip.
- **Inward Gate Pass**: Barcoded security gate pass.
- **PFMS DBT Credit Certificate**: Direct Benefit Transfer electronic bank receipt.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Theme**: Tailux React Admin Template (`Sideblock` layout)
- **Icons**: Lucide React
- **Charts & Data Viz**: Recharts
- **Routing**: React Router v7
- **State Management**: React Context API (`ProcurementContext`) + `localStorage` persistence

---

## 📂 Project Structure

```
farmer-procurement-frontend/
├── src/
│   ├── components/
│   │   ├── common/             # MetricCard, StatusBadge, DataTable, DetailDrawer, etc.
│   │   ├── documents/          # Printable Form J, Weighment Slips, Gate Passes, Vouchers
│   │   └── layout/             # AppLayout, Header, Sidebar, RoleSwitcher
│   ├── context/
│   │   └── ProcurementContext.jsx # Central state store (7 roles, auctions, vehicles, lots)
│   ├── data/                   # Realistic Indian mock datasets
│   │   ├── mockCenters.js      # 5 APMC market yards (Pune, Baramati, Nashik, etc.)
│   │   ├── mockCrops.js        # 8 MSP commodities (Wheat, Soybean, Gram, etc.)
│   │   ├── mockFarmers.js      # 52 farmer entity profiles
│   │   ├── mockTokens.js       # 38 live & scheduled queue tokens
│   │   ├── mockLots.js         # 105 procurement lot transactions
│   │   ├── mockAuctions.js     # Active auction lots with live trader bids
│   │   ├── mockVehicles.js     # Gate inward vehicle fleet records
│   │   └── mockPayments.js     # PFMS DBT disbursement records
│   ├── pages/
│   │   ├── auth/LoginPage.jsx  # Role-based login with 7 quick-access desk cards
│   │   ├── dashboard/          # Specialized dashboards for each of the 7 roles
│   │   ├── procurement/        # Gate Entry, Weighbridge, Quality, Auctions, Lots
│   │   ├── farmers/            # Administrative Farmer Directory (52 profiles)
│   │   ├── payments/           # Pending DBT & Settlement History
│   │   ├── documents/          # Document Center (Form J, Slips, Passes)
│   │   ├── reports/            # Operational & procurement analytics
│   │   └── settings/           # Mandi parameters & Demo Data Reset
│   ├── App.jsx                 # Route dispatcher
│   └── index.css               # Tailwind CSS tokens & @media print rules
├── docs/
│   └── implementation.md       # Comprehensive 25-section architecture document
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone or navigate to the project directory
cd farmer-procurement-frontend

# Install dependencies
npm install
```

### Run Local Development Server
```bash
npm run dev
```
Open your browser and navigate to: `http://localhost:5173`

### Production Build
```bash
npm run build
```

---

## 🧪 Demo Credentials & Quick Access

On the `/login` screen, click any of the **7 Desk Cards** to auto-populate demo credentials:

| Desk | Quick Fill | Default Route |
| :--- | :--- | :--- |
| **Gate / Entry Operator** | `gate.operator@apmc.gov.in` | `/dashboard/gate` |
| **Weighbridge Operator** | `weighbridge.operator@apmc.gov.in` | `/dashboard/weighbridge` |
| **Quality / Assay Officer** | `quality.assayer@apmc.gov.in` | `/dashboard/quality` |
| **Auction / Mandi Officer** | `auction.officer@apmc.gov.in` | `/dashboard/auction` |
| **Procurement Officer** | `procurement.officer@apmc.gov.in` | `/dashboard/procurement` |
| **Accounts / Payment Officer** | `accounts.officer@apmc.gov.in` | `/dashboard/accounts` |
| **Mandi Supervisor / Admin** | `admin@krishisetu.gov.in` | `/dashboard/admin` |

*Password for all demo accounts*: `apmc@2026`

---

## 📄 License
Internal government prototype developed for **SIH Problem Statement 26032** (Department of Consumer Affairs / Ministry of Consumer Affairs, Food & Public Distribution).

