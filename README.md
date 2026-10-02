# DrugTrack — Production-Ready Pharmaceutical Supply Chain & Inventory Web Application

![DrugTrack Banner](https://img.shields.io/badge/DrugTrack-MERN%20SaaS-059669?style=for-the-badge&logo=shield&logoColor=white)
![Build](https://img.shields.io/badge/Build-Passing-10b981?style=flat-square)
![Node](https://img.shields.io/badge/Node-v20%2B-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-Deployment%20Ready-000000?style=flat-square&logo=vercel)
![MongoDB](https://img.shields.io/badge/MongoDB-Local%20%2B%20Atlas-47A248?style=flat-square&logo=mongodb)

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Demo User Credentials](#5-demo-user-credentials)
6. [Local Development Setup](#6-local-development-setup)
7. [Database Seeding](#7-database-seeding)
8. [Vercel Deployment Guide](#8-vercel-deployment-guide)
9. [MongoDB Atlas Production Setup](#9-mongodb-atlas-production-setup)
10. [REST API Documentation](#10-rest-api-documentation)
11. [Troubleshooting & FAQ](#11-troubleshooting--faq)

---

## 1. Overview

**DrugTrack** is a production-grade, full-stack MERN web application engineered for pharmaceutical manufacturers, distributors, cold-chain warehouses, and hospital dispensaries. It delivers complete visibility over medicinal inventories, automated batch expiration tracking, dynamic stock replenishment, and multi-stage cold-chain telemetry tracking.

The user interface follows the clean, high-precision aesthetic of the [DrugTrack Figma Design](https://www.figma.com/make/djy94sA2L50nDbwB7BJNDD/DrugTrack-Web-Application-UI?t=HX0NCnG9mKqa5YDc-0&preview-route=%2Fadmin%2Fdashboard), sporting a modern emerald-teal healthcare color palette, responsive data grids, interactive progress pipelines, and live telemetry charts.

---

## 2. Key Features

- **Role-Based Access Control (RBAC):** Tailored views, navigation drawers, and restricted endpoints for 4 specialized user roles (`ADMIN`, `SUPPLIER`, `WAREHOUSE_MANAGER`, `PHARMACY_MANAGER`).
- **Interactive Visual Shipment Tracker:** 6-stage telemetry stepper (`ORDER_PLACED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `IN_TRANSIT` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) with sensor temperature monitoring.
- **Automated Inventory Status Calculations:** Real-time classification of batches into `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `EXPIRING_SOON` (within 90 days), and `EXPIRED`.
- **Dynamic Stock Adjustments:** Quick `+` / `-` stock adjustments with integrated audit logging and safety floor protections.
- **Real-Time Clinical Alerts:** Automatic detection and notification center for expired batches, depleted reserves, and delivery milestones.
- **Reporting & Data Export:** One-click CSV and JSON exports for batch registries and procurement invoices.
- **Vercel Serverless Ready:** Native serverless Express routing (`/api`) with connection pooling and SPA fallback.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Data Visualizations:** Recharts (Area, Bar, Donut charts)
- **HTTP Client:** Axios (configured with interceptors and relative `/api` baseURL support)

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB (Local `127.0.0.1:27017` & MongoDB Atlas)
- **ODM:** Mongoose 8 (with global connection caching for serverless environments)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs salted hashing
- **Security & Middleware:** CORS policy, sanitized error handling, rate limiting

---

## 4. System Architecture

```
drugtrack/
│
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, StatCard, ShipmentTracker, Modal)
│   │   ├── contexts/           # AuthContext & AlertContext
│   │   ├── layouts/            # DashboardLayout
│   │   ├── pages/              # Role-specific & Admin Pages
│   │   │   ├── admin/          # Admin Dashboard, Inventory, Drugs, Orders, etc.
│   │   │   ├── supplier/       # Supplier Dashboard, Catalog, Orders, Profile
│   │   │   ├── warehouse/      # Warehouse Dashboard, Stock, Alerts
│   │   │   └── pharmacy/       # Dispensary Dashboard, Orders, Alerts
│   │   ├── routes/             # ProtectedRoute & RoleRoute RBAC guards
│   │   ├── services/           # Axios API Client (api.js)
│   │   ├── App.jsx             # React Router Tree
│   │   └── main.jsx            # DOM Entry
│   ├── vite.config.js          # Vite config with local proxy
│   ├── tailwind.config.js      # Pharmaceutical theme configuration
│   └── package.json
│
├── server/                     # Express.js Backend
│   ├── config/db.js            # MongoDB cached connection (Atlas & Local)
│   ├── controllers/            # REST Controllers (Auth, Drugs, Inventory, Orders, etc.)
│   ├── middleware/             # Auth (protect/authorize) & Error Handlers
│   ├── models/                 # Mongoose Schemas (User, Drug, Inventory, Order, Shipment, Warehouse, Alert)
│   ├── routes/                 # Express API routes
│   ├── seed/seed.js            # Comprehensive database seeding script
│   ├── server.js               # Express application entry
│   └── package.json
│
├── api/
│   └── index.js                # Vercel serverless entry point
├── vercel.json                 # Vercel routing & SPA rewrites
├── .env.example                # Root environment template
├── .gitignore                  # Git exclusion rules
└── README.md                   # Full documentation
```

### Deployment Data Flow

```
LOCAL ENVIRONMENT:
React (localhost:5173) ──> Express (localhost:5000) ──> Local MongoDB (127.0.0.1:27017/drugtrack)

PRODUCTION (VERCEL):
React (Vercel CDN) ──> /api (Serverless Express) ──> MongoDB Atlas Cloud
```

---

## 5. Demo User Credentials

Use any of these 4 pre-seeded accounts to experience role-specific access. All accounts share the same default password:

| Role | Email Address | Password | Portal Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@drugtrack.com` | `password123` | Full administrative control, all 11 modules |
| **Supplier** | `supplier@drugtrack.com` | `password123` | Product catalog, inbound purchase orders, dispatches |
| **Warehouse Manager** | `warehouse@drugtrack.com` | `password123` | Storage hub capacities, batch stock, shipments |
| **Pharmacy Manager** | `pharmacy@drugtrack.com` | `password123` | Hospital dispensary, drug replenishment orders |

> 💡 **Tip:** On the login page, you can use the **One-Click Demo Account Testing** buttons to instantly sign in without typing!

---

## 6. Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB installed locally on your laptop (or MongoDB Atlas connection string)

### Step 1: Clone or Navigate to Project
```bash
cd "Drug inventory management and supply chain web application"
```

### Step 2: Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/drugtrack
JWT_SECRET=drugtrack_production_grade_jwt_secret_key_2026_secure
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Install Dependencies
Run from the root workspace directory:
```bash
npm run install:all
```
*(Or navigate to `server` and run `npm install`, then `client` and run `npm install`)*

---

## 7. Database Seeding

Populate the local database with realistic pharmaceutical data (4 users, 25 drugs, 11 suppliers, 10 regional warehouses, 35 inventory batches, 22 orders, 16 shipments, and clinical alerts):

```bash
# From root:
npm run seed

# Or directly in server folder:
cd server
npm run seed
```

---

## 8. Running the Application

### Option A: Run Both Together (Recommended)
From the root workspace directory:
```bash
npm run dev
```

### Option B: Run in Separate Terminals

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 9. MongoDB Atlas Production Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User with read and write permissions (e.g. `drugtrack_admin`).
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so Vercel serverless functions can connect.
4. Copy your Atlas connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/drugtrack?retryWrites=true&w=majority
   ```
5. Set this string as the `MONGO_URI` environment variable in your Vercel deployment.

---

## 10. Vercel Deployment Guide

DrugTrack is fully configured for deployment on Vercel:

1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete DrugTrack production MERN application"
   git remote add origin https://github.com/YOUR_USERNAME/drugtrack.git
   git push -u origin main
   ```
2. Import the repository in **Vercel**:
   - Framework Preset: **Vite**
   - Root Directory: `./` (leave default)
3. Configure the following **Environment Variables** in Vercel:
   - `MONGO_URI`: Your MongoDB Atlas URI (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure random secret string
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-drugtrack-site.vercel.app`
4. Click **Deploy**. Vercel will:
   - Build the frontend bundle into `client/dist`
   - Mount Express API endpoints onto the serverless `/api` route
   - Automatically handle React Router SPA rewrites for direct link navigation

---

## 11. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated user profile
- `POST /api/auth/logout` — Invalidate user session
- `PUT /api/auth/profile` — Update account profile & password

### Drugs Catalog (`/api/drugs`)
- `GET /api/drugs` — List drugs (search, category filter, pagination)
- `GET /api/drugs/:id` — Single drug details + stock batches
- `POST /api/drugs` — Create new formulation (*Admin, Supplier*)
- `PUT /api/drugs/:id` — Update drug (*Admin, Supplier*)
- `DELETE /api/drugs/:id` — Delete drug (*Admin*)

### Inventory (`/api/inventory`)
- `GET /api/inventory` — List batches (status filter, hub filter, pagination)
- `GET /api/inventory/:id` — Batch specifications & audit log
- `POST /api/inventory` — Register new batch (*Admin, Warehouse*)
- `PUT /api/inventory/:id` — Update batch (*Admin, Warehouse*)
- `POST /api/inventory/:id/adjust` — Quick `+`/`-` stock adjustment
- `DELETE /api/inventory/:id` — Remove batch record (*Admin*)

### Suppliers (`/api/suppliers`)
- `GET /api/suppliers` — List certified suppliers
- `GET /api/suppliers/:id` — Supplier profile & active supply catalog
- `POST /api/suppliers` — Register supplier (*Admin*)
- `PUT /api/suppliers/:id` — Update supplier details (*Admin, Supplier*)
- `DELETE /api/suppliers/:id` — Remove supplier (*Admin*)

### Purchase Orders (`/api/orders`)
- `GET /api/orders` — List orders (scoped by role)
- `GET /api/orders/:id` — Order line items & customer invoice
- `POST /api/orders` — Place new procurement order
- `PUT /api/orders/:id` — Advance order status (*Admin, Supplier, Warehouse*)
- `DELETE /api/orders/:id` — Cancel order

### Shipments (`/api/shipments`)
- `GET /api/shipments` — List shipments with tracking info
- `GET /api/shipments/:id` — Single shipment with complete timeline
- `POST /api/shipments` — Dispatch new shipment
- `PUT /api/shipments/:id` — Advance transit stage & record GPS / temperature checkpoint

### Warehouses (`/api/warehouses`)
- `GET /api/warehouses` — List depositories with live capacity calculations
- `GET /api/warehouses/:id` — Warehouse facility details & stored stock
- `POST /api/warehouses` — Create warehouse (*Admin*)
- `PUT /api/warehouses/:id` — Update warehouse (*Admin, Warehouse*)
- `DELETE /api/warehouses/:id` — Delete facility (*Admin*)

### Alerts (`/api/alerts`)
- `GET /api/alerts` — Fetch clinical & supply chain alerts
- `PUT /api/alerts/:id/read` — Mark alert as read
- `PUT /api/alerts/read-all` — Mark all alerts as read
- `DELETE /api/alerts/:id` — Dismiss alert (*Admin*)

### Dashboard Aggregations (`/api/dashboard`)
- `GET /api/dashboard/admin` — 8 KPI cards, 4 Recharts datasets, watchlist
- `GET /api/dashboard/supplier` — Supplier stats, revenue, product catalog
- `GET /api/dashboard/warehouse` — Depository utilization, stock movements
- `GET /api/dashboard/pharmacy` — Dispensary orders, incoming deliveries

---

## 12. Troubleshooting & FAQ

#### Q: How do I verify my local MongoDB is running?
Run in PowerShell:
```powershell
Get-Service -Name "*mongo*"
```
If the status is not `Running`, start it via:
```powershell
Start-Service -Name "MongoDB"
```

#### Q: What if I refresh `/admin/inventory` on Vercel and get a 404?
`vercel.json` contains a rewrite rule (`"source": "/(.*)", "destination": "/index.html"`) that automatically routes all client-side navigation paths through the React Router entry point.

#### Q: Are credentials or passwords ever saved in plain text?
Never. All passwords are automatically salted and hashed with bcrypt (10 rounds) before persisting to MongoDB. Tokens are cryptographically signed with JWT secrets.

---

## 📄 License
This project is licensed under the MIT License — free for commercial and academic pharmaceutical supply chain management deployments.
