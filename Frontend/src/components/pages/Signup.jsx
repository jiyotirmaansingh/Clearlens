// src/pages/Signup.jsx — Apple Music glass theme + fully responsive
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const spring = { type: "spring", stiffness: 170, damping: 22, mass: 0.9 };
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/auth/signup", form);
      if (res.data?.success) {
        setSuccess("Account created! Redirecting to login…");
        setTimeout(() => navigate("/login"), 1200);
      } else setError("Unexpected response. Try again.");
    } catch (err) {
      if (err.response?.status === 409) setError("User already exists! Please login.");
      else setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div
      className="relative w-full flex items-center justify-center overflow-x-hidden bg-[#fafafa] text-neutral-900"
      style={{ minHeight: "100svh", padding: "0 clamp(1rem, 4vw, 2rem)" }}
    >
      {/* Ambient radial backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_100%_-10%,rgba(196,181,253,0.18),transparent),radial-gradient(700px_350px_at_-10%_110%,rgba(244,114,182,0.14),transparent)]" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
        className="w-full max-w-[min(92vw,420px)] sm:max-w-md rounded-[24px] bg-white/90 border border-black/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
        style={{ padding: "clamp(1.2rem, 3.2vw, 2.5rem)", marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="mb-6 text-center"
        >
          <h2
            className="font-extrabold tracking-tight"
            style={{ fontSize: "clamp(1.6rem, 4.2vw, 2.25rem)" }}
          >
            Create Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500">
            Join ClearLens to start focusing smarter
          </p>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mb-4 text-center text-sm rounded-xl px-3 py-2 border border-red-200 bg-red-50 text-red-700"
            role="alert"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="mb-4 text-center text-sm rounded-xl px-3 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700"
            role="status"
          >
            {success}
          </motion.p>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.06 }}
            className="space-y-2"
          >
            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
            <motion.input
              id="name"
              whileFocus={{ scale: 1.01 }}
              type="text"
              name="name"
              placeholder="Ava Sharma"
              value={form.name}
              onChange={onChange}
              required
              disabled={loading}
              autoComplete="name"
              className="w-full p-3 rounded-xl bg-white border border-black/10 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.09 }}
            className="space-y-2"
          >
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <motion.input
              id="email"
              whileFocus={{ scale: 1.01 }}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              required
              disabled={loading}
              autoComplete="email"
              inputMode="email"
              className="w-full p-3 rounded-xl bg-white border border-black/10 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.12 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-xs text-neutral-500 hover:text-neutral-700"
                aria-pressed={showPw}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <motion.input
              id="password"
              whileFocus={{ scale: 1.01 }}
              type={showPw ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
              disabled={loading}
              autoComplete="new-password"
              className="w-full p-3 pr-12 rounded-xl bg-white border border-black/10 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
            <p className="text-[11px] text-neutral-500">
              Use at least 8 characters. Stronger with a mix of letters & numbers.
            </p>
          </motion.div>

          {/* Submit */}
          <motion.button
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            transition={spring}
            type="submit"
            disabled={loading}
            className={`w-full mt-2 p-3 rounded-full font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              loading ? "bg-black/60 cursor-not-allowed" : "bg-black hover:bg-black/90"
            }`}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Creating account…
              </span>
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          className="mt-6 text-sm text-center text-neutral-500"
        >
          Already have an account?{" "}
          <Link to="/login" className="text-black font-medium hover:opacity-80">Login</Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
