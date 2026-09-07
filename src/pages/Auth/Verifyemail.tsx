/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import img from "../../assets/crown.png";
import { useVerifyEmail } from "../../hooks/useAuth"; // adjust path as needed

const BRAND = "#FA510F";
const BRAND_DARK = "#D94309";

function Logo() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
      <Box
        component="img"
        src={img}
        alt="Crown Ledger Bank"
        sx={{
          width: 40, height: 40, objectFit: "contain",
          filter: "drop-shadow(0 2px 6px rgba(250,81,15,0.22))",
        }}
      />
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.4px", whiteSpace: "nowrap" }}>
          Crown <Box component="span" sx={{ color: BRAND }}>Ledger</Box>
        </Typography>
        <Typography sx={{ fontSize: 8.5, color: "#94A3B8", letterSpacing: "1.6px", textTransform: "uppercase", lineHeight: 1, mt: 0.35 }}>
          TRUSTED BANKING
        </Typography>
      </Box>
    </Box>
  );
}

type ScreenState = "loading" | "success" | "error" | "invalid";

// ─── Helper: does this error message mean "already verified"? ─────────────────
function isAlreadyVerifiedError(err: any): boolean {
  const msg: string = (
    err?.response?.data?.message ||
    err?.data?.message ||
    err?.message ||
    ""
  ).toLowerCase();
  return (
    msg.includes("already verified") ||
    msg.includes("already been verified") ||
    msg.includes("email is verified") ||
    msg.includes("already active")
  );
}

