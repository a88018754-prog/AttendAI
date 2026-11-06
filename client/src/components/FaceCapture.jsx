import { useState } from "react";
import { useCamera } from "../lib/useCamera.js";
import { getDescriptor } from "../lib/face.js";

/** Webcam preview with a "Capture" button. Calls onCapture(descriptor). */
export default function FaceCapture({ onCapture, captured }) {
  const { videoRef, ready, error } = useCamera();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    setBusy(true);
    setMsg("");
    const d = await getDescriptor(videoRef.current);
    setBusy(false);
    if (!d) return setMsg("No face found — look straight at the camera in good light.");
    onCapture(d);
    setMsg("Face captured ✔");
  };

  return (
    <div className="space-y-2">
      <video ref={videoRef} muted playsInline className="aspect-video w-full rounded-lg bg-slate-900 object-cover" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="button" className="btn-outline w-full" disabled={!ready || busy} onClick={capture}>
        {!ready ? "Starting camera…" : busy ? "Detecting…" : captured ? "Re-capture face" : "Capture face"}
      </button>
      {msg && <p className={`text-sm ${captured ? "text-green-600" : "text-red-600"}`}>{msg}</p>}
    </div>
  );
}
