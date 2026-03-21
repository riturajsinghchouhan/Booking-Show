# 🎬 BookMyShow Lite++

A **production-ready** full-stack MERN movie ticket booking platform — featuring seat locking, real-time conflict prevention, backend-driven pricing, and JWT-based role authentication.

---

## 🚀 Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment

Copy `server/.env.example` to `server/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookmyshow
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### 3. Run

```bash
# Terminal 1 — Start backend
cd server
npm start

# Terminal 2 — Start frontend
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔹 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (role: user/admin) |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Admin (requires Admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/movies` | Create movie |
| GET | `/api/admin/movies` | List all movies |
| DELETE | `/api/admin/movies/:id` | Delete movie |
| POST | `/api/admin/shows` | Create show (auto-generates 30 seats) |
| GET | `/api/admin/shows` | List all shows |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | Browse movies (search, genre, pagination) |
| GET | `/api/movies/:id` | Movie detail |
| GET | `/api/shows/:movieId` | Shows for a movie |
| GET | `/api/shows/detail/:showId` | Show detail |
| POST | `/api/seats/lock` | Lock seats for 2 min (protected) |
| POST | `/api/book` | Book locked seats (protected) |
| GET | `/api/bookings/:userId` | Booking history (protected) |

---

## 🔹 Seat Pricing

| Seats | Tier | Price |
|-------|------|-------|
| 1–10 | Economy | ₹150 |
| 11–20 | Premium | ₹180 |
| 21–30 | VIP | ₹200 |

> **Price is always calculated server-side.**

---

## 🔹 Seat Locking Flow

1. User selects seats → clicks **Lock Seats**
2. Backend locks chosen seats for **2 minutes** (stores `lockedBy` + `lockExpiry` per seat)
3. 409 is returned if seats are already booked or locked by another user
4. User must confirm booking within 2 minutes
5. Expired locks are cleaned up both **lazily** (on each request) and **periodically** (background setInterval every 60s using MongoDB arrayFilters)

---

## 🔹 Assumptions

- No external payment gateway is integrated
- Seat state is stored embedded in the Show document for efficient atomic reads
- JWT is passed as `Authorization: Bearer <token>` header
- Admin account must be created via `/api/auth/register` with `role: "admin"`

---

## 🗂 Folder Structure

```
/
├── server/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── showController.js  ← seat locking logic
│   │   └── bookingController.js
│   ├── middleware/
│   │   ├── auth.js (JWT + role guard)
│   │   └── errorHandler.js
│   ├── models/ (User, Movie, Show, Booking)
│   ├── routes/ (auth, admin, user)
│   ├── .env.example
│   └── index.js
└── client/
    └── src/
        ├── api/index.js (axios)
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Login.jsx / Login.css
        │   └── Navbar.jsx / Navbar.css
        └── pages/
            ├── MovieListing, MovieDetail, SeatSelection, BookingHistory
            └── admin/ (AdminMovies, AddMovie, AdminShows, AddShow)
```