// ─── Helper: extract the most useful message from any error shape ─────────────
function extractErrorMessage(err: any): string {
  return (
    err?.response?.data?.message ||   // axios-style
    err?.data?.message ||              // custom fetch wrapper
    err?.message ||                    // plain Error
    "Verification failed. The link may have expired or already been used."
  );
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate: verifyEmail } = useVerifyEmail();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [screen, setScreen] = useState<ScreenState>(
    token && email ? "loading" : "invalid"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token || !email) return;

    verifyEmail(
      { token, email },
      {
        onSuccess: (data: any) => {
          // Some backends return success:false inside a 200 — guard for it
          if (data?.success === false) {
            const msg = data?.message || "Verification failed.";
            // Still treat "already verified" as success
            if (isAlreadyVerifiedError({ message: msg })) {
              setScreen("success");
            } else {
              setErrorMessage(msg);
              setScreen("error");
            }
            return;
          }
          setScreen("success");
        },
        onError: (err: any) => {
          // Log for debugging — remove once stable
          // console.error("[VerifyEmail] raw error:", err);
          // console.error("[VerifyEmail] err.response:", err?.response);
          // console.error("[VerifyEmail] err.data:", err?.data);

          // "Already verified" → treat as success, not failure
          if (isAlreadyVerifiedError(err)) {
            setScreen("success");
            return;
          }

          setErrorMessage(extractErrorMessage(err));
          setScreen("error");
        },
      }
    );
  }, []);

  // Auto-redirect countdown after success
  useEffect(() => {
    if (screen !== "success") return;
    if (countdown <= 0) { navigate("/login"); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, countdown, navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp     { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes popIn      { from { opacity:0; transform:scale(0.55); } to { opacity:1; transform:scale(1); } }
        @keyframes spin       { to { transform:rotate(360deg); } }
        @keyframes pulse      { 0%,100%{ box-shadow:0 0 0 0 rgba(250,81,15,0.28); } 50%{ box-shadow:0 0 0 16px rgba(250,81,15,0); } }
        @keyframes errorPulse { 0%,100%{ box-shadow:0 0 0 0 rgba(239,68,68,0.25); } 50%{ box-shadow:0 0 0 16px rgba(239,68,68,0); } }
        @keyframes checkDraw  { from{ stroke-dashoffset:40; } to{ stroke-dashoffset:0; } }
        @keyframes shimmer    { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .ve-card  { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .login-btn:hover { background: ${BRAND_DARK} !important; transform:translateY(-1px) !important; box-shadow:0 8px 24px ${BRAND}45 !important; }
        .ghost-btn:hover { border-color: ${BRAND} !important; color:${BRAND} !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#F8F9FC 0%,#EEF2FF 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 16px", fontFamily: "'DM Sans', sans-serif",
      }}>
        <div className="ve-card" style={{
          width: "100%", maxWidth: 480,
          background: "#fff", borderRadius: 24,
          boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg,#0D1117 0%,#1A2035 100%)",
            padding: "26px 32px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${BRAND}28 0%,transparent 70%)`, pointerEvents: "none" }} />
            <Logo />
          </div>

          {/* Body */}
          <div style={{ padding: "44px 32px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            {screen === "loading" && <LoadingState />}
            {screen === "success" && <SuccessState countdown={countdown} onLogin={() => navigate("/login")} email={email!} />}
            {screen === "error"   && <ErrorState message={errorMessage} onRetry={() => navigate("/open-Account")} onLogin={() => navigate("/login")} />}
            {screen === "invalid" && <InvalidState onBack={() => navigate("/open-Account")} />}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ animation: "spin 1.2s linear infinite" }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="#F3F4F6" strokeWidth="5" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={BRAND} strokeWidth="5" strokeLinecap="round" strokeDasharray="60 154" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="3" stroke={BRAND} strokeWidth="1.8" />
            <path d="M2 8l10 7 10-7" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0D1117", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
          Verifying your email…
        </h2>
        <p style={{ color: "#94A3B8", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Please wait while we confirm your account.
        </p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {[80, 60, 70].map((w, i) => (
          <div key={i} style={{
            height: 12, width: `${w}%`, margin: "0 auto", borderRadius: 99,
            background: "linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)",
            backgroundSize: "200% 100%",
            animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Success ──────────────────────────────────────────────────────────────────
function SuccessState({ countdown, onLogin, email }: { countdown: number; onLogin: () => void; email: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: `linear-gradient(135deg,${BRAND}18,${BRAND}28)`,
        border: `2px solid ${BRAND}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 24,
        animation: "popIn 0.55s cubic-bezier(.34,1.56,.64,1) 0.15s both, pulse 2.8s ease-in-out 0.8s infinite",
      }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" stroke={BRAND} strokeWidth="1.5" strokeOpacity="0.3" />
          <path d="M13 22l6 6 12-12" stroke={BRAND} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="40" strokeDashoffset="40"
            style={{ animation: "checkDraw 0.5s cubic-bezier(.22,1,.36,1) 0.5s forwards" }} />
        </svg>
      </div>

      <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0D1117", margin: "0 0 10px", letterSpacing: "-0.03em" }}>
        Email Verified! 🎉
      </h2>
      <p style={{ color: "#64748B", fontSize: 14.5, lineHeight: 1.75, margin: "0 0 24px", maxWidth: 340 }}>
        Your account is now fully activated. Welcome to Crown Ledger Bank — you can now sign in and start banking.
      </p>

      {/* Verified email badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "#F0FDF4", border: "1.5px solid #BBF7D0",
        borderRadius: 99, padding: "8px 16px", marginBottom: 28,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#22C55E" strokeWidth="1.5" />
          <path d="M5 8l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>{email}</span>
      </div>

      {/* Perks */}
      <div style={{ width: "100%", background: "#F8F9FC", borderRadius: 14, padding: "16px 20px", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { icon: "💳", text: "Manage cards & virtual accounts" },
          { icon: "📈", text: "Track investments & portfolios" },
          { icon: "🔒", text: "Bank-grade security on every transaction" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: "#4B5563" }}>{item.text}</span>
          </div>
        ))}
      </div>

      <button type="button" className="login-btn" onClick={onLogin} style={{
        width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
        background: `linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%)`,
        color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
        fontFamily: "inherit", boxShadow: `0 4px 16px ${BRAND}35`,
        transition: "all 0.2s ease", marginBottom: 12,
      }}>
        Sign In to Crown Ledger
      </button>

      <p style={{ fontSize: 12.5, color: "#CBD5E1", margin: 0 }}>
        Redirecting automatically in <span style={{ color: BRAND, fontWeight: 700 }}>{countdown}s</span>
      </p>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry, onLogin }: { message: string; onRetry: () => void; onLogin: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: "#FEF2F2", border: "2px solid #FECACA",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
        animation: "popIn 0.55s cubic-bezier(.34,1.56,.64,1) 0.15s both, errorPulse 2.8s ease-in-out 0.8s infinite",
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="#EF4444" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M14 14l12 12M26 14L14 26" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0D1117", margin: "0 0 16px", letterSpacing: "-0.03em" }}>
        Verification Failed
      </h2>

      <div style={{
        width: "100%", background: "#FEF2F2", border: "1.5px solid #FECACA",
        borderRadius: 12, padding: "14px 16px", marginBottom: 24,
        display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left",
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.4" />
          <path d="M8 5v3.5M8 10.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 13.5, color: "#DC2626", lineHeight: 1.6 }}>{message}</span>
      </div>

      <div style={{ width: "100%", background: "#F8F9FC", borderRadius: 14, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px" }}>
          Common reasons
        </p>
        {[
          "The verification link has expired (links expire after 24 hours)",
          "The link was already used to verify this account",
          "The link was copied incorrectly from the email",
        ].map((reason, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < 2 ? 8 : 0 }}>
            <span style={{ fontSize: 13, color: "#9CA3AF", marginTop: 1 }}>•</span>
            <span style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>{reason}</span>
          </div>
        ))}
      </div>

      <button type="button" className="login-btn" onClick={onRetry} style={{
        width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
        background: `linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%)`,
        color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
        fontFamily: "inherit", boxShadow: `0 4px 16px ${BRAND}35`,
        transition: "all 0.2s ease", marginBottom: 12,
      }}>
        Create a New Account
      </button>

      <button type="button" className="ghost-btn" onClick={onLogin} style={{
        width: "100%", padding: "12px 0", borderRadius: 12,
        border: "1.5px solid #E5E7EB", background: "transparent",
        color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.2s ease",
      }}>
        Back to Sign In
      </button>
    </div>
  );
}

// ─── Invalid (missing URL params) ────────────────────────────────────────────
function InvalidState({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: "#FFFBEB", border: "2px solid #FDE68A",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
        animation: "popIn 0.55s cubic-bezier(.34,1.56,.64,1) 0.15s both",
      }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 8v14M20 26.5h.01" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
          <path d="M4 34L20 6l16 28H4z" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0D1117", margin: "0 0 10px", letterSpacing: "-0.03em" }}>Invalid Link</h2>
      <p style={{ color: "#64748B", fontSize: 14.5, lineHeight: 1.75, margin: "0 0 28px", maxWidth: 320 }}>
        This verification link is missing required information. Please use the original link from your email.
      </p>
      <button type="button" className="login-btn" onClick={onBack} style={{
        width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
        background: `linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%)`,
        color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
        fontFamily: "inherit", boxShadow: `0 4px 16px ${BRAND}35`, transition: "all 0.2s ease",
      }}>
        Back to Sign Up
      </button>
    </div>
  );
}