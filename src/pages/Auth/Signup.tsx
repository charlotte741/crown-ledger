/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import { useI18n } from "../../context/l18n";
import { Box, Typography } from "@mui/material";
import img from "../../assets/crown.png"
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../hooks/useAuth"; // adjust path as needed

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND = "#FA510F";
const BRAND_DARK = "#D94309";

// ─── Country list (ISO 3166-1) ────────────────────────────────────────────────
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada",
  "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia",
  "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

// ─── Currency list ─────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "INR", name: "Indian Rupee" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "ZAR", name: "South African Rand" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "THB", name: "Thai Baht" },
  { code: "MYR", name: "Malaysian Ringgit" },
];

// ─── Account types ─────────────────────────────────────────────────────────────
const ACCOUNT_TYPES = [
  {
    id: "savings",
    label: "Savings Account",
    desc: "Earn interest on your deposits with easy access",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "current",
    label: "Current Account",
    desc: "Unlimited transactions for everyday banking needs",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "fixed",
    label: "Fixed Deposit",
    desc: "Lock funds for guaranteed higher returns",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "business",
    label: "Business Account",
    desc: "Tailored tools for businesses of all sizes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 12v4M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "investment",
    label: "Investment Account",
    desc: "Grow wealth through diversified portfolios",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l4-4 4 4 4-4 4 4M3 7h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: "personal", label: "Personal", icon: "👤" },
  { id: "contact", label: "Contact", icon: "📱" },
  { id: "account", label: "Account", icon: "🏦" },
  { id: "pin", label: "PIN", icon: "🔢" },
  { id: "security", label: "Security", icon: "🔐" },
];

// ─── Reusable field components ────────────────────────────────────────────────
function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: BRAND, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 11.5, color: "#EF4444", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#EF4444" strokeWidth="1.4" /><path d="M6 4v3M6 8.5h.01" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round" /></svg>
          {error}
        </span>
      )}
    </div>
  );
}

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

function Input({
  type = "text", placeholder, value, onChange, error, disabled,
}: {
  type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; error?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} placeholder={placeholder} value={value} disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={inputStyle(!!error, focused)}
    />
  );
}

function Select({
  value, onChange, options, placeholder, error,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle(!!error, focused), appearance: "none", cursor: "pointer", paddingRight: 36 }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF" }} width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function PasswordInput({ placeholder, value, onChange, error }: { placeholder?: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle(!!error, focused), paddingRight: 42 }}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, display: "flex" }}>
        {show
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /></svg>
        }
      </button>
    </div>
  );
}

// ─── PIN Pad ───────────────────────────────────────────────────────────────────
function PinPad({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const len = 4;

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const arr = value.split("");
      arr[i] = "";
      onChange(arr.join(""));
      if (i > 0) inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/, "").slice(-1);
    const arr = value.padEnd(len, "").split("");
    arr[i] = digit;
    onChange(arr.join("").trim());
    if (digit && i < len - 1) inputs.current[i + 1]?.focus();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}<span style={{ color: BRAND }}>*</span>
      </span>
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: len }).map((_, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el; }}
            type="password" inputMode="numeric" maxLength={1}
            value={value[i] || ""}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            style={{
              width: 52, height: 60, textAlign: "center", fontSize: 22, fontWeight: 700,
              borderRadius: 12, border: `2px solid ${value[i] ? BRAND : "#E5E7EB"}`,
              background: value[i] ? `${BRAND}10` : "#FAFAFA",
              color: "#111827", outline: "none", transition: "all 0.2s ease",
              boxShadow: value[i] ? `0 0 0 3px ${BRAND}20` : "none",
              fontFamily: "monospace",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? colors[score - 1] : "#E5E7EB", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {checks.map((c, i) => (
            <span key={i} style={{ fontSize: 11, color: c.ok ? "#22C55E" : "#9CA3AF", display: "flex", alignItems: "center", gap: 3 }}>
              {c.ok ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: colors[score - 1] }}>{labels[score - 1]}</span>}
      </div>
    </div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ width: "100%", height: 3, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${((current + 1) / total) * 100}%`, background: `linear-gradient(90deg, ${BRAND}, #FF8A50)`, borderRadius: 99, transition: "width 0.4s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function Logo() {
  const { t } = useI18n();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        flexShrink: 0,
        textDecoration: 'none',
        transition: 'transform 0.2s ease',
        '&:hover': { transform: 'scale(1.02)' },
      }}
    >
      <Box
        component="img"
        src={img}
        alt="Crown Ledger Bank"
        sx={{
          width: 44,
          height: 44,
          objectFit: 'contain',
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 6px rgba(250,81,15,0.22))',
          transition: 'filter 0.2s ease',
          '&:hover': { filter: 'drop-shadow(0 4px 12px rgba(250,81,15,0.38))' },
        }}
      />
      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 16,
            color: '#fff',
            lineHeight: 1.15,
            letterSpacing: '-0.4px',
            whiteSpace: 'nowrap',
          }}
        >
          Crown{' '}
          <Box component="span" sx={{ color: BRAND }}>Ledger</Box>
        </Typography>
        <Typography
          sx={{
            fontSize: 9,
            color: '#94A3B8',
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            lineHeight: 1,
            mt: 0.35,
            whiteSpace: 'nowrap',
          }}
        >
          {t('logo_tagline')}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Email Sent Screen ────────────────────────────────────────────────────────
