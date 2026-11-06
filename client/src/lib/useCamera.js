import { useEffect, useRef, useState } from "react";
import { loadModels } from "./face.js";

/** Starts the webcam + loads face models; stops the camera on unmount. */
export function useCamera(enabled = true) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    let stream;
    let cancelled = false;
    (async () => {
      try {
        const [s] = await Promise.all([navigator.mediaDevices.getUserMedia({ video: { width: 480 } }), loadModels()]);
        stream = s;
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = s;
        await videoRef.current.play();
        setReady(true);
      } catch (e) {
        setError(e.name === "NotAllowedError" ? "Camera permission denied" : "Could not start camera or load face models");
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled]);

  return { videoRef, ready, error };
}
