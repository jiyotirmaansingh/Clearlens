// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const cols = [
    { title: "Product", items: [{ label: "Home", to: "/" }, { label: "Login", to: "/login" }] },
    { title: "Company", items: [{ label: "Contact", to: "/contact" }] },
    { title: "Legal", items: [{ label: "Terms of Service", to: "/terms" }, { label: "Privacy Policy", to: "/privacy" }] },
  ];

  return (
    <footer className="relative">
      <style>{`
        @keyframes moveGradient { 
          0% { background-position: 0% 50%; } 
          50% { background-position: 100% 50%; } 
          100% { background-position: 0% 50%; } 
        }

        .footer-shell {
          padding: clamp(1.25rem, 3vw, 2rem);
          position: relative;
          overflow: visible;
          border-radius: 16px;
          background: linear-gradient(120deg,
            rgba(196,181,253,0.14) 0%,
            rgba(244,114,182,0.1) 30%,
            rgba(134,239,172,0.08) 60%,
            rgba(255,214,167,0.06) 100%);
          background-size: 300% 300%;
          animation: moveGradient 30s ease-in-out infinite;
          -webkit-backdrop-filter: blur(8px) saturate(1.06);
          backdrop-filter: blur(8px) saturate(1.06);
          border: 1px solid rgba(255,255,255,0.42);
          box-shadow:
            0 12px 40px rgba(2,6,23,0.06),
            inset 0 1px 0 rgba(255,255,255,0.55);
        }

        /* highlight 'liquid' sheen */
        .footer-shell::before {
          content: "";
          position: absolute;
          left: -10%;
          top: -30%;
          width: 120%;
          height: 60%;
          transform: rotate(-12deg);
          background: linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02));
          filter: blur(28px);
          pointer-events: none;
          opacity: 0.9;
          border-radius: 50%;
        }

        .footer-inner {
          position: relative;
          z-index: 2;
        }

        .footer-divider { height: 1px; background-color: rgba(2,6,23,0.04); margin: 1rem 0; opacity: 0.9; }

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

        @media (max-width: 640px) {
          .footer-shell { border-radius: 12px; padding: 1rem; }
        }
      `}</style>

      <div className="footer-shell container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="footer-inner mx-auto max-w-3xl py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold">ClearLens</div>
            <div className="text-sm text-neutral-500">— Clean. Calm. Focused.</div>
          </div>

          <nav className="flex items-center gap-4">
            <Link className="link-underline text-sm text-neutral-600 hover:underline" to="/features">Features</Link>
            <Link className="link-underline text-sm text-neutral-600 hover:underline" to="/pricing">Pricing</Link>
            <Link className="link-underline text-sm text-neutral-600 hover:underline" to="/terms">Terms</Link>
            <Link className="link-underline text-sm text-neutral-600 hover:underline" to="/privacy">Privacy</Link>
          </nav>

          <div className="text-sm text-neutral-500">© {new Date().getFullYear()} ClearLens. All rights reserved.</div>
        </div>

        <div className="footer-divider" />
      </div>
    </footer>
  );z
}
