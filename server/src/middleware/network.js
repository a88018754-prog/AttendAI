import requestIp from "request-ip";
import ipRangeCheck from "ip-range-check";
import Setting from "../models/Setting.js";

// Normalise IPv4-mapped IPv6 addresses ("::ffff:192.168.0.10" -> "192.168.0.10")
export const clientIp = (req) => (requestIp.getClientIp(req) || "").replace(/^::ffff:/, "");

/** Blocks the request unless it comes from an admin-approved IP range. */
export async function requireInstituteNetwork(req, res, next) {
  const ip = clientIp(req);
  const { allowedIpRanges } = await Setting.get();
  if (!ip || !ipRangeCheck(ip, allowedIpRanges)) {
    return res.status(403).json({ message: "Attendance is only allowed when connected to institute WiFi", ip });
  }
  req.clientIp = ip;
  next();
}
