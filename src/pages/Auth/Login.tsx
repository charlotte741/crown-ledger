import React, { useState } from "react";
import { useI18n } from "../../context/l18n";
import { Box, Typography } from "@mui/material";
import img from "../../assets/crown.png";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useAuth";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND = "#FA510F";
const BRAND_DARK = "#D94309";

// ─── i18n copy ────────────────────────────────────────────────────────────────
const COPY = {
  en: {
    welcome:     "Welcome back",
    sub:         "Sign in to your Crown Ledger account",
    email_label: "Email Address",
    email_ph:    "john@example.com",
    pass_label:  "Password",
    pass_ph:     "Enter your password",
    forgot:      "Forgot password?",
    remember:    "Remember me for 30 days",
    signin:      "Sign In",
    no_account:  "Don't have an account?",
    signup:      "Create account",
    // or:          "or continue with",
    trust1:      "256-bit SSL encrypted",
    trust2:      "Globally regulated",
    trust3:      "Instant access",
    err_email:   "Please enter a valid email",
    err_pass:    "Password is required",
  },
  es: {
    welcome:     "Bienvenido de vuelta",
    sub:         "Inicia sesión en tu cuenta Crown Ledger",
    email_label: "Correo Electrónico",
    email_ph:    "juan@ejemplo.com",
    pass_label:  "Contraseña",
    pass_ph:     "Ingresa tu contraseña",
    forgot:      "¿Olvidaste tu contraseña?",
    remember:    "Recuérdame por 30 días",
    signin:      "Iniciar Sesión",
    no_account:  "¿No tienes cuenta?",
    signup:      "Crear cuenta",
    or:          "o continúa con",
    trust1:      "Cifrado SSL de 256 bits",
    trust2:      "Regulado globalmente",
    trust3:      "Acceso instantáneo",
    err_email:   "Ingresa un correo válido",
    err_pass:    "La contraseña es requerida",
  },
};

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
  const { t } = useI18n();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: "pointer",
        flexShrink: 0,
        textDecoration: "none",
        transition: "transform 0.2s ease",
        "&:hover": { transform: "scale(1.02)" },
      }}
    >
      <Box
        component="img"
        src={img}
        alt="Crown Ledger Bank"
        sx={{
          width: 44,
          height: 44,
          objectFit: "contain",
          flexShrink: 0,
          filter: "drop-shadow(0 2px 6px rgba(250,81,15,0.22))",
          transition: "filter 0.2s ease",
          "&:hover": { filter: "drop-shadow(0 4px 12px rgba(250,81,15,0.38))" },
        }}
      />
      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 16,
            color: "#fff",
            lineHeight: 1.15,
            letterSpacing: "-0.4px",
            whiteSpace: "nowrap",
          }}
        >
          Crown{" "}
          <Box component="span" sx={{ color: BRAND }}>
            Ledger
          </Box>
        </Typography>
        <Typography
          sx={{
            fontSize: 9,
            color: "#94A3B8",
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            lineHeight: 1,
            mt: 0.35,
            whiteSpace: "nowrap",
          }}
        >
          {t("logo_tagline")}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Social button ────────────────────────────────────────────────────────────
