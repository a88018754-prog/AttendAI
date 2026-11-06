import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../lib/api.js";
import { useCamera } from "../lib/useCamera.js";
import { getDescriptor } from "../lib/face.js";

// Messages that mean "stop trying" (vs. a retryable face mismatch)
const FINAL = [409, 403, 400];

export default function MarkAttendance() {
  const [network, setNetwork] = useState(null); // { ip, allowed }
  const { videoRef, ready, error } = useCamera(network?.allowed === true && network?.attendanceOpen === true);
  const [status, setStatus] = useState({ type: "info", text: "Checking network…" });
  const done = useRef(false);

  // 1. Check network first (server still re-checks on /mark)
  useEffect(() => {
    api.get("/attendance/network-status").then(({ data }) => {
      setNetwork(data);
      setStatus(data.allowed
        ? data.attendanceOpen
          ? { type: "info", text: "Starting camera…" }
          : { type: "error", text: `Attendance is closed. The admin-configured closing time is ${data.closesAt}.` }
        : { type: "error", text: "Attendance is only allowed when connected to institute WiFi" });
    }).catch((e) => setStatus({ type: "error", text: errMsg(e) }));
  }, []);

  // 2. Once camera is ready, scan every second until the server accepts or gives a final answer
  useEffect(() => {
    if (!ready) return;
    setStatus({ type: "info", text: "Looking for your face…" });
    let busy = false;
    const timer = setInterval(async () => {
      if (busy || done.current) return;
      busy = true;
      try {
        const descriptor = await getDescriptor(videoRef.current);
        if (!descriptor) return;
        setStatus({ type: "info", text: "Face detected, verifying…" });
        const { data } = await api.post("/attendance/mark", { faceDescriptor: descriptor });
        done.current = true;
        setStatus({ type: "success", text: `${data.message} (${data.status})` });
      } catch (e) {
        const code = e.response?.status;
        if (FINAL.includes(code)) done.current = true;
        setStatus({ type: "error", text: errMsg(e) });
      } finally {
        busy = false;
        if (done.current) clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [ready, videoRef]);

  const color = { info: "text-slate-600", success: "text-green-700 bg-green-50", error: "text-red-700 bg-red-50" }[status.type];

  return (
    <div className="card mx-auto max-w-xl space-y-4">
      <h1 className="text-xl font-bold">Mark attendance</h1>
      {network && <p className="text-xs text-slate-500">Your IP: {network.ip}</p>}
      {network?.allowed && network?.attendanceOpen && (
        <video ref={videoRef} muted playsInline className="aspect-video w-full rounded-lg bg-slate-900 object-cover" />
      )}
      <p className={`rounded-lg p-3 font-medium ${color}`}>{error || status.text}</p>
      <Link to="/student" className="btn-outline inline-block">Back to dashboard</Link>
    </div>
  );
}
