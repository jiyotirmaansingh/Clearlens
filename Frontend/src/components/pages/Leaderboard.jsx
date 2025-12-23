// src/pages/Leaderboard.jsx (Apple Premium Arc Loader + polished animations)

import { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_LIST = "http://localhost:8080/api/leaderboard";
const API_STREAM = "http://localhost:8080/api/leaderboard/stream";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  const pollRef = useRef(null);
  const esRef = useRef(null);
  const mountedRef = useRef(false);

  const spring = useMemo(
    () => ({ type: "spring", stiffness: 90, damping: 18, mass: 0.9 }),
    []
  );

  /* ---------------- LOADING HELPERS ---------------- */

  const fetchOnce = async () => {
    try {
      const { data } = await axios.get(API_LIST);
      if (!mountedRef.current) return;

      setLeaders(Array.isArray(data) ? data : []);
    } catch {}
    finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const startPolling = (ms = 5000) => {
    if (pollRef.current) return;
    pollRef.current = setInterval(fetchOnce, ms);
  };

  const stopPolling = () => {
    clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const connectStream = () => {
    if (!("EventSource" in window)) return false;

    try {
      const es = new EventSource(API_STREAM);
      esRef.current = es;

      es.addEventListener("open", () => {
        if (!mountedRef.current) return;
        setLive(true);
        stopPolling();
      });

      es.addEventListener("message", (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (mountedRef.current && Array.isArray(payload)) {
            setLeaders(payload);
          }
        } catch {}
        finally {
          if (mountedRef.current) setLoading(false);
        }
      });

      es.addEventListener("error", () => {
        if (!mountedRef.current) return;
        setLive(false);
        try { es.close(); } catch {}
        esRef.current = null;
        startPolling();
      });

      return true;
    } catch {
      return false;
    }
  };

  /* ---------------- LIFECYCLE ---------------- */

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    const hasStream = connectStream();
    if (!hasStream) {
      setLive(false);
      startPolling();
      fetchOnce();
    }

    // Artificial delay for smooth fade-in
    const timer = setTimeout(() => setPageReady(true), 400);

    return () => {
      mountedRef.current = false;
      stopPolling();
      try { esRef.current?.close(); } catch {}
      clearTimeout(timer);
    };
  }, []);

  const showLoader = loading || !pageReady;

  return (
    <div className="relative min-h-screen w-full pt-20 pb-14 px-6 bg-[#fafafa] text-neutral-900 overflow-x-hidden">

      {/* ----------- FULLSCREEN LOADER ----------- */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-white flex items-center justify-center"
          >
            <ArcLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_100%_-10%,rgba(196,181,253,0.18),transparent),radial-gradient(800px_400px_at_-10%_110%,rgba(244,114,182,0.14),transparent)]" />
      </div>

      {/* Header */}
      <div className="mx-auto max-w-[1100px] mb-6 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="text-[32px] md:text-[40px] font-extrabold tracking-tight"
        >
          Leaderboard
        </motion.h1>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">Updates</span>
          <motion.span
            animate={{
              scale: live ? [1, 1.18, 1] : 1,
              opacity: live ? [0.6, 1, 0.6] : 0.6,
            }}
            transition={{ repeat: live ? Infinity : 0, duration: 1.4 }}
            className={`h-2.5 w-2.5 rounded-full ${
              live ? "bg-green-500" : "bg-yellow-500"
            } shadow`}
          />
        </div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: showLoader ? 0 : 1, scale: showLoader ? 0.98 : 1 }}
        transition={spring}
        className="mx-auto max-w-[1100px] rounded-[24px] bg-white border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

        <div className="p-4 sm:p-6">
          {leaders.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-black/5">
              <AnimatePresence initial={false}>
                {leaders.map((user, i) => (
                  <Row
                    key={`${user.id || user.email || user.name}-${i}`}
                    i={i}
                    name={user.name}
                    score={user.score}
                    spring={spring}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------- */
/* --- Apple TV ARC SPINNER --- */
/* -------------------------------------------- */

function ArcLoader() {
  return (
    <motion.div
      className="h-14 w-14 rounded-full border-[3px] border-neutral-200"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
      style={{
        borderTopColor: "black",
        borderLeftColor: "transparent",
        borderRightColor: "black",
        borderBottomColor: "transparent",
      }}
    />
  );
}

/* -------------------------------------------- */
/* --- ROW COMPONENT --- */
/* -------------------------------------------- */

function Row({ i, name = "User", score = 0, spring }) {
  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
  const rowEmphasis = i < 3 ? "bg-neutral-50" : "bg-white";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={spring}
      className="group"
    >
      <div
        className={`flex items-center justify-between gap-4 px-3 py-3 sm:px-4 sm:py-4 ${rowEmphasis}`}
      >
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full grid place-items-center text-[13px] font-bold bg-black text-white">
            {i + 1}
          </span>

          <span className="grid place-items-center h-8 w-8 rounded-full bg-neutral-900 text-white text-sm">
            {name?.[0]?.toUpperCase() || "U"}
          </span>

          <div className="text-sm sm:text-base font-semibold">
            {name} {medal && <span className="ml-1">{medal}</span>}
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={spring}
          className="rounded-full px-3 py-1.5 border border-black/10 bg-white text-sm font-bold shadow"
        >
          {score} pts
        </motion.div>
      </div>
    </motion.li>
  );
}

/* -------------------------------------------- */

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100" />
      <p className="mt-4 text-neutral-600">No entries yet.</p>
    </div>
  );
}
