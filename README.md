# SmartPark — Smart Parking Management System (Hyderabad)

[![Node.js](https://img.shields.io/badge/Node.js-v24+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%202dsphere-brightgreen.svg)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com)

**SmartPark** is a complete, production-ready full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed for commuters, parking facility operators, and municipal administrators across the Greater Hyderabad metropolitan area.

Built as a high-caliber **B.Tech Portfolio Project**, SmartPark demonstrates real-world software engineering rigor:
- Native **MongoDB 2dsphere geospatial queries** and transparent multi-factor recommendation scoring.
- **Time-interval reservation concurrency validation** preventing overlapping double-bookings.
- Cryptographically signed **QR Code check-in and check-out vouchers**.
- A multi-tiered **verification pipeline** (`VERIFIED`, `PENDING`, `UNVERIFIED`, `REJECTED`, `NEEDS_CORRECTION`) with an immutable **Audit Trail**.
- Honest **data coverage auditing** with CSV batch ingestion and duplicate detection.

---

## 1. Demo Personas & Credentials

The application includes seeded accounts with pre-populated Hyderabad facilities and sample reservations. You can log in using the credentials below, or click the **1-Click Demo Persona buttons** directly on the [Sign In page](/login):

| Persona | Role | Email | Password | Primary Permissions |
|---|---|---|---|---|
| **System Administrator** | `ADMIN` | `admin@smartpark.hyderabad.gov` | `AdminSecurePass#2026` | Verification queue, approve/reject listings, CSV import, user management, audit logs, coverage metrics |
| **Facility Operator** | `OWNER` | `owner@hyderabadmetro.org` | `OwnerPass#2026` | Register facilities, update live slots, scan QR codes, check-in/out vehicles, real revenue analytics |
| **Daily Commuter** | `USER` | `commuter@gmail.com` | `UserPass#2026` | Geospatial search, smart recommendations, book parking, generate QR pass, save favorites, report issues |

---

## 2. Technology Stack

- **Frontend**: React (Vite), React Router v7, Tailwind CSS, Leaflet & React-Leaflet (OpenStreetMap tiles), Recharts, Lucide React icons, Axios.
- **Backend**: Node.js, Express.js (ES6+ Modules), Mongoose, JWT (`jsonwebtoken`), bcryptjs, express-validator, Helmet, express-rate-limit, Morgan, QRCode.
- **Database**: MongoDB with 2dsphere geospatial indexing, compound indexes and unique constraints.
- **Testing**: Node.js native test runner (`node --test`), Supertest, assert.

---

## 3. Project Structure

```
smart-parking/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── api/                 # Axios client modules (auth, parking, booking, owner, admin)
│   │   ├── components/          # Common UI, Map, Parking cards, Filters, QR modal
│   │   ├── contexts/            # AuthContext (JWT session management)
│   │   ├── hooks/               # useAuth, useGeolocation, useDebounce
│   │   ├── layouts/             # MainLayout, DashboardLayout (sidebar)
│   │   ├── pages/
│   │   │   ├── auth/            # LoginPage, RegisterPage
│   │   │   ├── public/          # LandingPage, DiscoveryPage, ParkingDetailPage, HowItWorks
│   │   │   ├── user/            # Profile, Favorites, MyBookings
│   │   │   ├── owner/           # OwnerDashboard, MyParking, AddParking, EditParking, QrValidation, Analytics
│   │   │   └── admin/           # AdminDashboard, VerificationQueue, DirectoryManagement, ImportParking, Coverage, Reports, Users, AuditLogs
│   │   ├── routes/              # AppRoutes with role-based Route Guards
│   │   └── styles/              # Tailwind CSS entry
│   ├── package.json
│   └── vite.config.js
├── server/                      # Express REST API Backend
│   ├── src/
│   │   ├── config/              # Database connection and environment validation
│   │   ├── controllers/         # Auth, Parking, Booking, Owner, Admin, Import, Favorite
│   │   ├── middleware/          # JWT auth, RBAC, Rate limiter, Error handler, Validator
│   │   ├── models/              # User, Parking, Booking, ParkingReport, AuditLog, DataImportJob, Favorite, Review
│   │   ├── routes/              # Express API route modules
│   │   ├── services/            # RecommendationService, BookingService, ImportService, AuditService
│   │   ├── utils/               # Geospatial calculations, QR code generation, ApiResponse
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server startup and graceful shutdown
│   ├── tests/                   # Backend API test suites (Auth, Parking, Booking, Admin)
│   └── package.json
├── scripts/
│   ├── create-admin.js          # Secure admin account bootstrap script
│   └── seed-sample-data.js      # Seed realistic Hyderabad directory & sample records
├── sample-data/
│   ├── parking-template.csv     # Standard import template
│   ├── hyderabad-parking-sample.csv # Sample verified/unverified records
│   └── README.md
├── docs/
│   ├── architecture.md          # Architectural diagrams and design specifications
│   ├── api.md                   # Full REST API documentation
│   ├── data-import.md           # CSV/GeoJSON ingestion guide
│   └── deployment.md            # MongoDB Atlas, Render and Vercel instructions
└── package.json                 # Monorepo workspaces configuration
```

---

## 4. Key Architectural & Correctness Highlights

### 4.1 Native Geospatial Discovery & Transparent Recommendations
- Uses MongoDB **2dsphere indexes** with `$near` geospatial operator.
- Scoring formula (0 to 100) incorporates Haversine distance ($\le 35$ pts), verification badge ($20$ pts), pricing affordability ($20$ pts), freshness of availability ($15$ pts), and reservation support ($10$ pts).
- Full transparency: Each recommendation displays clear explanation reasons (e.g. *"Within 1 km"*, *"Verified location"*, *"Lower listed price"*).

### 4.2 Booking Overlap Concurrency Control
Time-interval reservations validate overlap against total capacity rather than relying only on a momentary slot counter:
$$\text{Overlap Condition: } (\text{startTime} < \text{requestedEndTime}) \land (\text{endTime} > \text{requestedStartTime})$$
Overlapping active bookings (`CONFIRMED` or `CHECKED_IN`) are counted; reservations exceeding capacity are rejected with HTTP 400.

### 4.3 QR Gate Validation & Operator Lifecycle
- Booking references follow readable format: `SP-YYYYMMDD-XXXX`.
- QR tokens are cryptographically generated with 192-bit entropy (`crypto.randomBytes(24)`).
- Operators validate passes via direct reference input or token scan.
- Enforces single-use check-in, prevents duplicate check-in/out, and auto-expires bookings past the window.

### 4.4 Data Directory Integrity & Provenance
- Sourced from legitimate Hyderabad authorities (Hyderabad Metro Rail, South Central Railway, GHMC, Hyderabad Traffic Police).
- Newly imported or owner-submitted records default to `UNVERIFIED` or `PENDING`. They are never marked `VERIFIED` without an explicit administrator review.
- All admin decisions (approvals, rejections with mandatory reasons, status suspensions) are permanently recorded in the `AuditLog` collection.

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js v18+ (tested on v24.18)
- Local MongoDB running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Step 1: Install Dependencies
From the repository root:
```bash
npm install
```

### Step 2: Environment Variables
Create `server/.env` (or copy from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/smartpark_dev
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_123456
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_BOOTSTRAP_EMAIL=admin@smartpark.hyderabad.gov
ADMIN_BOOTSTRAP_PASSWORD=AdminSecurePass#2026
```

Create `client/.env`:
```env
VITE_API_BASE_URL=/api
```

### Step 3: Seed Sample Hyderabad Directory & Create Admin
```bash
# Seed realistic Hyderabad directory, users and sample bookings
node scripts/seed-sample-data.js

# Bootstrap or verify initial administrator
node scripts/create-admin.js
```

### Step 4: Run Application in Development Mode
In two separate terminals:
```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
npm run dev:server

# Terminal 2: React Frontend (runs on http://localhost:5173)
npm run dev:client
```
Open **http://localhost:5173** in your browser.

---

## 6. Automated Testing

SmartPark includes automated test suites covering authentication, geospatial discovery, booking lifecycle, and admin verification:

```bash
# Run all backend test suites
npm run test:server
```

### Test Suite Summary:
- **`tests/auth.test.js`**: Valid login, invalid password rejection (401), role escalation prevention (rejects attempt to self-assign ADMIN), unauthenticated route protection (401), health check.
- **`tests/parking.test.js`**: Directory pagination, category filtering, verified-only filtering, 2dsphere nearby search with recommendations, rejection of invalid coordinates (400).
- **`tests/booking.test.js`**: Rejection of past start times, invalid intervals (end $\le$ start), rejection when booking is unsupported, confirmed reservation creation with QR payload, slot release upon cancellation.
- **`tests/admin.test.js`**: Rejection of non-admin access (403), platform statistics retrieval, mandatory rejection reasons, verification status approval and audit recording, coverage statistics.

**Result: 19 / 19 tests passing.**

---

## 7. Production Build

To build the client SPA for deployment on Vercel:
```bash
npm run build:client
```
Generates production-optimized assets in `client/dist`.

---

## 8. Documentation

- [System Architecture & Design Specification](docs/architecture.md)
- [REST API Reference](docs/api.md)
- [Data Sourcing & Import Guide](docs/data-import.md)
- [Deployment Guide (Atlas, Render, Vercel)](docs/deployment.md)

---

## License
MIT License. Built for B.Tech Portfolio Demonstration.
