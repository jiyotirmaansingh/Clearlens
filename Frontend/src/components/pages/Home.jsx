import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChartLine, FaUserFriends, FaCamera } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";

const spring = { type: "spring", stiffness: 88, damping: 16, mass: 0.9 };
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 1) => ({ opacity: 1, y: 0, transition: { ...spring, delay: i * 0.06 } }),
};

function FirstRunIntro({ onDone }) {
  const words = useMemo(() => ["ClearLens", "Focus", "Clarity"], []);
  const DISPLAY_MS = 1100;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const total = words.length;
    const i = setInterval(() => setIdx((n) => (n + 1 < total ? n + 1 : n)), DISPLAY_MS);
    const done = setTimeout(onDone, DISPLAY_MS * total + 900);
    return () => {
      clearInterval(i);
      clearTimeout(done);
    };
  }, [words, onDone]);

  const current = words[Math.min(idx, words.length - 1)];

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-white/70 backdrop-blur-2xl p-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
    >
      <motion.div
        key={current + idx}
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.995 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 py-2 rounded-full bg-white/88 shadow-[0_8px_20px_rgba(2,6,23,0.04)] border border-black/6"
      >
        <span className="font-semibold tracking-tight text-neutral-900" style={{ fontSize: "clamp(1.4rem, 3.6vw, 2.4rem)" }}>
          {current}
        </span>
      </motion.div>

      <button
        onClick={onDone}
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full px-3.5 py-2 text-xs sm:text-sm font-medium bg-black text-white shadow hover:bg-black/90 transition"
      >
        Skip
      </button>
    </motion.div>
  );
}

function SectionHeader({ title, eyebrow }) {
  return (
    <div className="mb-4">
      {eyebrow && <div className="text-[11px] sm:text-[12px] uppercase tracking-[0.12em] text-neutral-500 mb-1">{eyebrow}</div>}
      <h2 className="font-bold tracking-tight text-neutral-900" style={{ fontSize: "clamp(1.25rem, 2vw, 1.6rem)" }}>{title}</h2>
    </div>
  );
}