function EmailSentScreen({ email, firstName, onGoToLogin }: { email: string; firstName: string; onGoToLogin: () => void }) {
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Mask email for display: j***@example.com
  const maskEmail = (e: string) => {
    const [local, domain] = e.split("@");
    if (!domain) return e;
    return `${local[0]}${"*".repeat(Math.min(local.length - 1, 4))}@${domain}`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#F8F9FC 0%,#EEF2FF 100%)",
      padding: "20px 16px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes floatUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes popIn { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(250,81,15,0.3); } 50% { box-shadow: 0 0 0 14px rgba(250,81,15,0); } }
        .email-card { animation: floatUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .resend-btn:hover:not(:disabled) { background: ${BRAND}15 !important; color: ${BRAND} !important; }
        .login-btn:hover { background: ${BRAND_DARK} !important; transform: translateY(-1px) !important; box-shadow: 0 8px 24px ${BRAND}45 !important; }
      `}</style>

      <div className="email-card" style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>

        {/* Header strip */}
        <div style={{ background: `linear-gradient(135deg,#0D1117 0%,#1A2035 100%)`, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${BRAND}30 0%,transparent 70%)`, pointerEvents: "none" }} />
          <Logo />
        </div>

        {/* Body */}
        <div style={{ padding: "40px 32px 36px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

          {/* Animated envelope icon */}
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: `linear-gradient(135deg,${BRAND}15,${BRAND}25)`,
            border: `2px solid ${BRAND}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24,
            animation: "popIn 0.5s cubic-bezier(.34,1.56,.64,1) 0.1s both, pulse 2.5s ease-in-out 1s infinite",
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="10" width="32" height="22" rx="4" stroke={BRAND} strokeWidth="2" />
              <path d="M4 14l16 11 16-11" stroke={BRAND} strokeWidth="2" strokeLinecap="round" />
              {/* checkmark badge */}
              <circle cx="30" cy="10" r="8" fill="#22C55E" />
              <path d="M26.5 10l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0D1117", margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            Check your inbox,<br />{firstName}!
          </h2>

          <p style={{ color: "#64748B", fontSize: 14.5, lineHeight: 1.75, margin: "0 0 24px", maxWidth: 360 }}>
            We've sent a verification link to
          </p>

          {/* Email pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#F8F9FC", border: "1.5px solid #E5E7EB",
            borderRadius: 99, padding: "9px 18px", marginBottom: 28,
          }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="#6B7280" strokeWidth="1.4" /><path d="M1 6l7 5 7-5" stroke="#6B7280" strokeWidth="1.4" strokeLinecap="round" /></svg>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", fontFamily: "monospace" }}>{maskEmail(email)}</span>
          </div>

          {/* Steps */}
          <div style={{ width: "100%", background: "#F8F9FC", borderRadius: 14, padding: "18px 20px", marginBottom: 28, textAlign: "left" }}>
            {[
              { num: "1", text: "Open the email from Crown Ledger" },
              { num: "2", text: "Click the \"Verify my email\" button" },
              { num: "3", text: "You'll be redirected to sign in" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: i < 2 ? "0 0 12px" : "0", borderBottom: i < 2 ? "1px solid #E5E7EB" : "none", marginBottom: i < 2 ? 12 : 0 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${BRAND}15`, color: BRAND, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.num}
                </div>
                <span style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* CTA: go to login */}
          <button
            type="button"
            className="login-btn"
            onClick={onGoToLogin}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
              background: `linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%)`,
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", boxShadow: `0 4px 16px ${BRAND}35`,
              transition: "all 0.2s ease", marginBottom: 14,
            }}
          >
            Go to Sign In
          </button>

          {/* Resend */}
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>
            Didn't receive it?{" "}
            <button
              type="button"
              className="resend-btn"
              disabled={resendCooldown > 0}
              onClick={startCooldown}
              style={{
                background: "transparent", border: "none", cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                color: resendCooldown > 0 ? "#9CA3AF" : "#374151", fontWeight: 600, fontSize: 13,
                fontFamily: "inherit", padding: "2px 6px", borderRadius: 6, transition: "all 0.2s",
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
            </button>
          </div>

          <p style={{ marginTop: 16, fontSize: 11.5, color: "#CBD5E1", lineHeight: 1.6 }}>
            Check your spam folder if you don't see it within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main SignUp component ────────────────────────────────────────────────────
export default function SignUp() {
  const [step, setStep] = useState(0);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { mutate: signup, isPending: isSubmitting } = useSignup();

  // Form state
  const [form, setForm] = useState({
    firstName: "", lastName: "", middleName: "", username: "",
    email: "", phone: "", country: "",
    currency: "", accountType: "",
    pin: "", pinConfirm: "",
    password: "", confirmPassword: "",
    agreed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string | boolean) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: "" }));
    setApiError(null);
  };

  const goTo = (next: number) => {
    if (animating) return;
    setAnimDir(next > step ? "forward" : "back");
    setVisible(false);
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setVisible(true);
      setTimeout(() => setAnimating(false), 350);
    }, 280);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.firstName.trim()) errs.firstName = "First name is required";
      if (!form.lastName.trim()) errs.lastName = "Last name is required";
      if (!form.username.trim()) errs.username = "Username is required";
      else if (form.username.length < 3) errs.username = "Must be at least 3 characters";
    }
    if (step === 1) {
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email address";
      if (!form.phone.trim()) errs.phone = "Phone number is required";
      if (!form.country) errs.country = "Please select your country";
    }
    if (step === 2) {
      if (!form.currency) errs.currency = "Please select a currency";
      if (!form.accountType) errs.accountType = "Please select an account type";
    }
    if (step === 3) {
      if (form.pin.length < 4) errs.pin = "Enter a 4-digit PIN";
      if (form.pinConfirm !== form.pin) errs.pinConfirm = "PINs do not match";
    }
    if (step === 4) {
      if (!form.password) errs.password = "Password is required";
      else if (form.password.length < 8) errs.password = "Minimum 8 characters";
      if (form.confirmPassword !== form.password) errs.confirmPassword = "Passwords do not match";
      if (!form.agreed) errs.agreed = "You must accept the terms";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) {
      goTo(step + 1);
    } else {
      // Final step — call the API
      setApiError(null);
      signup(
        {
          firstName: form.firstName,
          lastName: form.lastName,
          middleName: form.middleName || undefined,
          username: form.username,
          email: form.email,
          phoneNumber: form.phone,
          country: form.country,
          currency: form.currency,
          accountType: form.accountType,
          pin: form.pin,
          password: form.password,
          confirmPassword: form.confirmPassword,
          agreedToTerms: true,
        },
        {
          onSuccess: () => {
            setEmailSent(true);
          },
          onError: (err: any) => {
            const message =
              err?.response?.data?.message ||
              err?.message ||
              "Something went wrong. Please try again.";
            setApiError(message);
          },
        }
      );
    }
  };

  const handleBack = () => { if (step > 0) goTo(step - 1); };

  // ── Email Sent Screen ────────────────────────────────────────────────────────
  if (emailSent) {
    return (
      <EmailSentScreen
        email={form.email}
        firstName={form.firstName}
        onGoToLogin={() => navigate("/login")}
      />
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeForward { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:none; } }
        @keyframes fadeBack    { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:none; } }
        @keyframes popIn       { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
        @keyframes slideUp     { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes spin        { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

        .su-panel {
          animation: ${animDir === "forward" ? "fadeForward" : "fadeBack"} 0.32s cubic-bezier(.22,1,.36,1) both;
        }
        .su-panel-hide { opacity: 0; pointer-events: none; }

        .su-acct-btn { transition: all 0.2s ease; }
        .su-acct-btn:hover { border-color: ${BRAND}80 !important; background: ${BRAND}06 !important; transform: translateY(-1px); }

        .su-next-btn:hover:not(:disabled) { background: ${BRAND_DARK} !important; transform: translateY(-1px) !important; box-shadow: 0 8px 24px ${BRAND}45 !important; }
        .su-next-btn:active { transform: translateY(0) !important; }
        .su-next-btn:disabled { opacity: 0.75; cursor: not-allowed; }
        .su-back-btn:hover { border-color: ${BRAND} !important; color: ${BRAND} !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#F8F9FC 0%,#EEF2FF 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Card */}
        <div style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: `linear-gradient(135deg,#0D1117 0%,#1A2035 100%)`, padding: "28px 32px 24px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${BRAND}30 0%,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, left: 60, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Logo />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>
                Step {step + 1} of {STEPS.length}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
                {["Personal Information", "Contact Details", "Account Setup", "Transaction PIN", "Security Setup"][step]}
              </div>
            </div>

            <StepBar current={step} total={STEPS.length} />

            <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: i === step ? 2 : 1, transition: "flex 0.3s ease" }}>
                  <div style={{
                    height: 6, width: "100%", borderRadius: 99,
                    background: i < step ? BRAND : i === step ? `linear-gradient(90deg,${BRAND},#FF8A50)` : "rgba(255,255,255,0.15)",
                    transition: "all 0.3s ease",
                  }} />
                  {i === step && (
                    <span style={{ fontSize: 9, color: BRAND, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                      {s.icon} {s.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px 32px" }}>
            <div className={visible ? "su-panel" : "su-panel-hide"}>

              {/* ── Step 0: Personal ── */}
              {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="First Name" error={errors.firstName} required>
                      <Input placeholder="John" value={form.firstName} onChange={v => set("firstName", v)} error={errors.firstName} />
                    </Field>
                    <Field label="Last Name" error={errors.lastName} required>
                      <Input placeholder="Doe" value={form.lastName} onChange={v => set("lastName", v)} error={errors.lastName} />
                    </Field>
                  </div>
                  <Field label="Middle Name" error={errors.middleName}>
                    <Input placeholder="Optional" value={form.middleName} onChange={v => set("middleName", v)} />
                  </Field>
                  <Field label="Username" error={errors.username} required>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}>@</span>
                      <Input placeholder="johndoe" value={form.username} onChange={v => set("username", v.toLowerCase().replace(/\s/g, ""))} error={errors.username} />
                    </div>
                    {form.username && !errors.username && (
                      <span style={{ fontSize: 11.5, color: "#22C55E", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#22C55E" strokeWidth="1.4" /><path d="M4 6l1.5 1.5L8 4.5" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" /></svg>
                        @{form.username} looks available
                      </span>
                    )}
                  </Field>
                </div>
              )}

              {/* ── Step 1: Contact ── */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Field label="Email Address" error={errors.email} required>
                    <Input type="email" placeholder="john@example.com" value={form.email} onChange={v => set("email", v)} error={errors.email} />
                  </Field>
                  <Field label="Phone Number" error={errors.phone} required>
                    <Input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={v => set("phone", v)} error={errors.phone} />
                  </Field>
                  <Field label="Country" error={errors.country} required>
                    <Select
                      value={form.country}
                      onChange={v => set("country", v)}
                      placeholder="Select your country"
                      error={errors.country}
                      options={COUNTRIES.map(c => ({ value: c, label: c }))}
                    />
                  </Field>
                </div>
              )}

              {/* ── Step 2: Account ── */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <Field label="Preferred Currency" error={errors.currency} required>
                    <Select
                      value={form.currency}
                      onChange={v => set("currency", v)}
                      placeholder="Select currency"
                      error={errors.currency}
                      options={CURRENCIES.map(c => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                    />
                  </Field>
                  <Field label="Account Type" error={errors.accountType} required>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {ACCOUNT_TYPES.map(at => (
                        <button
                          key={at.id}
                          type="button"
                          className="su-acct-btn"
                          onClick={() => set("accountType", at.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                            border: `1.5px solid ${form.accountType === at.id ? BRAND : "#E5E7EB"}`,
                            background: form.accountType === at.id ? `${BRAND}08` : "#FAFAFA",
                            textAlign: "left", width: "100%", fontFamily: "inherit",
                            boxShadow: form.accountType === at.id ? `0 0 0 3px ${BRAND}18` : "none",
                          }}
                        >
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: form.accountType === at.id ? `${BRAND}15` : "#F3F4F6", color: form.accountType === at.id ? BRAND : "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                            {at.icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: form.accountType === at.id ? "#0D1117" : "#374151", marginBottom: 2 }}>{at.label}</div>
                            <div style={{ fontSize: 11.5, color: "#9CA3AF", lineHeight: 1.4 }}>{at.desc}</div>
                          </div>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${form.accountType === at.id ? BRAND : "#D1D5DB"}`, background: form.accountType === at.id ? BRAND : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                            {form.accountType === at.id && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.accountType && (
                      <span style={{ fontSize: 11.5, color: "#EF4444" }}>{errors.accountType}</span>
                    )}
                  </Field>
                </div>
              )}

              {/* ── Step 3: PIN ── */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  <div style={{ background: `${BRAND}08`, border: `1px solid ${BRAND}25`, borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#92400E", lineHeight: 1.6 }}>
                    <strong>🔒 Keep your PIN safe.</strong> Your 4-digit transaction PIN authorises all transfers and payments. Never share it with anyone.
                  </div>
                  <PinPad value={form.pin} onChange={v => set("pin", v)} label="Create Transaction PIN" />
                  {errors.pin && <span style={{ fontSize: 11.5, color: "#EF4444", textAlign: "center" }}>{errors.pin}</span>}
                  <PinPad value={form.pinConfirm} onChange={v => set("pinConfirm", v)} label="Confirm Transaction PIN" />
                  {errors.pinConfirm && <span style={{ fontSize: 11.5, color: "#EF4444", textAlign: "center" }}>{errors.pinConfirm}</span>}
                  {form.pin.length === 4 && form.pinConfirm.length === 4 && form.pin === form.pinConfirm && (
                    <div style={{ textAlign: "center", animation: "popIn .3s ease both" }}>
                      <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 600 }}>✓ PINs match</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 4: Security ── */}
              {step === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Field label="Password" error={errors.password} required>
                    <PasswordInput placeholder="Create a strong password" value={form.password} onChange={v => set("password", v)} error={errors.password} />
                  </Field>
                  <PasswordStrength password={form.password} />
                  <Field label="Confirm Password" error={errors.confirmPassword} required>
                    <PasswordInput placeholder="Repeat your password" value={form.confirmPassword} onChange={v => set("confirmPassword", v)} error={errors.confirmPassword} />
                    {form.confirmPassword && form.confirmPassword === form.password && !errors.confirmPassword && (
                      <span style={{ fontSize: 11.5, color: "#22C55E", display: "flex", alignItems: "center", gap: 4 }}>✓ Passwords match</span>
                    )}
                  </Field>

                  {/* Terms */}
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${errors.agreed ? "#EF4444" : form.agreed ? BRAND : "#E5E7EB"}`, background: form.agreed ? `${BRAND}06` : "#FAFAFA", transition: "all 0.2s" }}>
                    <div
                      onClick={() => set("agreed", !form.agreed)}
                      style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${form.agreed ? BRAND : "#D1D5DB"}`, background: form.agreed ? BRAND : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.2s", cursor: "pointer" }}
                    >
                      {form.agreed && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>}
                    </div>
                    <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                      I have read and agree to the{" "}
                      <span style={{ color: BRAND, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Terms of Service</span>
                      {" "}and{" "}
                      <span style={{ color: BRAND, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>
                      {" "}of Crown Ledger Bank.
                    </span>
                  </label>
                  {errors.agreed && <span style={{ fontSize: 11.5, color: "#EF4444" }}>{errors.agreed}</span>}

                  {/* API error banner */}
                  {apiError && (
                    <div style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      background: "#FEF2F2", border: "1.5px solid #FECACA",
                      borderRadius: 10, padding: "12px 14px",
                      animation: "slideUp 0.25s ease both",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5" />
                        <path d="M8 5v4M8 10.5h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: 13, color: "#DC2626", lineHeight: 1.5 }}>{apiError}</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Navigation buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="su-back-btn"
                  style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "transparent", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="su-next-btn"
                style={{ flex: 2, padding: "13px 0", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${BRAND} 0%,${BRAND_DARK} 100%)`, color: "#fff", fontSize: 14, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${BRAND}35`, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {isSubmitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                      <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Creating Account…
                  </>
                ) : (
                  <>
                    {step === STEPS.length - 1 ? "Create Account" : "Continue"}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                  </>
                )}
              </button>
            </div>

            {/* Sign in link */}
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9CA3AF" }}>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} style={{ color: BRAND, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}