import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Setting from "./models/Setting.js";
import authRoutes from "./routes/auth.js";
import attendanceRoutes from "./routes/attendance.js";
import adminRoutes from "./routes/admin.js";
import { scheduleAutoAbsent } from "./jobs/autoAbsent.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });

// Only trust X-Forwarded-For when actually behind a proxy, otherwise clients could spoof their IP.
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
app.set("io", io);
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: "100kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);

// Central error handler (Express 5 forwards rejected async handlers here automatically)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

// Socket auth: only admins join the "admins" room that receives live updates
io.use((socket, next) => {
  try {
    socket.user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});
io.on("connection", (socket) => {
  if (socket.user.role === "admin") socket.join("admins");
});

async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set");
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    { name: "Administrator", role: "admin", password: await bcrypt.hash(ADMIN_PASSWORD, 10) },
    { upsert: true }
  );
}

await connectDB(process.env.MONGO_URI);
await seedAdmin();
const settings = await Setting.get();
scheduleAutoAbsent(io, settings.absentAt);
server.listen(process.env.PORT || 5000, () => console.log(`API on :${process.env.PORT || 5000}`));
