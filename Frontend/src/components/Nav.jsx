// src/components/Nav.jsx — Bottom-centered Apple Music player-style pill (responsive + keyboard-aware)
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const Icon = {
  Live: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" {...p}>
      <path fill="currentColor" d="M12 8a4 4 0 100 8 4 4 0 000-8zm-7 4a7 7 0 1114 0 7 7 0 01-14 0z"/>
    </svg>
  ),
  List: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" {...p}>
      <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
    </svg>
  ),
  Chat: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" {...p}>
      <path fill="currentColor" d="M20 2H4a2 2 0 00-2 2v15l4-3h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>
    </svg>
  ),
  Logout: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" {...p}>
      <path fill="currentColor" d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8a2 2 0 002-2V5a2 2 0 00-2-2z"/>
    </svg>
  ),
  Dot: (p) => (<svg viewBox="0 0 8 8" width="8" height="8" {...p}><circle cx="4" cy="4" r="3.5" fill="currentColor"/></svg>)
};

export default function Nav() {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [hideForKeyboard, setHideForKeyboard] = useState(false);
  const navigate = useNavigate();

  // live user sync (no refresh)
  useEffect(() => {
    const read = () => {
      try { const u = localStorage.getItem("user"); setUser(u ? JSON.parse(u) : null); } catch {}
    };
    read();
    const onStorage = () => read();
    const onAuth = () => read();
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:update", onAuth);
    const beat = setInterval(read, 400);
    setTimeout(() => clearInterval(beat), 6000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:update", onAuth);
      clearInterval(beat);
    };
  }, []);

  // Hide nav when virtual keyboard opens (mobile)
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      // If the viewport height shrinks by >140px, keyboard is likely open
      const kbd = window.innerHeight - vv.height > 140;
      setHideForKeyboard(kbd);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:update"));
    setUser(null);
    navigate("/login");
  };

  const links = useMemo(() => ([
    { path: "/livesession", title: "Live Session", icon: <Icon.Live/> },
    { path: "/lead",        title: "Leaderboard", icon: <Icon.List/> },
    { path: "/bot",         title: "DoubtSolver", icon: <Icon.Chat/> },
  ]), []);

  const springBar = { type: "spring", stiffness: 140, damping: 20, mass: 0.9 };
  const springUI  = { type: "spring", stiffness: 210, damping: 22, mass: 0.9 };

  return (
    <AnimatePresence initial={false}>
      {!hideForKeyboard && (
        <motion.nav
          key="nav-pill"
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={springBar}
          // bottom center, safe-area aware
          className="
            fixed left-1/2 -translate-x-1/2
            z-50 pointer-events-none
            w-full max-w-[1000px] px-3 sm:px-4
          "
          style={{
            bottom: "calc(env(safe-area-inset-bottom, 0px) + clamp(10px, 2.5vw, 18px))",
          }}
          role="navigation"
          aria-label="Primary"
        >
          <div
            className="pointer-events-auto relative flex items-center justify-between gap-2 sm:gap-4
                       h-12 sm:h-[56px] rounded-full px-3.5 sm:px-5"
            style={{
              background: "rgba(26,26,28,0.70)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)"
            }}
          >
            {/* edge sheens like Music */}
            <span className="pointer-events-none absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 12%, rgba(255,255,255,0.02) 48%, transparent 70%)" }}/>
            <span className="pointer-events-none absolute -left-1 top-0 bottom-0 w-10 rounded-l-full bg-gradient-to-r from-black/35 to-transparent"/>
            <span className="pointer-events-none absolute -right-1 top-0 bottom-0 w-10 rounded-r-full bg-gradient-to-l from-black/35 to-transparent"/>

            {/* Brand (left) */}
            <NavLink to="/" onClick={(e)=>e.stopPropagation()} className="shrink-0">
              <motion.div whileHover={{ y: -1 }} transition={springUI} className="flex items-center gap-2 select-none">
                <span
                  className="font-extrabold bg-gradient-to-b from-white/95 to-white/60 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]"
                  style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.125rem)" }}
                >
                  ClearLens
                </span>
                {user && (
                  <span className="hidden sm:inline text-[11px] text-white/70">
                    • Hi, {user.name?.split(" ")[0]}
                  </span>
                )}
              </motion.div>
            </NavLink>

            {/* Divider */}
            <span className="hidden sm:block h-6 w-px bg-white/10" />

            {/* Center icon group */}
            <div className="flex items-center gap-3 sm:gap-4">
              {links.map(({ path, title, icon }) => (
                <NavLink key={path} to={path} className="relative group" onClick={(e)=>e.stopPropagation()} aria-label={title}>
                  {({ isActive }) => (
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={springUI}
                      className={`grid place-items-center rounded-full border
                        h-10 w-10 sm:h-10 sm:w-10
                        ${isActive ? "bg-white text-black border-white"
                                   : "bg-white/5 text-white/85 border-white/10"}`}
                      aria-current={isActive ? "page" : undefined}
                      title={title}
                    >
                      {icon}
                      {isActive && (
                        <motion.span
                          layoutId="navActiveHalo"
                          className="absolute -z-10 inset-0 rounded-full"
                          style={{ boxShadow: "0 0 0 8px rgba(255,255,255,0.08)" }}
                        />
                      )}
                    </motion.button>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Center dot (subtle) */}
            <div className="hidden md:flex items-center text-white/60">
              <Icon.Dot />
            </div>

            {/* Auth (right) */}
            <div className="relative flex items-center gap-2">
              {!user ? (
                <NavLink to="/login" onClick={(e)=>e.stopPropagation()}>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springUI}
                    className="h-9 px-3.5 sm:px-4 rounded-full bg-white text-black text-xs sm:text-sm font-semibold border border-white shadow-sm"
                  >
                    Login
                  </motion.button>
                </NavLink>
              ) : (
                <div
                  onMouseEnter={() => setShowLogout(true)}
                  onMouseLeave={() => setShowLogout(false)}
                  className="relative"
                >
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springUI}
                    className="h-9 px-2.5 sm:px-3 flex items-center gap-2 rounded-full bg-white/10 text-white border border-white/10"
                    aria-haspopup="menu"
                    aria-expanded={showLogout}
                  >
                    <span className="grid place-items-center h-6 w-6 rounded-full bg-white/20 text-white text-xs">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </span>
                    <span className="text-xs sm:text-sm max-w-[120px] truncate">{user.name}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showLogout && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 8 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={springUI}
                        className="absolute right-0 bottom-12 min-w-[160px]
                                   rounded-2xl bg-[#111]/90 backdrop-blur-xl border border-white/10
                                   text-white shadow-[0_10px_26px_rgba(0,0,0,0.35)] p-2"
                        onClick={(e)=>e.stopPropagation()}
                        role="menu"
                      >
                        <button
                          onClick={handleLogout}
                          className="w-full text-left text-sm px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2"
                          role="menuitem"
                        >
                          <Icon.Logout /> Log out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
