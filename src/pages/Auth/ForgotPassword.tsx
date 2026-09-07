import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import img from "../../assets/crown.png";
import { useForgotPassword } from "../../hooks/useAuth";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND      = "#FA510F";
const BRAND_DARK = "#D94309";

// ─── Input style helper ───────────────────────────────────────────────────────
const inputStyle = (hasError?: boolean, focused?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1.5px solid ${hasError ? "#EF4444" : focused ? BRAND : "#E5E7EB"}`,
  background: "#FAFAFA",
  fontSize: 14,
  color: "#111827",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxShadow: focused ? `0 0 0 3px ${BRAND}18` : "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
});

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", flexShrink: 0, transition: "transform 0.2s ease", "&:hover": { transform: "scale(1.02)" } }}>
      <Box component="img" src={img} alt="Crown Ledger"
        sx={{ width: 44, height: 44, objectFit: "contain",
          filter: "drop-shadow(0 2px 6px rgba(250,81,15,0.22))",
          transition: "filter 0.2s ease",
          "&:hover": { filter: "drop-shadow(0 4px 12px rgba(250,81,15,0.38))" } }}
      />
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.4px", whiteSpace: "nowrap" }}>
          Crown <Box component="span" sx={{ color: BRAND }}>Ledger</Box>
        </Typography>
        <Typography sx={{ fontSize: 9, color: "#94A3B8", letterSpacing: "1.6px", textTransform: "uppercase", lineHeight: 1, mt: 0.35 }}>
          DIGITAL BANKING
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 24 }}>
      {[1, 2].map(n => (
        <React.Fragment key={n}>
          <div style={{
            width: step === n ? 28 : 8, height: 8, borderRadius: 99,
            background: step >= n ? BRAND : "#E5E7EB",
            transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }} />
          {n < 2 && <div style={{ width: 20, height: 1.5, background: step > n ? BRAND : "#E5E7EB", transition: "background 0.3s" }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const [step, setStep]       = useState<1 | 2>(1);
  const [email, setEmail]     = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError]     = useState("");
  const [apiError, setApiError] = useState("");
  // Track if resend is running separately from initial submit
  const [resending, setResending] = useState(false);

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // console.log("Submitting forgot password", email);

  if (!validate()) return;

  forgotPassword(email, {
    onSuccess: () => {
      // console.log("Success");
      setStep(2);
    },
    onError: () => {
      // console.log("Error", err);
    },
  });
};

  const handleResend = () => {
    setResending(true);
    setApiError("");

    forgotPassword(email, {
      onSuccess: () => setResending(false),
      onError: (err: unknown) => {
        const e = err as { message?: string; response?: { data?: { message?: string } } };
        setApiError(
          e?.response?.data?.message ||
          e?.message ||
          "Failed to resend. Please try again."
        );
        setResending(false);
      },
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fpFadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes fpSpin    { to { transform: rotate(360deg); } }
        @keyframes fpShimmer { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
        @keyframes fpPop     { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes fpPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }

        .fp-card { animation: fpFadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fp-step { animation: fpFadeUp .35s cubic-bezier(.22,1,.36,1) both; }

        .fp-submit {
          width: 100%; padding: 13px 0; border-radius: 12px; border: none;
          background: linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%);
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 16px ${BRAND}35;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .fp-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%);
          transform: translateX(-120%);
        }
        .fp-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 26px ${BRAND}45; }
        .fp-submit:not(:disabled):hover::after { animation: fpShimmer 0.7s ease; }
        .fp-submit:not(:disabled):active { transform: translateY(0); }
        .fp-submit:disabled { opacity: 0.75; cursor: not-allowed; }

        .fp-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: fpSpin 0.7s linear infinite;
        }
        .fp-spinner-sm {
          width: 13px; height: 13px; display: inline-block;
          border: 2px solid ${BRAND}40;
          border-top-color: ${BRAND}; border-radius: 50%;
          animation: fpSpin 0.7s linear infinite; vertical-align: middle; margin-right: 4px;
        }

        .fp-icon-ring { animation: fpPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
        .fp-email-pill { animation: fpFadeUp 0.4s 0.15s cubic-bezier(.22,1,.36,1) both; }
        .fp-resend-btn:hover { color: ${BRAND} !important; }
        .fp-back-btn:hover   { color: ${BRAND} !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#F8F9FC 0%,#EEF2FF 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="fp-card" style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* ── Dark header ── */}
          <div style={{ background: "linear-gradient(135deg,#0D1117 0%,#1A2035 100%)", padding: "28px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${BRAND}30 0%,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, left: 60, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ marginBottom: 22 }}><Logo /></div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 6 }}>
              {step === 1 ? "Forgot your password? 🔐" : "Check your inbox 📬"}
            </div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              {step === 1
                ? "Enter your email and we'll send you a secure reset link."
                : "We sent a password reset link to your email."}
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "28px 32px 32px" }}>
            <StepDots step={step} />

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="fp-step">
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: 12, background: `${BRAND}0C`, border: `1px solid ${BRAND}22`, marginBottom: 22 }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke={BRAND} strokeWidth="1.8"/>
                      <path d="M12 8v5M12 16h.01" stroke={BRAND} strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                    Enter the email address linked to your Crown Ledger account. You'll receive a secure reset link within <strong>2 minutes</strong>.
                  </p>
                </div>

                {/* API error */}
                {apiError && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.4"/>
                      <path d="M8 5v4M8 10.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: 13, color: "#B91C1C", lineHeight: 1.5 }}>{apiError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      Email Address <span style={{ color: BRAND }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: focused ? BRAND : "#9CA3AF", transition: "color 0.2s", pointerEvents: "none" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8"/>
                          <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.8"/>
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(""); setApiError(""); }}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        style={{ ...inputStyle(!!error, focused), paddingLeft: 38 }}
                        autoComplete="email"
                        disabled={isPending}
                      />
                    </div>
                    {error && (
                      <span style={{ fontSize: 11.5, color: "#EF4444", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#EF4444" strokeWidth="1.4"/><path d="M6 4v3M6 8.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/></svg>
                        {error}
                      </span>
                    )}
                  </div>

                  <button type="submit" className="fp-submit" disabled={isPending} style={{ marginTop: 4 }}>
                    {isPending
                      ? <><div className="fp-spinner" /> Sending reset link...</>
                      : <>
                          Send Reset Link
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </>
                    }
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9CA3AF" }}>
                  Remember your password?{" "}
                  <a href="/login" className="fp-back-btn" style={{ color: BRAND, fontWeight: 600, cursor: "pointer", textDecoration: "none", transition: "color 0.2s" }}>
                    Back to Sign In
                  </a>
                </p>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="fp-step" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div className="fp-icon-ring" style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND}18 0%, ${BRAND}08 100%)`, border: `2px solid ${BRAND}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, position: "relative" }}>
                  <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1.5px solid ${BRAND}18`, animation: "fpPulse 2.5s ease-in-out infinite" }} />
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <path d="M5 5h26c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z" stroke={BRAND} strokeWidth="1.8" fill={`${BRAND}12`}/>
                    <polyline points="33,7 18,18 3,7" stroke={BRAND} strokeWidth="1.8"/>
                    <circle cx="27" cy="28" r="8" fill="#ECFDF5" stroke="#fff" strokeWidth="1.5"/>
                    <path d="M23.5 28l2.5 2.5 4-4" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.3px" }}>Reset link sent!</h2>
                <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "#6B7280", lineHeight: 1.6, maxWidth: 340 }}>
                  We've sent a secure password reset link to your email address.
                </p>

                <div className="fp-email-pill" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 99, background: `${BRAND}0C`, border: `1px solid ${BRAND}28`, marginBottom: 24 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={BRAND} strokeWidth="1.8"/>
                    <polyline points="22,6 12,13 2,6" stroke={BRAND} strokeWidth="1.8"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BRAND }}>{email}</span>
                </div>

                <div style={{ width: "100%", background: "#F8F9FA", borderRadius: 14, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
                  <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Next steps</p>
                  {[
                    { n: "1", text: "Open the email from Crown Ledger" },
                    { n: "2", text: 'Click the "Reset Password" button' },
                    { n: "3", text: "Create a new secure password" },
                  ].map(s => (
                    <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>{s.n}</div>
                      <span style={{ fontSize: 13, color: "#374151" }}>{s.text}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3.5" stroke="#059669" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    </div>
                    <span style={{ fontSize: 13, color: "#9CA3AF" }}>Link expires in <strong style={{ color: "#374151" }}>15 minutes</strong></span>
                  </div>
                </div>

                {/* API error on resend */}
                {apiError && (
                  <div style={{ width: "100%", display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", marginBottom: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.4"/>
                      <path d="M8 5v4M8 10.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: 13, color: "#B91C1C", lineHeight: 1.5 }}>{apiError}</span>
                  </div>
                )}

                <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 6px" }}>
                  Didn't receive it?{" "}
                  <button onClick={handleResend} disabled={resending || isPending} className="fp-resend-btn"
                    style={{ background: "none", border: "none", color: BRAND, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13, padding: 0, opacity: (resending || isPending) ? 0.6 : 1, transition: "color 0.2s" }}>
                    {resending ? <><span className="fp-spinner-sm" />Resending…</> : "Resend email"}
                  </button>
                </p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Also check your spam folder</p>

                <a href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 22, fontSize: 13, color: "#374151", fontWeight: 600, textDecoration: "none", padding: "10px 20px", borderRadius: 10, border: "1.5px solid #E5E7EB", transition: "all 0.2s" }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Back to Sign In
                </a>
              </div>
            )}

            {/* Trust badges */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 28, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
              {[{ icon: "🔒", label: "256-bit SSL encrypted" }, { icon: "🏛️", label: "Globally regulated" }, { icon: "⚡", label: "Instant access" }].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>
                  <span style={{ fontSize: 13 }}>{t.icon}</span>{t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}