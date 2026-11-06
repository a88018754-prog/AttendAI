# AttendAI — Smart Attendance System

React + Tailwind frontend, Node/Express + MongoDB backend, face-api.js for face recognition,
Socket.io for live admin updates, node-cron for automatic absent marking.

## Run locally

Requirements: Node 18+, MongoDB running locally (or a MongoDB Atlas URI).

```bash
# 1. Backend
cd server
cp .env.example .env      # edit values (admin email/password, Mongo URI, JWT secret)
npm install
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Log in as admin with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. Students register at `/register`.

> **Testing the WiFi check:** When you open the app on the same computer, your IP is `127.0.0.1`.
> In the admin dashboard, add `127.0.0.1` (or `::1`) to the allowed ranges, or open the app from your
> phone or laptop using the computer's LAN address (e.g. `http://192.168.0.12:5173`).
> Browsers only allow camera access on `localhost` or HTTPS.

## Folder structure

```
server/src
  index.js              Express app, Socket.io, admin seeding, cron start
  config/db.js          Mongo connection
  models/               User, Attendance (unique student+date), Setting (allowed IP ranges)
  middleware/auth.js    JWT verification + role guard
  middleware/network.js IP extraction (request-ip) + range check (ip-range-check)
  routes/auth.js        register / login / me / update face
  routes/attendance.js  student: network status, mark, history
  routes/admin.js       stats, students, history, by date, CSV export, settings
  jobs/autoAbsent.js    10:30 daily job marking absentees
  utils/time.js         timezone-aware Present / Late / Closed rules
  utils/face.js         descriptor validation + euclidean distance
client/src
  context/AuthContext   session state
  lib/face.js           model loading + descriptor extraction
  lib/useCamera.js      webcam hook
  components/           FaceCapture, Navbar, StatusBadge
  pages/                Login, Register, StudentDashboard, MarkAttendance, AdminDashboard, StudentDetail
```

## Key design decisions

- **Face matching happens on the server.** The browser only extracts a 128-number descriptor.
  The server compares it with the stored one (euclidean distance ≤ 0.5). The stored descriptor
  is never sent back to the client (`select: false`).
- **The IP check runs on the backend** as middleware on `POST /api/attendance/mark`. The
  `/network-status` endpoint only helps the UI. `trust proxy` stays off unless `TRUST_PROXY=true`,
  so clients can't fake `X-Forwarded-For`.
- **Allowed ranges are set by the admin** (CIDR or single IPs) and stored in MongoDB.
- **Duplicates** are blocked twice: by a check before inserting, and by a unique index on
  `{student, date}`, which also covers two requests arriving at the same moment.
- **Time rules** use `TZ_NAME` (default Asia/Kolkata). Admins can configure the Present cutoff,
  attendance closing time, and automatic absent time in the dashboard (defaults: 09:30, 10:00, and 10:30).
  Changes to the absent time reschedule the daily job immediately.
- **Real-time updates:** sockets log in with the JWT. Only admins join the `admins` room, which
  receives `attendance:marked` and `attendance:absent-run` events.

## API

| Method | Path | Role |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me · PUT /api/auth/face | any |
| GET | /api/attendance/network-status, /history · POST /mark | student |
| GET | /api/admin/stats?date, /attendance?date, /students, /students/:id/attendance | admin |
| GET | /api/admin/export?from&to (CSV) | admin |
| GET/PUT | /api/admin/settings · POST /api/admin/run-absent-job | admin |
