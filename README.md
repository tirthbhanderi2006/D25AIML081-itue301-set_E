# DriveEasy Car Rental System

> **Course:** ITUE301 - Advanced Web Development Frameworks  
> **Examination:** Open-Book Practical Examination (Semester 5 | AY 2026–27)  
> **Institution:** Charotar University of Science and Technology (CHARUSAT), CSPIT  
> **Set:** SET E  
> **Roll No:** D25AIML081  
> **Name:** Tirth Bhanderi
> **Batch:** D  

---

## 📌 Project Overview

**DriveEasy** is a full-stack self-drive car rental booking platform built to eliminate double-booking issues previously caused by phone-based reservations. The platform provides a modern, responsive user experience for **Customers**, operational controls for **Fleet Managers**, and full administrative capabilities for **Admins** through Role-Based Access Control (RBAC).

---

## 🛠️ Technology Stack

- **Frontend:** React (Vite), React Router v6, Context API (`AuthContext`), Vanilla CSS with Custom Design Tokens
- **Backend:** Node.js, Express.js REST API
- **Database:** MongoDB with Mongoose ODM
- **Authentication & Security:** JSON Web Tokens (JWT Bearer tokens), Role-Based Access Control (RBAC) middleware, Custom Request Logging

---

## 🏗️ Architecture & Five Exam Tasks Compliance

### Task 1: React Component Architecture
- Reusable `VehicleCard` component inside `/frontend/src/components/` receiving props: `model`, `type`, `pricePerDay`, and `available`.
- Conditional rendering using a ternary operator: Displays a **"Not Available"** badge if `available === false`, or an active **"Book Now"** button if `true`.
- Structured pages: `LoginPage`, `FleetPage`, `MyBookingsPage`, and `AdminPanel`.

### Task 2: React Routing and State Management
- Client-side navigation via React Router without page reloads:
  - `/` &rarr; `LoginPage`
  - `/fleet` &rarr; `FleetPage` *(Protected)*
  - `/my-bookings` &rarr; `MyBookingsPage` *(Protected)*
  - `/admin` &rarr; `AdminPanel` *(Lazy-loaded via `React.lazy()` + `<Suspense />`)*
- `AuthContext` managing global authentication state (`customer`, `token`, `role`, `login()`, `logout()`).
- `ProtectedRoute` component redirecting unauthenticated users to `/` (`<Navigate to="/" replace />`) with RBAC guards.
- Dynamic booking form in `FleetPage` managing `selectedVehicle`, `pickupDate`, and `returnDate` with real-time UI state reflection.

### Task 3: Express REST API + Middleware
- REST endpoints exposed at `/api/v1/`:
  - `POST /api/v1/auth/login` — Customer/Staff authentication and token issuance
  - `GET /api/v1/vehicles` — Public vehicle catalog listing
  - `POST /api/v1/bookings` — Protected booking creation
  - `GET /api/v1/bookings/my` — Customer-specific reservations with populated references
  - `PATCH /api/v1/bookings/:id/status` — Status updates (`reserved`, `ongoing`, `completed`, `cancelled`)
  - `PATCH /api/v1/vehicles/:id/availability` — Manager/Admin toggle vehicle availability
  - `POST /api/v1/vehicles` & `DELETE /api/v1/vehicles/:id` — Admin vehicle creation and removal
- Custom `requestLogger` middleware globally applied, logging `[METHOD] [PATH] [TIMESTAMP]`.
- Custom `authGuard` middleware enforcing Bearer token validation with HTTP 401 error responses.
- Centralized `errorHandler` middleware returning structured JSON error responses.

### Task 4: REST API Consumption in React
- Live data fetching via `fetch` inside `useEffect()` on component mount.
- Three explicit state variables maintained: `vehicles`, `loading`, and `error`.
- Client-side filter (`All` | `Hatchback` | `Sedan` | `SUV`) using `.filter()` on the cached array without redundant network calls.

### Task 5: MongoDB + Mongoose Schema Design and Validation
- Mongoose schemas with schema-level validation:
  - **Customer:** `name` (required), `email` (required, unique), `licenseNumber` (required, unique), `role` (enum)
  - **Vehicle:** `model` (required), `type` (required, enum), `pricePerDay` (required, min: 0), `available` (Boolean, default: true)
  - **Booking:** `customerId` (ref: Customer), `vehicleId` (ref: Vehicle), `pickupDate` (required), `returnDate` (required), `status` (enum)
- Strict double-booking prevention: `POST /api/v1/bookings` verifies `vehicle.available === true`. If unavailable, rejects with HTTP 400 and meaningful JSON error. On success, updates `vehicle.available = false`.
- Populated references via `.populate('customerId', 'name email')` and `.populate('vehicleId', 'model type pricePerDay')`.

---

## 👥 Role-Based Access Control (RBAC)

| Role | Permissions |
| :--- | :--- |
| **Customer** | View public fleet, create bookings, view own bookings, cancel own reservation |
| **Fleet Manager** | All customer permissions + audit all system bookings, update any booking status, toggle vehicle availability |
| **Admin** | Full system authority + add new vehicles to fleet, delete vehicles from fleet, access Admin Command Center |

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18+ or v22+)
- MongoDB running locally on `localhost:27017`

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Environment Configuration
# Copy .env.example to .env (MongoDB connection string and PORT)
cp .env.example .env

# Seed initial database with users, vehicles, and test bookings
npm run seed
# or: node seed.js

# Start backend server (starts on http://localhost:5000)
npm start
# or: node server.js
```

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite React development server (starts on http://localhost:3000)
npm run dev
```

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | License Number |
| :--- | :--- | :--- |
| **Customer** | `tirth@example.com` | `GJ01-2023-0098765` |
| **Fleet Manager** | `manager@driveeasy.com` | `GJ01-2021-MGR001` |
| **Admin** | `admin@driveeasy.com` | `GJ01-2020-ADM999` |

> *Tip:* The Login page includes 1-click quick login buttons for all three roles.

---

## 📡 API Reference Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user, issue JWT token |
| `GET` | `/api/v1/vehicles` | Public | Get all fleet vehicles |
| `POST` | `/api/v1/vehicles` | Admin | Add new vehicle to fleet |
| `PATCH` | `/api/v1/vehicles/:id/availability` | Manager / Admin | Toggle vehicle availability |
| `DELETE`| `/api/v1/vehicles/:id` | Admin | Remove vehicle from fleet |
| `POST` | `/api/v1/bookings` | Protected | Create booking (checks availability, returns 201) |
| `GET` | `/api/v1/bookings/my` | Protected | Get customer's own bookings (populated) |
| `GET` | `/api/v1/bookings` | Manager / Admin | Audit all bookings in system (RBAC 403 for Customer) |
| `PATCH` | `/api/v1/bookings/:id/status` | Protected | Update booking status (`reserved`, `ongoing`, `completed`, `cancelled`) |

---

## 📄 License & Attribution

Developed as part of the ITUE301 Advanced Web Development Frameworks Practical Examination at CSPIT, CHARUSAT.  
Student: **D25AIML081 (Batch D)**.
