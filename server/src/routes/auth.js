import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { isValidDescriptor } from "../utils/face.js";

const router = Router();

const publicUser = (u) => ({
  id: u._id, name: u.name, email: u.email, role: u.role,
  studentId: u.studentId, course: u.course, faceRegistered: u.faceRegistered,
});

// Student self-registration (with face descriptor captured in the browser)
router.post("/register", async (req, res) => {
  const { name, email, password, studentId, course, faceDescriptor } = req.body;
  if (!name || !email || !password || !studentId || !course)
    return res.status(400).json({ message: "All fields are required" });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
  if (!isValidDescriptor(faceDescriptor)) return res.status(400).json({ message: "Please capture your face" });
  if (email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase())
    return res.status(400).json({ message: "This email cannot be used" });

  const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { studentId }] });
  if (exists) return res.status(409).json({ message: "Email or Student ID already registered" });

  const user = await User.create({
    name, email, studentId, course, role: "student",
    password: await bcrypt.hash(password, 10),
    faceDescriptor, faceRegistered: true,
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(publicUser(user));
});

// Re-capture face (e.g. if the first capture was poor)
router.put("/face", requireAuth, async (req, res) => {
  if (!isValidDescriptor(req.body.faceDescriptor)) return res.status(400).json({ message: "Invalid face data" });
  await User.findByIdAndUpdate(req.user.id, { faceDescriptor: req.body.faceDescriptor, faceRegistered: true });
  res.json({ message: "Face updated" });
});

export default router;
