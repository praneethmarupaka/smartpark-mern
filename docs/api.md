# SmartPark — REST API Reference

Base URL: `/api`

All JSON responses follow the standardized `ApiResponse` structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Access**: Public
- **Rate Limit**: 50 req / 15 min
- **Body**:
  ```json
  {
    "name": "Full Name",
    "email": "user@example.com",
    "password": "Password123",
    "role": "USER", // "USER" or "OWNER" (ADMIN cannot be self-registered)
    "phone": "+91 98480 12345",
    "vehicleInfo": {
      "vehicleType": "FOUR_WHEELER",
      "vehicleNumber": "TS09EA1234"
    }
  }
  ```
- **Response**: `201 Created` with JWT token and user record (without password hash).

### `POST /api/auth/login`
- **Access**: Public
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `200 OK` with JWT token and user object.

### `GET /api/auth/me`
- **Access**: Authenticated (Bearer Token)
- **Response**: `200 OK` with current user object.

### `PATCH /api/auth/profile`
- **Access**: Authenticated
- **Body**: `{ "name": "...", "phone": "...", "vehicleInfo": { ... } }`

---

## 2. Parking Facilities (`/api/parking`)

### `GET /api/parking`
- **Access**: Public
- **Query Parameters**:
  - `page`: default 1
  - `limit`: default 20 (max 100)
  - `search`: search query by name, locality, address
  - `category`: `PUBLIC`, `PRIVATE`, `COMMERCIAL`, `GOVERNMENT`, `GHMC`, `TRANSPORT`, `OTHER`
  - `vehicleType`: `TWO_WHEELER`, `FOUR_WHEELER`
  - `verifiedOnly`: `true` | `false`
  - `bookingSupported`: `true` | `false`
  - `sortBy`: `createdAt`, `price_asc`, `price_desc`, `freshness`, `name`

### `GET /api/parking/nearby`
- **Access**: Public
- **Query Parameters**:
  - `lat` (required): WGS-84 latitude
  - `lng` (required): WGS-84 longitude
  - `radiusKm`: radius in km (default 5, max 50)
  - `priority`: `best_overall`, `nearest`, `lowest_price`, `verified`, `fresh_availability`
- **Response**: Sorted facilities with distance in km, transparent recommendation scores (0-100), and explanation reasons.

### `GET /api/parking/:id`
- **Access**: Public
- **Response**: Facility record with owner-reported freshness calculation and stale warning flag.

### `POST /api/parking`
- **Access**: Authorized (`OWNER`, `ADMIN`)
- **Note**: Owner submissions automatically default to `verificationStatus: 'PENDING'`.

### `PATCH /api/parking/:id`
- **Access**: Authorized (`OWNER` of facility, or `ADMIN`)
- **Note**: Owner changes to critical location/access fields trigger re-verification requirement.

### `POST /api/parking/:id/report`
- **Access**: Authenticated
- **Rate Limit**: 10 req / hour
- **Body**:
  ```json
  {
    "issueType": "INCORRECT_PRICE",
    "explanation": "Rate has changed to Rs 30/hr as per new municipal board."
  }
  ```

---

## 3. Bookings (`/api/bookings`)

### `POST /api/bookings`
- **Access**: Authenticated
- **Body**:
  ```json
  {
    "parkingId": "6ad4...",
    "vehicleType": "FOUR_WHEELER",
    "vehicleNumber": "TS09EA1234",
    "startTime": "2026-10-19T09:00:00Z",
    "endTime": "2026-10-19T13:00:00Z"
  }
  ```
- **Validation**: Checks overlapping interval capacity. Generates cryptographically signed QR token and Data URL.

### `GET /api/bookings/my`
- **Access**: Authenticated
- **Response**: User's past and upcoming reservations with statuses and QR data.

### `PATCH /api/bookings/:id/cancel`
- **Access**: Authenticated (Owner of booking or Admin)
- **Behavior**: Releases slot back to available capacity.

---

## 4. Operator Endpoints (`/api/owner`)

### `GET /api/owner/dashboard`
- **Access**: `OWNER`, `ADMIN`
- **Response**: Facility counts, active bookings, real revenue calculated from completed bookings.

### `PATCH /api/owner/parking/:id/availability`
- **Access**: Authorized Owner / Admin
- **Body**: `{ "twoWheelerSlots": 80, "fourWheelerSlots": 25, "operationalStatus": "OPEN" }`
- **Validation**: Rejects negative numbers and counts exceeding total capacity.

### `POST /api/owner/validate-qr`
- **Access**: `OWNER`, `ADMIN`
- **Body**: `{ "tokenOrRef": "SP-20261018-ACTV" }`
- **Behavior**: Validates reservation status, sets `CHECKED_IN`, records timestamp.

### `POST /api/owner/checkout-qr`
- **Access**: `OWNER`, `ADMIN`
- **Body**: `{ "tokenOrRef": "SP-20261018-ACTV" }`
- **Behavior**: Completes booking, marks `COMPLETED`, releases slot.

---

## 5. Administrator Governance (`/api/admin`)

- `GET /api/admin/dashboard`
- `GET /api/admin/parking/pending`: Pending verification queue
- `PATCH /api/admin/parking/:id/verification`: Approve (`VERIFIED`), Reject (`REJECTED` with required reason), or Request Corrections (`NEEDS_CORRECTION`)
- `GET /api/admin/coverage`: Detailed Hyderabad coverage audit metrics
- `POST /api/admin/import/preview`: Preview records & duplicate detection
- `POST /api/admin/import/commit`: Commit records with UNVERIFIED default
- `GET /api/admin/audit-logs`: Immutable platform action stream
- `PATCH /api/admin/users/:id/status`: Toggle user suspension
