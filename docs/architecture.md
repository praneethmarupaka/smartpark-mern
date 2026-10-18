# SmartPark — Architecture & Design Specification

## Overview

**SmartPark** is an enterprise-grade, verifiable urban parking management system built for the Hyderabad metropolitan region using the MERN stack (MongoDB, Express.js, React with Vite, Node.js).

It bridges the gap between public municipal directories, commercial parking operators, and daily commuters.

---

## 1. High-Level System Architecture

```
Commuter / Owner / Admin Browser
             │
             ▼
  ┌────────────────────────────────────────┐
  │   React + Vite Frontend (SPA)          │
  │   - React Router v7                     │
  │   - Tailwind CSS                       │
  │   - Leaflet + React Leaflet            │
  │   - Recharts Visual Analytics          │
  │   - Context API State Management       │
  └───────────────────┬────────────────────┘
                      │ REST API / JSON (Axios)
                      ▼
  ┌────────────────────────────────────────┐
  │   Express.js REST API Backend          │
  │   - JWT Auth & Role Authorization      │
  │   - Rate Limiters & Helmet Security    │
  │   - Transparent Scoring Engine         │
  │   - Concurrency Booking Validator      │
  │   - Audit Event Stream                 │
  └───────────────────┬────────────────────┘
                      │ Mongoose ORM
                      ▼
  ┌────────────────────────────────────────┐
  │   MongoDB Database                     │
  │   - 2dsphere Geospatial Indexing       │
  │   - Text Indexes (name, locality)      │
  │   - Relational References              │
  └────────────────────────────────────────┘
```

---

## 2. Core Modules

### 2.1 Authentication & Role-Based Access Control (RBAC)
- Three distinct personas: `USER` (Commuter), `OWNER` (Facility Operator), `ADMIN` (Platform Governance).
- Passwords salted and hashed with `bcryptjs` (work factor 10).
- Signed JSON Web Tokens (JWT) with configurable expiry (`7d`).
- Express middleware: `authenticate` (token verification) and `requireRole` (privilege enforcement).
- System administrator account created exclusively via secure bootstrap script (`scripts/create-admin.js`), completely isolating admin privilege creation from public HTTP endpoints.

### 2.2 Transparent Recommendation Engine
Facilities are scored across 5 quantifiable dimensions rather than opaque black-box recommendations:
1. **Geospatial Distance (Haversine formula)**: up to 35 points based on commuter proximity.
2. **Directory Verification Status**: 20 points for verified status.
3. **Price Affordability**: 20 points for complimentary/free parking or competitive hourly rates.
4. **Availability Freshness**: 15 points if owner updated slot counts within 4 hours.
5. **Reservation & Vehicle Compatibility**: 10 points for vehicle match and online booking support.

### 2.3 Time-Interval Booking Concurrency Model
- Prevents overselling by validating capacity across requested time intervals `[startTime, endTime]`.
- Counts active overlapping reservations:
  $$\text{Overlap Condition: } (\text{startTime} < \text{requestedEndTime}) \land (\text{endTime} > \text{requestedStartTime})$$
- Generates cryptographically signed QR tokens (`crypto.randomBytes(24)`).
- Ensures atomic status transitions: `CONFIRMED` $\to$ `CHECKED_IN` $\to$ `COMPLETED` (or `CANCELLED` / `EXPIRED`).

### 2.4 Data Integrity & Provenance
- Sourced from official Hyderabad authorities: Hyderabad Metro Rail, South Central Railway, GHMC, and Hyderabad Traffic Police.
- Distinction between `VERIFIED`, `PENDING`, `UNVERIFIED`, `REJECTED`, and `NEEDS_CORRECTION`.
- All administrative modifications generate immutable entries in the `AuditLog` collection.
