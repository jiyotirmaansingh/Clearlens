import React, { useEffect, useRef, useState, useMemo } from "react";
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "/api";
const API_POST = `${API_BASE}/sessions`;
const API_GET = `${API_BASE}/sessions`;

export default function CalmCam() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);

  const faceDetectedRef = useRef(false);
  const focusedRef = useRef(false);
  const mouthOpenRef = useRef(false);

  const secondsRef = useRef(0);
  const focusedSecondsRef = useRef(0);
  const intervalRef = useRef(null);

  const [faceDetected, setFaceDetected] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [sessionRunning, setSessionRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [focusedSeconds, setFocusedSeconds] = useState(0);
  const [focusPercent, setFocusPercent] = useState(100);
  const [sessionReport, setSessionReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [statusMsg, setStatusMsg] = useState("Idle");

  const [showHistory, setShowHistory] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [toasts, setToasts] = useState([]);
  const lastToastRef = useRef(0);

  const quotes = [
    "Small focus blocks build big results.",
    "One thing at a time. You’ve got this.",
    "Breathe, relax your shoulders, continue.",
    "Consistency beats intensity.",
    "Progress > perfection.",
  ];
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    if (!sessionRunning) return;
    const id = setInterval(() => setQuoteIdx((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(id);
  }, [sessionRunning]);

  const spring = useMemo(() => ({ type: "spring", stiffness: 90, damping: 18, mass: 0.9 }), []);

  /* ---------------- Mediapipe init & cleanup ---------------- */
  useEffect(() => {
    meshRef.current = new faceMesh.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    meshRef.current.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
    meshRef.current.onResults(onResults);

    return () => {
      hardStopCamera();
      clearInterval(intervalRef.current);
      try { meshRef.current?.close(); } catch {}
    };
  }, []);

  const onResults = (results) => {
    const lm = results.multiFaceLandmarks?.[0];
    drawFrame(results);

    if (!lm) {
      faceDetectedRef.current = false;
      focusedRef.current = false;
      mouthOpenRef.current = false;
      setFaceDetected(false);
      setIsLooking(false);
      setMouthOpen(false);
      setStatusMsg("Face not detected");
      return;
    }

    faceDetectedRef.current = true;
    setFaceDetected(true);

    const leftEye = lm[33];
    const rightEye = lm[263];
    const nose = lm[1];

    let looking = true;
    if (leftEye && rightEye && nose) {
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const dx = Math.abs(nose.x - eyeCenterX);
      const eyeDistance = Math.abs(rightEye.x - leftEye.x);
      const threshold = 0.35 * eyeDistance;
      looking = dx < threshold;
    }
    focusedRef.current = looking;
    setIsLooking(looking);

    const upperLip = lm[13];
    const lowerLip = lm[14];
    let open = false;
    if (upperLip && lowerLip) {
      const mouthGap = Math.abs(lowerLip.y - upperLip.y);
      open = mouthGap > 0.05;
    }
    mouthOpenRef.current = open;
    setMouthOpen(open);

    setStatusMsg(open ? "Distracted: Mouth open" : looking ? "Looking at screen" : "Not looking");
  };

  function drawFrame(results) {
    const canvas = canvasRef.current;
    if (!canvas || !results) return;
    const ctx = canvas.getContext("2d");
    if (canvas.width !== 1280) canvas.width = 1280;
    if (canvas.height !== 720) canvas.height = 720;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.image) ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  }

  function startCamera() {
    if (videoRef.current && meshRef.current) {
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => { try { await meshRef.current.send({ image: videoRef.current }); } catch {} },
        width: 1280,
        height: 720,
      });
      cameraRef.current.start();
      videoRef.current.play?.();
    }
  }

  function hardStopCamera() {
    try { cameraRef.current?.stop(); } catch {}
    try {
      const stream = videoRef.current?.srcObject;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) { videoRef.current.pause?.(); videoRef.current.srcObject = null; }
    } catch {}
    const c = canvasRef.current; if (c) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  }

  function startTicker() {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (!faceDetectedRef.current) return;
      secondsRef.current += 1;
      if (focusedRef.current && !mouthOpenRef.current) focusedSecondsRef.current += 1;

      setSecondsElapsed(secondsRef.current);
      setFocusedSeconds(focusedSecondsRef.current);
      const pct = secondsRef.current > 0 ? Math.round((focusedSecondsRef.current / secondsRef.current) * 100) : 100;
      setFocusPercent(pct);
    }, 1000);
  }

  function stopTicker() { clearInterval(intervalRef.current); intervalRef.current = null; }

  const handleStart = () => {
    secondsRef.current = 0; focusedSecondsRef.current = 0;
    setSecondsElapsed(0); setFocusedSeconds(0); setFocusPercent(100);
    setSessionReport(null); setStatusMsg("Get ready…");
    setCountdown(3);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); setCountdown(0); setSessionRunning(true); setStatusMsg("Session running"); startCamera(); startTicker(); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleStop = async () => {
    stopTicker(); setSessionRunning(false); hardStopCamera();
    const total = secondsRef.current; const focused = focusedSecondsRef.current;
    const percent = total > 0 ? Math.round((focused / total) * 100) : 0;
    const report = { user: { id: "demo", name: "Demo" }, room: "default", startedAt: new Date(Date.now() - total * 1000).toISOString(), durationSeconds: total, focusedSeconds: focused, focusPercent: percent };
    setSessionReport(report);
    try { await axios.post(API_POST, report); setStatusMsg("Saved session"); } catch { setStatusMsg("Save failed"); }
    fetchHistory();
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(API_GET);
      const arr = Array.isArray(res.data) ? res.data : [];
      arr.sort((a, b) => new Date(b.startedAt || b.createdAt) - new Date(a.startedAt || a.createdAt));
      setHistory(arr);
    } catch {}
  };
  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    if (!sessionRunning) return;
    const now = Date.now(); if (now - lastToastRef.current < 2500) return;
    if (!isLooking) { lastToastRef.current = now; addToast("Eyes off screen — bring it back 💡", "error"); }
    else if (mouthOpen) { lastToastRef.current = now; addToast("Yawn detected — quick stretch & water?", "warn"); }
  }, [isLooking, mouthOpen, sessionRunning]);

  function addToast(text, type = "info") {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }

  const showFeed = sessionRunning || countdown > 0;

  /* ===== NEW: lock background scroll when modal is open ===== */
  useEffect(() => {
    if (!showHistory) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [showHistory]);

  /* ---------------- UI (Apple Music–inspired) ---------------- */
  return (
    <div className="relative w-full min-h-screen px-6 pt-20 pb-12 bg-[#fafafa] text-neutral-900 overflow-x-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_100%_-10%,rgba(196,181,253,0.18),transparent),radial-gradient(800px_400px_at_-10%_110%,rgba(244,114,182,0.14),transparent)]" />
      </div>

      {/* Header */}
      <div className="mx-auto max-w-[1200px] mb-4 flex items-center justify-between">
        <motion.h2 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={spring}
          className="text-[28px] md:text-[32px] font-extrabold tracking-tight">CalmCam Session</motion.h2>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="hidden md:inline">{statusMsg}</span>
          {sessionRunning && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={handleStop}
              className="h-9 px-4 rounded-full bg-black text-white font-medium">Stop</motion.button>
          )}
        </div>
      </div>

      {/* ===== FACE-CAM SECTION (unchanged) ===== */}
      <motion.div initial={{ opacity: 0, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} transition={spring}
        className="mx-auto max-w-[1200px] relative rounded-[24px] bg-white border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="w-full" style={{ aspectRatio: "16 / 9" }}>
          {showFeed ? (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="px-5 py-3 rounded-full bg-neutral-100 text-neutral-900 border border-black/5 shadow">Session not running</div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={handleStart}
                  className="h-10 px-6 rounded-full bg-black text-white font-medium">Start a Session</motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Countdown */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-xl"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={spring}
                className="px-8 py-5 rounded-[32px] bg-white/80 border border-black/5 shadow-[0_16px_44px_rgba(0,0,0,0.12)]">
                <div className="text-6xl md:text-7xl font-extrabold tracking-tight">{countdown}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Running quote */}
        <AnimatePresence>
          {sessionRunning && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring}
              className="absolute top-4 left-4 max-w-[70%] rounded-full px-3.5 py-2 text-xs md:text-sm bg-white/80 border border-black/5 shadow">
              {quotes[quoteIdx]}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats */}
      <div className="mx-auto max-w-[1200px] mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-[20px] bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] border border-black/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Stats</h3>
            <span className="text-xs text-neutral-500">{faceDetected ? "Face detected" : "No face"}</span>
          </div>
          <div className="mt-4 flex items-end gap-4">
            <div className="text-5xl font-extrabold">{focusPercent}%</div>
            <div className="text-sm text-neutral-500 leading-5">Focus score<br/>(higher is better)</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <StatRow label="Looking" value={isLooking ? "Yes" : "No"} />
            <StatRow label="Mouth" value={mouthOpen ? "Open" : "Closed"} />
            <StatRow label="Elapsed" value={`${secondsElapsed}s`} />
            <StatRow label="Focused" value={`${focusedSeconds}s`} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {!sessionRunning ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={handleStart}
                className="h-9 px-4 rounded-full bg-black text-white font-medium">Start</motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={handleStop}
                className="h-9 px-4 rounded-full bg-neutral-900 text-white font-medium">End Session</motion.button>
            )}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => setShowHistory(true)}
              className="h-9 px-4 rounded-full bg-neutral-200 font-medium">View History</motion.button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-[20px] bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] border border-black/5">
          <h3 className="text-lg font-semibold">Last Report</h3>
          {sessionReport ? (
            <div className="mt-3 text-sm space-y-1">
              <p><span className="font-semibold">Duration:</span> {sessionReport.durationSeconds}s</p>
              <p><span className="font-semibold">Focused:</span> {sessionReport.focusedSeconds}s</p>
              <p><span className="font-semibold">Focus:</span> {sessionReport.focusPercent}%</p>
              <p><span className="font-semibold">Started:</span> {new Date(sessionReport.startedAt).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-neutral-500 mt-2">No report yet</p>
          )}
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 space-y-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={spring}
              className={`px-4 py-2 rounded-full border shadow bg-white ${t.type === 'error' ? 'border-red-200' : t.type === 'warn' ? 'border-amber-200' : 'border-black/10'}`}>
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      <AnimatePresence>
        {showHistory && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
            />

            {/* Sheet/Dialog container */}
            <div className="absolute inset-0 flex items-end md:items-center justify-center p-0 md:p-6">
              <motion.div
                initial={{ y: 24, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 16, opacity: 0, scale: 0.98 }}
                transition={spring}
                className="
                  relative z-10 w-full md:w-[92%] max-w-3xl
                  bg-white border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.10)]
                  rounded-t-2xl md:rounded-[24px]
                  flex flex-col
                "
                style={{
                  maxHeight: "min(85svh, 720px)",
                  paddingBottom: "env(safe-area-inset-bottom, 0px)"
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-title"
              >
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-black/5 px-4 md:px-6 py-3 md:py-4 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 id="history-title" className="text-lg md:text-xl font-semibold">Session History</h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="h-8 px-3 rounded-full bg-neutral-200 text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div
                  className="px-4 md:px-6 py-4 md:py-5 overflow-y-auto overscroll-contain"
                  style={{ scrollbarGutter: "stable" }}
                >
                  {history.length === 0 ? (
                    <p className="text-neutral-500">No sessions yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-neutral-500">
                          <tr>
                            <th className="p-2">When</th>
                            <th className="p-2">Duration (s)</th>
                            <th className="p-2">Focused (s)</th>
                            <th className="p-2">Focus %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((s) => (
                            <tr key={s._id || JSON.stringify(s)} className="border-t border-black/5 hover:bg-neutral-50">
                              <td className="p-2">{new Date(s.startedAt || s.createdAt).toLocaleString()}</td>
                              <td className="p-2">{s.durationSeconds ?? '-'}</td>
                              <td className="p-2">{s.focusedSeconds ?? '-'}</td>
                              <td className="p-2">{s.focusPercent ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-neutral-50 border border-black/5">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
