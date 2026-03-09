# 🗓 BookSlot — SaaS Appointment Booking System

A full-stack Calendly-style booking platform built with Next.js, Express, and PostgreSQL.

## Tech Stack
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (with exclusion constraint for double-booking prevention)
- **Auth**: JWT (7-day tokens)

---

## Project Structure

```
booking-saas/
├── backend/
│   ├── db/
│   │   ├── index.js          # PostgreSQL pool
│   │   └── schema.sql        # Database schema + constraints
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js           # POST /register, POST /login, GET /me
│   │   ├── services.js       # CRUD services + public endpoint
│   │   ├── appointments.js   # Booking, slots, status updates
│   │   └── availability.js   # Working hours management
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── pages/
    │   └── index.jsx         # Full app (auth + dashboard + booking)
    ├── lib/
    │   └── api.js            # Axios API client
    └── package.json
```

---

## Quick Start

### 1. Database Setup
```bash
createdb bookslot
psql bookslot -f backend/db/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npm run dev
# API runs on http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
# Create .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
npm run dev
# App runs on http://localhost:3000
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register business + seed availability |
| POST | `/api/login` | Login, returns JWT |
| GET | `/api/me` | Get current user (auth required) |

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services` | ✅ | List own services |
| GET | `/api/services/public/:slug` | ❌ | Public services for booking page |
| POST | `/api/services` | ✅ | Create service |
| PUT | `/api/services/:id` | ✅ | Update service |
| DELETE | `/api/services/:id` | ✅ | Soft-delete service |

### Appointments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/appointments` | ✅ | List appointments (filterable by date/range) |
| GET | `/api/appointments/customers` | ✅ | Unique customer list |
| GET | `/api/appointments/slots/:slug/:serviceId/:date` | ❌ | Available time slots |
| POST | `/api/appointments` | ❌ | Book appointment (public) |
| PATCH | `/api/appointments/:id/status` | ✅ | Update status |

### Availability
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/availability` | ✅ | Get working hours |
| GET | `/api/availability/public/:slug` | ❌ | Public availability |
| PUT | `/api/availability/:dayOfWeek` | ✅ | Update single day |
| PUT | `/api/availability/bulk` | ✅ | Update all days |

---

## Key Features

### Double-Booking Prevention
Uses PostgreSQL's **exclusion constraint** with `tstzrange` and `btree_gist` extension:
```sql
EXCLUDE USING gist (
  business_id WITH =,
  tstzrange(appointment_time, end_time, '[)') WITH &&
) WHERE (status != 'cancelled')
```
This guarantees at the database level that no two active appointments overlap for the same business, even under concurrent requests.

### Public Booking Flow
1. Customer visits `/book/{business-slug}`
2. Selects a service
3. Picks an available date (respects working hours)
4. Picks an available time slot (excludes already-booked slots)
5. Enters name + phone
6. Confirms → appointment created with conflict check

### JWT Auth Flow
- Tokens expire in 7 days
- Include in requests: `Authorization: Bearer <token>`
- On registration, Mon–Fri 9am–5pm availability is auto-seeded

---

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/bookslot
JWT_SECRET=your-super-secret-key-minimum-32-chars
PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