// function SocialBtn({ children }: { children: React.ReactNode }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <button
//       type="button"
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{
//         flex: 1,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: 8,
//         padding: "11px 0",
//         borderRadius: 10,
//         border: `1.5px solid ${hov ? BRAND + "60" : "#E5E7EB"}`,
//         background: hov ? BRAND + "06" : "#FAFAFA",
//         cursor: "pointer",
//         fontFamily: "inherit",
//         fontSize: 13,
//         fontWeight: 600,
//         color: "#374151",
//         transition: "all 0.2s ease",
//       }}
//     >
//       {children}
//     </button>
//   );
// }

// ─── Main Login component ─────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const c = COPY[language as keyof typeof COPY] ?? COPY.en;

  const { mutate: login, isPending } = useLogin();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string; api?: string }>({});
  const [focusedField, setFocused] = useState<string | null>(null);

  const validate = () => {
    const e: typeof errors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = c.err_email;
    if (!password) e.password = c.err_pass;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

const handleSubmit = (ev: React.FormEvent) => {
  ev.preventDefault();
  if (!validate()) return;
  setErrors({});

  login(
    { email, password, rememberMe: remember },
    {
      onSuccess: () => {
        // console.log("🔥 Login response:", data);
        // console.log("🔄 Remember Me enabled:", remember);

        navigate("/dashboard");
      },
      onError: (error: unknown) => {
        const err = error as {
          message?: string;
          response?: { data?: { message?: string } };
        };

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Invalid email or password. Please try again.";

        // console.log("❌ Login error:", err);

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

        @keyframes lgFadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes lgSpin    { to { transform: rotate(360deg); } }
        @keyframes lgShimmer { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }

        .lg-card { animation: lgFadeUp .45s cubic-bezier(.22,1,.36,1) both; }

        .lg-submit {
          width: 100%;
          padding: 13px 0;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 16px ${BRAND}35;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .lg-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%);
          transform: translateX(-120%);
        }
        .lg-submit:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 26px ${BRAND}45; }
        .lg-submit:not(:disabled):hover::after { animation: lgShimmer 0.7s ease; }
        .lg-submit:not(:disabled):active { transform: translateY(0); }
        .lg-submit:disabled { opacity: 0.75; cursor: not-allowed; }

        .lg-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lgSpin 0.7s linear infinite;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#F8F9FC 0%,#EEF2FF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          className="lg-card"
          style={{
            width: "100%",
            maxWidth: 540,
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* ── Dark header ── */}
          <div
            style={{
              background: "linear-gradient(135deg,#0D1117 0%,#1A2035 100%)",
              padding: "28px 32px 28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${BRAND}30 0%,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, left: 60, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />

            <div style={{ marginBottom: 22 }}><Logo /></div>

            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 6 }}>
                {c.welcome} 👋
              </div>
              <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                {c.sub}
              </div>
            </div>
          </div>

          {/* ── Form body ── */}
          <div style={{ padding: "28px 32px 32px" }}>

            {/* Social buttons */}
            {/* <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <SocialBtn>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </SocialBtn>
              <SocialBtn>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </SocialBtn>
            </div> */}

            {/* Divider */}
            {/* <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#9CA3AF", fontSize: 12, fontWeight: 500, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              {c.or}
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            </div> */}

            {/* API error banner */}
            {errors.api && (
              <div style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "12px 14px", borderRadius: 10,
                background: "#FEF2F2", border: "1px solid #FECACA",
                marginBottom: 16,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.4"/>
                  <path d="M8 5v4M8 10.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 13, color: "#B91C1C", lineHeight: 1.5 }}>{errors.api}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {c.email_label}<span style={{ color: BRAND, marginLeft: 3 }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: focusedField === "email" ? BRAND : "#9CA3AF", transition: "color 0.2s", pointerEvents: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder={c.email_ph}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: "", api: "" })); }}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    style={{ ...inputStyle(!!errors.email, focusedField === "email"), paddingLeft: 38 }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span style={{ fontSize: 11.5, color: "#EF4444", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#EF4444" strokeWidth="1.4"/><path d="M6 4v3M6 8.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {c.pass_label}<span style={{ color: BRAND, marginLeft: 3 }}>*</span>
                  </label>
                  <span onClick={() => navigate("/forgotpassword")} style={{ fontSize: 12, color: BRAND, fontWeight: 600, cursor: "pointer" }}>
                    {c.forgot}
                  </span>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: focusedField === "pass" ? BRAND : "#9CA3AF", transition: "color 0.2s", pointerEvents: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={c.pass_ph}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: "", api: "" })); }}
                    onFocus={() => setFocused("pass")}
                    onBlur={() => setFocused(null)}
                    style={{ ...inputStyle(!!errors.password, focusedField === "pass"), paddingLeft: 38, paddingRight: 42 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex" }}
                  >
                    {showPass
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
                    }
                  </button>
                </div>
                {errors.password && (
                  <span style={{ fontSize: 11.5, color: "#EF4444", display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#EF4444" strokeWidth="1.4"/><path d="M6 4v3M6 8.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Remember me */}
              <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
                <div
                  onClick={() => setRemember(r => !r)}
                  style={{
                    width: 18, height: 18, borderRadius: 5,
                    border: `2px solid ${remember ? BRAND : "#D1D5DB"}`,
                    background: remember ? BRAND : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.2s", cursor: "pointer",
                  }}
                >
                  {remember && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 13, color: "#374151" }}>{c.remember}</span>
              </label>

              {/* Submit */}
              <button type="submit" className="lg-submit" disabled={isPending} style={{ marginTop: 4 }}>
                {isPending
                  ? <><div className="lg-spinner" /> Signing in...</>
                  : <>
                      {c.signin}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </>
                }
              </button>
            </form>

            {/* Sign up link */}
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9CA3AF" }}>
              {c.no_account}{" "}
              <span onClick={() => navigate("/open-Account")} style={{ color: BRAND, fontWeight: 600, cursor: "pointer" }}>{c.signup}</span>
            </p>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 24, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
              {[
                { icon: "🔒", label: c.trust1 },
                { icon: "🏛️", label: c.trust2 },
                { icon: "⚡", label: c.trust3 },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>
                  <span style={{ fontSize: 13 }}>{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
