// src/components/NotFound.jsx
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#ebe6f8] text-[#2b254b] overflow-hidden">

      {/* animated gradient background */}
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{
          backgroundImage:
            "linear-gradient(270deg, #f4effd, #e7ddfb, #f1eaff, #ebe6f8)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* floating blobs */}
      <div className="pointer-events-none fixed -top-40 -left-28 h-[42rem] w-[42rem] rounded-full bg-[#c9baf7]/40 blur-3xl -z-10" />
      <div className="pointer-events-none fixed -bottom-40 -right-24 h-[40rem] w-[40rem] rounded-full bg-[#f3c2ff]/30 blur-3xl -z-10" />

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
        className="px-10 py-12 rounded-[28px] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(58,47,112,0.18)] text-center max-w-xl w-[90%]"
      >
        <motion.h1
          className="text-[120px] font-extrabold bg-gradient-to-r from-[#3a2f70] via-[#5b52a1] to-[#3a2f70] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          404
        </motion.h1>

        <motion.p
          className="text-lg text-[#3a2f70] font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          Oops… the page you’re looking for doesn’t exist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
          className="mt-8"
        >
          <NavLink
            to="/"
            className="px-6 py-3 rounded-2xl bg-[#3a2f70] text-white font-semibold text-sm shadow-[0_10px_24px_rgba(58,47,112,0.28)] hover:bg-[#322a66] transition inline-block"
          >
            Return Home
          </NavLink>
        </motion.div>
      </motion.div>
    </div>
  );
}
