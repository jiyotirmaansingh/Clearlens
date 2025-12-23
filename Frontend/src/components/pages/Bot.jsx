import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------ Opening Intro (responsive) ------------------ */
function BotIntro({ onDone }) {
  const DISPLAY_MS = 900;
  const word = useMemo(() => "DoubtSolver", []);
  useEffect(() => {
    const done = setTimeout(onDone, DISPLAY_MS + 700);
    return () => clearTimeout(done);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[90] grid place-items-center bg-white/70 backdrop-blur-2xl p-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
    >
      <motion.div
        key="doubtsolver"
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 py-2 rounded-full bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/5"
      >
        <span
          className="font-semibold tracking-tight text-neutral-900"
          style={{ fontSize: "clamp(1.5rem, 4.5vw, 3rem)" }}
        >
          {word}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ------------------ Main Bot ------------------ */
export default function Bot({ title = "Ask your Doubts away...." }) {
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "👋 Hey there! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const didMountRef = useRef(false);

  // Intro once (unless reduced motion)
  useEffect(() => {
    const INTRO_KEY = "ds_intro_am_seen";
    const params = new URLSearchParams(window.location.search);
    const force = params.get("intro") === "1";
    const seen = localStorage.getItem(INTRO_KEY) === "1";
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (force || (!seen && !reduce)) setShowIntro(true);
  }, []);
  const handleIntroDone = () => {
    localStorage.setItem("ds_intro_am_seen", "1");
    setShowIntro(false);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  // Auto-grow textarea (1–6 rows)
  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 6 * 24; // ~6 rows * line-height (tailwind text-sm ~24px)
    el.style.height = Math.min(el.scrollHeight, max) + "px";
  };
  useEffect(() => { autoGrow(); }, []);

  const sendToBackend = async (message) => {
    try {
      const res = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      return data.reply;
    } catch (err) {
      console.error("Error:", err);
      return "⚠️ Error connecting to server.";
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { id: Date.now(), from: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    autoGrow();
    setIsSending(true);
    try {
      const reply = await sendToBackend(trimmed);
      setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: reply }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chips = ["Summarize this article", "Explain this error", "Help me debug", "Plan a study schedule"];
  const spring = { type: "spring", stiffness: 90, damping: 18, mass: 0.9 };

  return (
    <div className="relative min-h-[100svh] w-full bg-[#fafafa] text-neutral-900 flex items-stretch justify-center overflow-x-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_100%_-10%,rgba(196,181,253,0.18),transparent),radial-gradient(700px_350px_at_-10%_110%,rgba(244,114,182,0.14),transparent)]" />
      </div>

      {/* Intro overlay */}
      <AnimatePresence>{showIntro && <BotIntro onDone={handleIntroDone} />}</AnimatePresence>

      {/* Chat shell */}
      <motion.div
        className="w-full max-w-3xl md:max-w-4xl mx-auto flex flex-col gap-4 px-4 sm:px-6 py-4 sm:py-6"
        style={{ minHeight: "100svh" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        {/* Header */}
        <motion.div
          className="rounded-2xl md:rounded-3xl border border-black/5 bg-white p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={spring}
        >
          <div className="flex items-center justify-between">
            <h2
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)" }}
            >
              {title}
            </h2>
            <motion.span
              className="text-[11px] sm:text-xs font-medium text-neutral-600"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ● Online
            </motion.span>
          </div>
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <motion.button
                key={c}
                onClick={() => setInput((s) => (s ? s + " " + c : c))}
                whileHover={{ y: -2 }}
                transition={spring}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs md:text-sm"
              >
                {c}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Messages */}
        <motion.div
          className="flex-1 min-h-0 rounded-2xl md:rounded-3xl border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden"
          initial={{ scale: 0.995, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
        >
          <div className="h-full overflow-y-auto px-4 sm:px-6 py-5 sm:py-7">
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  className={`mb-3 flex items-end gap-3 ${m.from === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={spring}
                >
                  {m.from === "bot" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-900 text-white text-xs">
                      🤖
                    </div>
                  )}
                  <div
                    className={`rounded-2xl border px-4 py-2.5 text-sm shadow leading-relaxed whitespace-pre-wrap break-words
                    ${m.from === "user" ? "rounded-br-none bg-black text-white border-black" : "rounded-bl-none bg-white border-black/10"}`}
                    style={{
                      maxWidth: "min(80%, 34rem)", // mobile wider, capped on desktop
                    }}
                  >
                    {m.text}
                  </div>
                  {m.from === "user" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-900 text-xs">
                      🧑
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isSending && (
              <motion.div className="flex items-center gap-2 justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-900 text-white text-xs">🤖</div>
                <div className="rounded-2xl rounded-bl-none border border-black/10 bg-white px-4 py-2.5 text-sm">
                  <motion.span
                    className="inline-flex items-center gap-1"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  >
                    Bot is typing
                    <span className="inline-flex">
                      <motion.span className="mx-0.5" animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                        •
                      </motion.span>
                      <motion.span
                        className="mx-0.5"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                      >
                        •
                      </motion.span>
                      <motion.span
                        className="mx-0.5"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                      >
                        •
                      </motion.span>
                    </span>
                  </motion.span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        {/* Input bar (safe-area aware, sticky on mobile keyboards) */}
        <motion.div
          className="rounded-2xl md:rounded-3xl border border-black/5 bg-white p-3.5 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={spring}
        >
          <form
            className="flex items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoGrow();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              className="flex-1 resize-none rounded-2xl border border-black/10 bg-white p-3 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black text-sm leading-6"
              rows={1}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              className="h-10 px-5 sm:px-6 rounded-full bg-black text-white text-sm font-semibold"
            >
              Send
            </motion.button>
          </form>
          <div className="mt-2.5 text-center text-[10px] md:text-xs text-neutral-500">
            ClearLens • Focus assistant • v0.1
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