function InteractiveCard({ children, className = "", index = 0 }) {
  const ref = useRef(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const py = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      setX(px);
      setY(py);
    }
    function clear() {
      setX(0); setY(0);
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", clear);
    el.addEventListener("pointercancel", clear);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", clear);
      el.removeEventListener("pointercancel", clear);
    };
  }, []);

  const rotY = Math.max(-8, Math.min(8, -x * 8));
  const rotX = Math.max(-8, Math.min(8, y * 8));
  const translate = `translateZ(0)`;

  return (
    <motion.div
      ref={ref}
      className={`rounded-xl liquid-card p-5 sm:p-6 ${className}`}
      style={{ transformStyle: "preserve-3d", perspective: 900, willChange: "transform" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 120, damping: 16 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div style={{ transform: translate }} animate={{ rotateX: rotX, rotateY: rotY }} transition={{ type: "spring", stiffness: 220, damping: 20 }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

const features = [
  { icon: <FaCamera />, title: "Real-Time Focus", desc: "Subtle alerts when your focus drifts using your webcam." },
  { icon: <FaChartLine />, title: "Detailed Insights", desc: "Trends and reports that look great and stay useful." },
  { icon: <FaUserFriends />, title: "Accountability Rooms", desc: "Stay motivated with live peer sessions." }
];

const howItWorksSteps = [
  { n: "1", title: "Create Your Account", desc: "Sign up in seconds." },
  { n: "2", title: "Start a Session", desc: "Enable CalmCam for real-time focus tracking." },
  { n: "3", title: "View Insights", desc: "Analyze your focus history to improve every day." }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);
  const lenisRef = useRef(null);
  const accentRef = useRef(null);
  const cursorRef = useRef({ x: 0, y: 0, visible: false });
  const [cursorPos, setCursorPos] = useState({ x: -9999, y: -9999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const INTRO_KEY = "cl_intro_am_seen";
    const seen = localStorage.getItem(INTRO_KEY) === "1";
    if (!seen) setShowIntro(true);
  }, []);

  const handleIntroDone = () => {
    localStorage.setItem("cl_intro_am_seen", "1");
    setShowIntro(false);
  };

  useEffect(() => {
    if (lenisRef.current) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: true,
      wheelMultiplier: 1,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenisRef.current = lenis;
    return () => {
      try { lenis.destroy(); } catch (e) {}
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    let last = { x: 0, y: 0 };
    function onFrame() {
      const accent = accentRef.current;
      const lenis = lenisRef.current;
      if (accent) {
        const scrollY = lenis ? lenis.scroll : window.scrollY || 0;
        const offsetY = (scrollY * 0.06) % 200;
        const t = Date.now() / 5000;
        const wobbleX = Math.sin(t) * 6;
        const wobbleY = Math.cos(t * 1.2) * 4;
        const tx = wobbleX;
        const ty = offsetY * 0.02 + wobbleY;
        last.x += (tx - last.x) * 0.08;
        last.y += (ty - last.y) * 0.08;
        accent.style.transform = `translate3d(${last.x}px, ${last.y}px, 0) rotate(-6deg)`;
      }
      rafRef.current = requestAnimationFrame(onFrame);
    }
    rafRef.current = requestAnimationFrame(onFrame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    function onMove(e) {
      if (window.innerWidth <= 640) return;
      cursorRef.current.visible = true;
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    }
    function onLeave() {
      cursorRef.current.visible = false;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);
    window.addEventListener("pointerleave", onLeave);

    let cx = -9999, cy = -9999;
    let loop = () => {
      cx += (cursorRef.current.x - cx) * 0.12;
      cy += (cursorRef.current.y - cy) * 0.12;
      setCursorPos({ x: cx, y: cy });
      requestAnimationFrame(loop);
    };
    const raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToId = (id) => {
    const offset = -20;
    if (lenisRef.current) {
      try {
        lenisRef.current.scrollTo(`#${id}`, { offset, duration: 0.9 });
        return;
      } catch (e) {}
    }
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <motion.div className="relative min-h-[130vh] page-gradient text-neutral-900" initial="hidden" animate="visible" variants={fadeUp}>
      <style>{`
        @keyframes moveGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .page-gradient { 
          background: linear-gradient(120deg, rgba(196,181,253,0.18) 0%, rgba(244,114,182,0.12) 30%, rgba(134,239,172,0.10) 60%, rgba(255,214,167,0.09) 100%);
          background-size: 300% 300%;
          animation: moveGradient 30s ease-in-out infinite;
        }
        .grain { background-image: radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px); background-size: 3px 3px; opacity: 0.14; pointer-events: none; }
        .cl-content { max-width: 48rem; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }

        /* liquid-glass card (inspired by footer) */
        .liquid-card {
          position: relative;
          overflow: visible;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.86));
          background-blend-mode: overlay;
          -webkit-backdrop-filter: blur(8px) saturate(1.04);
          backdrop-filter: blur(8px) saturate(1.04);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 12px 36px rgba(2,6,23,0.06), inset 0 1px 0 rgba(255,255,255,0.6);
        }
        .liquid-card::before {
          content: "";
          position: absolute;
          left: -18%;
          top: -34%;
          width: 140%;
          height: 60%;
          transform: rotate(-12deg);
          background: linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02));
          filter: blur(28px);
          pointer-events: none;
          opacity: 0.95;
          border-radius: 50%;
        }

        /* subtle colorful sheen like footer */
        .liquid-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(196,181,253,0.06) 0%, rgba(244,114,182,0.04) 40%, rgba(134,239,172,0.03) 70%);
          border-radius: 12px;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .link-underline { position: relative; display: inline-block; }
        .link-underline::after {
          content: "";
          position: absolute;
          left: 0; bottom: -2px;
          height: 2px;
          width: 0%;
          background: linear-gradient(90deg,#7c3aed,#f472b6);
          transition: width 220ms ease;
          border-radius: 2px;
        }
        .link-underline:hover::after { width: 100%; }
        .cta { transition: transform 160ms ease, box-shadow 160ms ease; }
        .cta:active { transform: translateY(1px) scale(0.995); }
        .cursor-blob {
          position: fixed;
          width: 84px;
          height: 84px;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          pointer-events: none;
          z-index: 80;
          mix-blend-mode: screen;
          filter: blur(18px);
          opacity: 0.95;
        }
        @media (max-width: 640px) {
          .cl-content { padding-left: 1rem; padding-right: 1rem; max-width: 100%; }
          .cursor-blob { display: none; }
          .liquid-card { border-radius: 10px; }
        }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>

      <AnimatePresence>
        {showIntro && <FirstRunIntro onDone={handleIntroDone} />}
      </AnimatePresence>

      <div
        className="cursor-blob"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          background: "radial-gradient(circle at 30% 30%, rgba(196,181,253,0.95), rgba(244,114,182,0.85) 45%, rgba(167,243,208,0.6) 75%)",
          transition: "width 80ms linear, height 80ms linear",
        }}
      />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grain pointer-events-none" />
      </div>

      <main className="cl-content pt-12 sm:pt-16 pb-20">
        <section className="text-center mb-8 sm:mb-10">
          <motion.h1 variants={fadeUp} custom={0} className="font-extrabold tracking-tight" style={{ fontSize: "clamp(1.9rem, 5.5vw, 3rem)", color: "rgb(17 24 39 / 0.98)", lineHeight: 1.04 }}>Meet ClearLens</motion.h1>
          <motion.p variants={fadeUp} custom={1} className="mt-3 sm:mt-4 mx-auto text-neutral-600" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)", maxWidth: "42rem" }}>Clean. Calm. Focused.</motion.p>

          <motion.div variants={fadeUp} custom={2} className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3">
            <motion.button whileTap={{ scale: 0.985 }} onClick={() => navigate("/signup")} className="cta cta-strong bg-black text-white px-5 sm:px-6 py-3 rounded-full text-[14px] sm:text-[15px] font-medium hover:shadow-[0_10px_30px_rgba(2,6,23,0.12)]">
              Get Started
            </motion.button>
            <button onClick={() => scrollToId("how-it-works")} className="px-5 sm:px-6 py-3 rounded-full bg-neutral-100 text-[14px] sm:text-[15px] font-medium hover:bg-neutral-200">See how it works</button>
          </motion.div>
        </section>

        <section className="mb-10 sm:mb-12">
          <SectionHeader eyebrow="Daily spark" title="Stay Motivated" />
          <InteractiveCard index={0}>
            <div className="relative overflow-hidden rounded-xl">
              <div className="absolute inset-0" style={{ background: "radial-gradient(700px 320px at 100% 0%, rgba(59,130,246,0.03), transparent), radial-gradient(600px 300px at 0% 100%, rgba(244,114,182,0.02), transparent)" }} />
              <div className="relative">
                <p className="font-semibold leading-tight tracking-tight" style={{ fontSize: "clamp(1.1rem, 2.6vw, 1.6rem)", color: "rgb(17 24 39 / 0.95)" }}>“One Task, One Goal, One Win.”</p>
                <p className="mt-2 text-xs sm:text-sm text-neutral-500">— ClearLens</p>
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => navigate("/signup")} className="h-10 px-4 sm:px-5 rounded-full bg-black text-white text-xs sm:text-sm font-medium hover:bg-black/90">Start a Session</button>
              </div>
            </div>
          </InteractiveCard>
        </section>

        <section id="features" className="mb-10 sm:mb-12">
          <SectionHeader eyebrow="Why ClearLens" title="Simple. Powerful. Effortless." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map((f, i) => (
              <InteractiveCard key={i} index={i}>
                <div className="flex items-start gap-4">
                  <div className="icon-pill grid place-items-center text-lg sm:text-[20px]">{f.icon}</div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">{f.title}</div>
                    <div className="text-xs sm:text-sm text-neutral-600 mt-1">{f.desc}</div>
                  </div>
                </div>
              </InteractiveCard>
            ))}
          </div>
        </section>

        <section className="mb-12 sm:mb-14" id="how-it-works">
          <SectionHeader eyebrow="Get started" title="How It Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {howItWorksSteps.map((s, i) => (
              <InteractiveCard key={i} index={i}>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold leading-none">{s.n}</div>
                  <div className="mt-2.5 sm:mt-3 text-lg font-semibold">{s.title}</div>
                  <p className="mt-1 text-[13.5px] sm:text-[15px] text-neutral-600">{s.desc}</p>
                </div>
              </InteractiveCard>
            ))}
          </div>
        </section>

        <section className="mb-12 sm:mb-16">
          <SectionHeader eyebrow="A peek inside" title="What you'll find" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <InteractiveCard index={0}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-base sm:text-lg font-semibold">Leaderboard</div>
                <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-neutral-100">Live</span>
              </div>

              <ul className="space-y-2.5 sm:space-y-3">
                {[{ n: 1, name: "Piyush" }, { n: 2, name: "Jiyotirmaan" }, { n: 3, name: "Arbaaz" }].map((u) => (
                  <li key={u.n} className="flex items-center justify-between rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 bg-neutral-50 border border-black/5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 sm:h-9 sm:w-9 grid place-items-center rounded-full bg-neutral-900 text-white text-[12px] sm:text-sm font-semibold">{u.n}</div>
                      <div className="text-sm sm:text-base font-medium">{u.name}</div>
                    </div>
                    <div className="text-xs sm:text-sm text-neutral-600">0 pts</div>
                  </li>
                ))}
              </ul>

              <div className="mt-3 sm:mt-4 text-right">
                <button onClick={() => navigate("/lead")} className="h-9 px-4 rounded-full bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800">View full board</button>
              </div>
            </InteractiveCard>

            <InteractiveCard index={1}>
              <div>
                <div className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">DoubtSolver</div>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="max-w-[85%] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 bg-neutral-100 text-[13px] sm:text-[14px]">Explain time complexity of binary search.</div>
                  <div className="max-w-[85%] ml-auto rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 bg-black text-white text-[13px] sm:text-[14px]">O(log n) — each step halves the search space.</div>
                  <div className="max-w-[85%] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 bg-neutral-100 text-[13px] sm:text-[14px]">Give a study plan for DA in 2 weeks.</div>
                </div>

                <div className="mt-3 sm:mt-4 text-right">
                  <button onClick={() => navigate("/bot")} className="h-9 px-4 rounded-full bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800">Try DoubtSolver</button>
                </div>
              </div>
            </InteractiveCard>
          </div>
        </section>

        <section className="text-center">
          <motion.h2 variants={fadeUp} custom={0} className="font-extrabold tracking-tight" style={{ fontSize: "clamp(1.6rem, 4.2vw, 2rem)", color: "rgb(17 24 39 / 0.95)" }}>Ready to stay focused?</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mt-3 text-neutral-600 mx-auto" style={{ fontSize: "clamp(0.9rem, 1.5vw, 1rem)", maxWidth: "36rem", color: "rgb(30 41 59 / 0.68)" }}>Start your first CalmCam session today. Designed with simplicity in mind, built for focus.</motion.p>
          <motion.div variants={fadeUp} custom={2} className="mt-5 sm:mt-6">
            <Link to="/signup" className="bg-black text-white px-6 sm:px-7 py-3 rounded-full text-[14px] sm:text-[15px] font-medium hover:bg-black/90">Sign Up Free</Link>
          </motion.div>
        </section>
      </main>
    </motion.div>
  );
}
