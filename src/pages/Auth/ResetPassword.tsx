/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import img from "../../assets/crown.png";
import { useSearchParams } from "react-router-dom";
import { useResetPassword } from "../../hooks/useAuth";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND      = "#FA510F";
const BRAND_DARK = "#D94309";

// ─── Password strength helper ─────────────────────────────────────────────────
function getStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const bgs    = ["", "#FEF2F2", "#594c17", "#EFF6FF", "#F0FDF4"];
  return { score, label: labels[score] ?? "", color: colors[score] ?? "", bg: bgs[score] ?? "" };
}

// ─── Rules list ───────────────────────────────────────────────────────────────
const RULES = [
  { id: "len",    label: "At least 8 characters",       test: (p: string) => p.length >= 8 },
  { id: "upper",  label: "One uppercase letter",         test: (p: string) => /[A-Z]/.test(p) },
  { id: "num",    label: "One number",                   test: (p: string) => /[0-9]/.test(p) },
  { id: "symbol", label: "One special character (!@#$)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

// ─── Input style ─────────────────────────────────────────────────────────────
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

// ─── Eye toggle button ────────────────────────────────────────────────────────
function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex" }}>
      {show
        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
      }
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ResetPassword() {
  // const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate: resetPassword, isPending } = useResetPassword();

  // Extract token and email from URL query params (?token=xxx&email=yyy)
  const tokenFromUrl = searchParams.get("token") ?? "";
  const emailFromUrl = searchParams.get("email") ?? "";

  const [step, setStep]           = useState<1 | 2>(1);
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [showPw,   setShowPw]     = useState(false);
  const [showCf,   setShowCf]     = useState(false);
  const [focusedField, setFocused]= useState<string | null>(null);
  const [errors,   setErrors]     = useState<{ pw?: string; cf?: string; api?: string }>({});

  // If no token in URL, show an invalid-link state
  const [invalidLink] = useState(!tokenFromUrl || !emailFromUrl);

  const strength = getStrength(password);

  const validate = () => {
    const e: typeof errors = {};
    if (password.length < 8) e.pw = "Password must be at least 8 characters.";
    if (!confirm) e.cf = "Please confirm your new password.";
    else if (password !== confirm) e.cf = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setErrors({});

    resetPassword(
      {
        token: tokenFromUrl,
        email: emailFromUrl,
        newPassword: password,
        confirmPassword: confirm,
      },
      {
        onSuccess: () => {
          setStep(2);
        },
        onError: (err: unknown) => {
          const e = err as { message?: string; response?: { data?: { message?: string } } };
          const message =
            e?.response?.data?.message ||
            e?.message ||
            "Failed to reset password. The link may have expired.";
          setErrors({ api: message });
        },
      }
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes rpFadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes rpSpin    { to { transform: rotate(360deg); } }
        @keyframes rpShimmer { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
        @keyframes rpPop     { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
        @keyframes rpRuleFade{ from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }

        .rp-card  { animation: rpFadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .rp-step  { animation: rpFadeUp .35s cubic-bezier(.22,1,.36,1) both; }
        .rp-rule  { animation: rpRuleFade .3s ease both; }

        .rp-submit {
          width: 100%; padding: 13px 0; border-radius: 12px; border: none;
          background: linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%);
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 16px ${BRAND}35;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .rp-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%);
          transform: translateX(-120%);
        }
        .rp-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 26px ${BRAND}45; }
        .rp-submit:not(:disabled):hover::after { animation: rpShimmer 0.7s ease; }
        .rp-submit:not(:disabled):active { transform: translateY(0); }
        .rp-submit:disabled { opacity: 0.75; cursor: not-allowed; }

        .rp-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: rpSpin 0.7s linear infinite;
        }

        .rp-success-icon { animation: rpPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes rpSuccessPulse { 0%,100%{box-shadow:0 0 0 0 ${BRAND}30} 50%{box-shadow:0 0 0 14px transparent} }
        .rp-success-pulse { animation: rpSuccessPulse 2.4s ease-in-out infinite; }

        .rp-signin-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 13px 0; border-radius: 12px; border: none;
          background: linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%);
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: inherit; text-decoration: none;
          box-shadow: 0 4px 16px ${BRAND}35;
          transition: all 0.2s ease;
        }
        .rp-signin-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 26px ${BRAND}45; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#F8F9FC 0%,#EEF2FF 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="rp-card" style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* ── Dark header ── */}
          <div style={{ background: "linear-gradient(135deg,#0D1117 0%,#1A2035 100%)", padding: "28px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${BRAND}30 0%,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, left: 60, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ marginBottom: 22 }}><Logo /></div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 6 }}>
              {invalidLink ? "Invalid reset link 🚫" : step === 1 ? "Create new password 🔑" : "Password reset! 🎉"}
            </div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              {invalidLink
                ? "This link is missing required parameters or has expired."
                : step === 1
                  ? "Choose a strong password to secure your Crown Ledger account."
                  : "Your password has been successfully updated. You can now sign in."}
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "28px 32px 32px" }}>

            {/* ── INVALID LINK STATE ── */}
            {invalidLink && (
              <div className="rp-step" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FEF2F2", border: "2px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#EF4444" strokeWidth="1.8"/>
                    <path d="M11 11l10 10M21 11L11 21" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Link Invalid or Expired</h2>
                <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "#6B7280", lineHeight: 1.6, maxWidth: 320 }}>
                  The password reset link is missing required information or has already expired. Please request a new one.
                </p>
                <a href="/forgot-password" className="rp-signin-btn" style={{ textDecoration: "none" }}>
                  Request a New Link
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </a>
              </div>
            )}

            {/* ── STEP 1: Password form ── */}
            {!invalidLink && step === 1 && (
              <div className="rp-step">
                {/* Show which email this reset applies to */}
                {emailFromUrl && (
                  <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 10, background: `${BRAND}08`, border: `1px solid ${BRAND}20`, marginBottom: 20 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={BRAND} strokeWidth="1.8"/>
                      <polyline points="22,6 12,13 2,6" stroke={BRAND} strokeWidth="1.8"/>
                    </svg>
                    <span style={{ fontSize: 13, color: "#374151" }}>
                      Resetting password for <strong style={{ color: BRAND }}>{emailFromUrl}</strong>
                    </span>
                  </div>
                )}

                {/* API error */}
                {errors.api && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", marginBottom: 16 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.4"/>
                      <path d="M8 5v4M8 10.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <span style={{ fontSize: 13, color: "#B91C1C", lineHeight: 1.5, display: "block" }}>{errors.api}</span>
                      <a href="/forgot-password" style={{ fontSize: 12, color: BRAND, fontWeight: 600, textDecoration: "none" }}>
                        Request a new reset link →
                      </a>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* New password */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      New Password <span style={{ color: BRAND }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: focusedField === "pw" ? BRAND : "#9CA3AF", transition: "color 0.2s", pointerEvents: "none" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, pw: "", api: "" })); }}
                        onFocus={() => setFocused("pw")}
                        onBlur={() => setFocused(null)}
                        style={{ ...inputStyle(!!errors.pw, focusedField === "pw"), paddingLeft: 38, paddingRight: 42 }}
                        autoComplete="new-password"
                        disabled={isPending}
                      />
                      <EyeToggle show={showPw} onToggle={() => setShowPw(s => !s)} />
                    </div>

                    {/* Strength meter */}
                    {password.length > 0 && (
                      <div>
                        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                          {[1, 2, 3, 4].map(n => (
                            <div key={n} style={{ flex: 1, height: 5, borderRadius: 99, background: strength.score >= n ? strength.color : "#E5E7EB", transition: "background 0.3s ease" }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>Password strength</span>
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: strength.color, padding: "2px 8px", borderRadius: 99, background: strength.bg }}>{strength.label}</span>
                        </div>
                      </div>
                    )}

                    {errors.pw && (
                      <span style={{ fontSize: 11.5, color: "#EF4444", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#EF4444" strokeWidth="1.4"/><path d="M6 4v3M6 8.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/></svg>
                        {errors.pw}
                      </span>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      Confirm Password <span style={{ color: BRAND }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: focusedField === "cf" ? BRAND : "#9CA3AF", transition: "color 0.2s", pointerEvents: "none" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <input
                        type={showCf ? "text" : "password"}
                        placeholder="Repeat your new password"
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setErrors(er => ({ ...er, cf: "" })); }}
                        onFocus={() => setFocused("cf")}
                        onBlur={() => setFocused(null)}
                        style={{ ...inputStyle(!!errors.cf, focusedField === "cf"), paddingLeft: 38, paddingRight: 42 }}
                        autoComplete="new-password"
                        disabled={isPending}
                      />
                      <EyeToggle show={showCf} onToggle={() => setShowCf(s => !s)} />
                      {confirm.length > 0 && (
                        <div style={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)" }}>
                          {password === confirm
                            ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="#ECFDF5"/><path d="M4 7l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill="#FEF2F2"/><path d="M5 5l4 4M9 5L5 9" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          }
                        </div>
                      )}
                    </div>
                    {errors.cf && (
                      <span style={{ fontSize: 11.5, color: "#EF4444", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#EF4444" strokeWidth="1.4"/><path d="M6 4v3M6 8.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/></svg>
                        {errors.cf}
                      </span>
                    )}
                  </div>

                  {/* Password rules */}
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "#F8F9FA", border: "1px solid #F0F0F0" }}>
                    <p style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Password requirements
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {RULES.map((rule, i) => {
                        const passed = password.length > 0 && rule.test(password);
                        return (
                          <div key={rule.id} className="rp-rule" style={{ animationDelay: `${i * 0.05}s`, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: passed ? "#ECFDF5" : "#F3F4F6", border: `1.5px solid ${passed ? "#10B981" : "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s ease" }}>
                              {passed
                                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                : <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#D1D5DB" }} />
                              }
                            </div>
                            <span style={{ fontSize: 12.5, color: passed ? "#374151" : "#9CA3AF", fontWeight: passed ? 600 : 400, transition: "all 0.2s" }}>{rule.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" className="rp-submit" disabled={isPending} style={{ marginTop: 2 }}>
                    {isPending
                      ? <><div className="rp-spinner" /> Updating password...</>
                      : <>
                          Reset Password
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </>
                    }
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9CA3AF" }}>
                  Remember your password?{" "}
                  <a href="/login" style={{ color: BRAND, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
                    Back to Sign In
                  </a>
                </p>
              </div>
            )}

            {/* ── STEP 2: Success ── */}
            {!invalidLink && step === 2 && (
              <div className="rp-step" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div className="rp-success-icon" style={{ marginBottom: 22, position: "relative" }}>
                  <div className="rp-success-pulse" style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND}18, ${BRAND}06)`, border: `2px solid ${BRAND}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                      <path d="M21 3L6 9v9c0 9.94 6.44 19.26 15 21.62C29.56 37.26 36 27.94 36 18V9L21 3z" fill={`${BRAND}18`} stroke={BRAND} strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M14 21l5 5 9-9" stroke={BRAND} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {[
                    { top: -6, right: 2,  color: BRAND,      size: 8  },
                    { top: 6,  right: -10,color: "#10B981",  size: 6  },
                    { top: -8, left: 8,   color: "#6C63FF",  size: 7  },
                    { bottom: 2, left: -8,color: BRAND_DARK, size: 5  },
                    { bottom: -4,right: 8, color: "#10B981", size: 6  },
                  ].map((d, i) => (
                    <div key={i} style={{ position: "absolute", width: d.size, height: d.size, borderRadius: "50%", background: d.color, top: (d as any).top, right: (d as any).right, bottom: (d as any).bottom, left: (d as any).left, animation: `rpPop 0.5s ${0.1 + i * 0.07}s cubic-bezier(0.34,1.56,0.64,1) both` }} />
                  ))}
                </div>

                <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.3px" }}>Password Updated!</h2>
                <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6B7280", lineHeight: 1.65, maxWidth: 320 }}>
                  Your Crown Ledger password has been successfully changed. Your account is now secured with your new password.
                </p>

                <div style={{ width: "100%", background: "#F8F9FA", borderRadius: 14, padding: "16px 18px", marginBottom: 24, textAlign: "left" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11.5, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Security tips</p>
                  {[
                    "Never share your password with anyone",
                    "Use a unique password for each account",
                    "Enable Two-Factor Authentication for extra security",
                  ].map((tip, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < 2 ? 8 : 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: BRAND, marginTop: 5 }} />
                      <span style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.5 }}>{tip}</span>
                    </div>
                  ))}
                </div>

                <a href="/login" className="rp-signin-btn">
                  Sign In to Your Account
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
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