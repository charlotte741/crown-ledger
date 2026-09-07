import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../context/l18n';

const BRAND      = '#FA510F';
// const BRAND_DARK = '#D94309';

// ── Account data ──────────────────────────────────────────────────────────────
const ACCOUNTS = [
  {
    id: 'checking',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: '#3B82F6',
    bg: '#EFF6FF',
    badge: null,
    en: {
      title: 'Checking Account',
      sub: 'Everyday banking made easy with no monthly fees and unlimited transactions.',
      perks: ['No monthly maintenance fee', 'Free online and mobile banking', 'Free debit card', 'Overdraft protection available'],
      // cta: 'Open account',
    },
    es: {
      title: 'Cuenta Corriente',
      sub: 'Banca cotidiana sin comisiones mensuales y transacciones ilimitadas.',
      perks: ['Sin cuota de mantenimiento', 'Banca online y móvil gratis', 'Tarjeta de débito gratuita', 'Protección contra sobregiros'],
      cta: 'Abrir cuenta',
    },
  },
  {
    id: 'savings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: '#10B981',
    bg: '#ECFDF5',
    badge: '2.50% APY',
    en: {
      title: 'High Yield Savings',
      sub: 'Grow your money with competitive interest rates and flexible access.',
      perks: ['2.50% APY interest rate', 'No minimum balance', 'FDIC insured up to $250K', 'Unlimited withdrawals'],
      // cta: 'Start saving',
    },
    es: {
      title: 'Ahorro de Alto Rendimiento',
      sub: 'Haz crecer tu dinero con tasas de interés competitivas y acceso flexible.',
      perks: ['Tasa de interés 2.50% APY', 'Sin saldo mínimo', 'Asegurado FDIC hasta $250K', 'Retiros ilimitados'],
      cta: 'Empezar a ahorrar',
    },
  },
  {
    id: 'money-market',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: '#8B5CF6',
    bg: '#F5F3FF',
    badge: '3.25% APY',
    en: {
      title: 'Money Market',
      sub: 'Higher interest rates with check-writing privileges and debit card access.',
      perks: ['3.25% APY interest rate', '$2,500 minimum balance', 'Limited check writing', 'Debit card included'],
      // cta: 'Learn more',
    },
    es: {
      title: 'Mercado Monetario',
      sub: 'Tasas más altas con privilegios de cheques y acceso con tarjeta de débito.',
      perks: ['Tasa de interés 3.25% APY', 'Saldo mínimo $2,500', 'Cheques limitados', 'Tarjeta de débito incluida'],
      cta: 'Más información',
    },
  },
  {
    id: 'cd',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#F59E0B',
    bg: '#FFFBEB',
    badge: 'Up to 4.50% APY',
    en: {
      title: 'Certificate of Deposit',
      sub: 'Lock in guaranteed returns with our competitive CD rates and terms.',
      perks: ['Up to 4.50% APY', 'Terms from 3 months to 5 years', '$1,000 minimum deposit', 'Guaranteed rate of return'],
      // cta: 'View CD rates',
    },
    es: {
      title: 'Certificado de Depósito',
      sub: 'Asegura rendimientos garantizados con nuestras tasas competitivas.',
      perks: ['Hasta 4.50% APY', 'Plazos de 3 meses a 5 años', 'Depósito mínimo $1,000', 'Tasa garantizada'],
      cta: 'Ver tasas',
    },
  },
  {
    id: 'ira',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 22V12M3 12l9-9 9 9M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="9" y="16" width="6" height="6" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    color: '#EC4899',
    bg: '#FDF2F8',
    badge: 'Tax Advantaged',
    en: {
      title: 'IRA Accounts',
      sub: 'Plan for retirement with traditional and Roth IRA options.',
      perks: ['Traditional and Roth options', 'Tax advantages', 'Investment options available', 'Retirement planning tools'],
      // cta: 'Plan retirement',
    },
    es: {
      title: 'Cuentas IRA',
      sub: 'Planifica tu jubilación con opciones de IRA tradicional y Roth.',
      perks: ['Opciones tradicional y Roth', 'Ventajas fiscales', 'Opciones de inversión', 'Herramientas de planificación'],
      cta: 'Planificar jubilación',
    },
  },
  {
    id: 'youth',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a5 5 0 100 10A5 5 0 0012 2z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 11l1.5 1.5L20 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#06B6D4',
    bg: '#ECFEFF',
    badge: 'Ages 13–17',
    en: {
      title: 'Youth Savings',
      sub: 'Help young savers build good financial habits with our youth accounts.',
      perks: ['Ages 13–17 eligible', 'No monthly fees', 'Financial education resources', 'Parent/guardian oversight'],
      // cta: 'Open youth account',
    },
    es: {
      title: 'Ahorro Juvenil',
      sub: 'Ayuda a los jóvenes a construir buenos hábitos financieros.',
      perks: ['Elegible 13–17 años', 'Sin cuotas mensuales', 'Recursos educativos financieros', 'Supervisión de padres/tutores'],
      cta: 'Abrir cuenta juvenil',
    },
  },
];

const COPY = {
  en: {
    eyebrow:  'Personal Savings',
    heading1: 'Everything you need',
    heading2: 'to take control of your money.',
    sub:      'Whether you\'re saving for a rainy day, planning for retirement, or teaching your child the value of money — Crown Ledger has the right account for every goal.',
    trusted:  'Trusted by 2.4M+ customers',
    fdic:     'FDIC Insured',
    secure:   '256-bit encrypted',
  },
  es: {
    eyebrow:  'Banca Personal',
    heading1: 'Todo lo que necesitas',
    heading2: 'para controlar tu dinero.',
    sub:      'Ya sea que estés ahorrando para emergencias, planificando la jubilación o enseñando a tu hijo el valor del dinero — Crown Ledger tiene la cuenta correcta para cada meta.',
    trusted:  'Confiado por más de 2.4M clientes',
    fdic:     'Asegurado FDIC',
    secure:   'Cifrado de 256 bits',
  },
};

// ── Intersection observer hook ────────────────────────────────────────────────
function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Single account card ───────────────────────────────────────────────────────
function AccountCard({
  account, lang, inView, featured,
}: {
  account: typeof ACCOUNTS[0];
  lang: string;
  inView: boolean;
  delay: number;
  featured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const t = account[lang as keyof typeof account] as { title: string; sub: string; perks: string[]; cta: string } | undefined
    ?? account.en;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: featured ? `2px solid ${BRAND}` : '1.5px solid rgba(0,0,0,0.07)',
        borderRadius: 20,
        padding: 'clamp(20px,2.5vw,28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 20px 52px rgba(0,0,0,0.11), 0 4px 16px rgba(0,0,0,0.06)'
          : featured
          ? `0 8px 28px rgba(250,81,15,0.14), 0 2px 8px rgba(0,0,0,0.04)`
          : '0 2px 12px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'box-shadow .25s ease, transform .25s ease, border-color .25s ease',
        opacity: inView ? 1 : 0,
        // stagger uses a CSS animation instead so it only fires once
      }}
      className={`pb-card pb-card-${account.id}`}
    >
      {/* featured glow top strip */}
      {featured && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${BRAND}, #FF8A50)`,
          borderRadius: '20px 20px 0 0',
        }} />
      )}

      {/* subtle top-right circle accent */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: account.bg,
        opacity: 0.7,
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13,
          background: account.bg,
          color: account.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'transform .2s ease',
          transform: hovered ? 'scale(1.08)' : 'none',
        }}>
          {account.icon}
        </div>
        {account.badge && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: featured ? BRAND : account.color,
            background: featured ? 'rgba(250,81,15,0.08)' : account.bg,
            border: `1px solid ${featured ? 'rgba(250,81,15,0.2)' : account.bg}`,
            borderRadius: 99,
            padding: '4px 10px',
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap',
          }}>
            {account.badge}
          </span>
        )}
      </div>

      {/* Title + sub */}
      <h3 style={{
        margin: '0 0 8px',
        // fontFamily: '"Syne", Georgia, serif',
        fontWeight: 800,
        fontSize: 'clamp(16px,1.6vw,19px)',
        color: '#0D1117',
        lineHeight: 1.2,
        letterSpacing: '-0.3px',
      }}>
        {t.title}
      </h3>
      <p style={{
        margin: '0 0 18px',
        fontSize: 13,
        lineHeight: 1.65,
        color: '#64748B',
        flexGrow: 0,
      }}>
        {t.sub}
      </p>

      {/* Perks */}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
        {t.perks.map((perk, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: account.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke={account.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.4 }}>{perk}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {/* <div style={{ marginTop: 'auto' }}>
        <button
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: 11,
            border: featured ? 'none' : `1.5px solid rgba(0,0,0,0.1)`,
            background: featured ? BRAND : 'transparent',
            color: featured ? '#fff' : '#334155',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            letterSpacing: '-0.1px',
            transition: 'all .2s ease',
            boxShadow: featured ? `0 4px 16px rgba(250,81,15,0.28)` : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onMouseOver={e => {
            const b = e.currentTarget;
            if (featured) { b.style.background = BRAND_DARK; b.style.transform = 'scale(1.01)'; }
            else { b.style.borderColor = BRAND; b.style.color = BRAND; b.style.background = 'rgba(250,81,15,0.04)'; }
          }}
          onMouseOut={e => {
            const b = e.currentTarget;
            b.style.background = featured ? BRAND : 'transparent';
            b.style.color = featured ? '#fff' : '#334155';
            b.style.borderColor = featured ? 'none' : 'rgba(0,0,0,0.1)';
            b.style.transform = 'none';
          }}
        >
          {t.cta}
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div> */}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const PersonalBanking: React.FC = () => {
  const { language } = useI18n();
  const c = COPY[language as keyof typeof COPY] ?? COPY.en;
  const { ref, inView } = useInView();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes pbCardIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pb-section {
          background: #F8F9FC;
          font-family: "DM Sans", sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* faint dot grid background */
        .pb-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.055) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        /* subtle brand gradient top-left */
        .pb-section::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250,81,15,0.06) 0%, transparent 70%);
          top: -120px; left: -120px;
          pointer-events: none;
          z-index: 0;
        }

        .pb-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(64px,9vh,108px) clamp(16px,5vw,60px);
        }

        /* ── Header ── */
        .pb-header {
          max-width: 680px;
          margin: 0 auto clamp(44px,6vh,68px);
          text-align: center;
        }

        /* ── Card grid ── */
        .pb-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px,2vw,22px);
        }

        /* staggered entrance animation */
        .pb-card { animation: pbCardIn .6s ease both; }
        .pb-card-checking      { animation-delay: 0.05s; }
        .pb-card-savings       { animation-delay: 0.13s; }
        .pb-card-money-market  { animation-delay: 0.21s; }
        .pb-card-cd            { animation-delay: 0.29s; }
        .pb-card-ira           { animation-delay: 0.37s; }
        .pb-card-youth         { animation-delay: 0.45s; }

        /* ── Trust bar ── */
        .pb-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: clamp(16px,3vw,36px);
          margin-top: clamp(40px,5vh,60px);
          padding-top: clamp(24px,3vh,32px);
          border-top: 1px solid rgba(0,0,0,0.07);
        }

        .pb-trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #64748B;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .pb-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .pb-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .pb-inner {
            padding: clamp(44px,6vh,64px) clamp(14px,4vw,20px);
          }
          .pb-header { margin-bottom: clamp(32px,5vh,48px); }
        }
      `}</style>

      <section className="pb-section">
        <div className="pb-inner" ref={ref}>

          {/* ── Section header ── */}
          <div className="pb-header">
            {/* eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              marginBottom: 18,
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(14px)',
              transition: 'opacity .55s ease .05s, transform .55s ease .05s',
            }}>
              <span style={{ width: 24, height: 2, background: BRAND, borderRadius: 2, display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND, textTransform: 'uppercase', letterSpacing: '2.5px' }}>
                {c.eyebrow}
              </span>
              <span style={{ width: 24, height: 2, background: BRAND, borderRadius: 2, display: 'inline-block' }} />
            </div>

            {/* heading */}
            <h2 style={{
              margin: '0 0 16px',
            //   fontFamily: '"Syne", Georgia, serif',
              fontWeight: 800,
              fontSize: 'clamp(28px,4vw,52px)',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#0D1117',
              wordBreak: 'break-word',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(20px)',
              transition: 'opacity .65s ease .15s, transform .65s ease .15s',
            }}>
              {c.heading1}{' '}
              <span style={{
                background: `linear-gradient(90deg, ${BRAND} 0%, #FF8A50 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {c.heading2}
              </span>
            </h2>

            {/* sub */}
            <p style={{
              margin: 0,
              fontSize: 'clamp(14px,1.5vw,16.5px)',
              lineHeight: 1.78,
              color: '#64748B',
              maxWidth: 560,
              marginLeft: 'auto',
              marginRight: 'auto',
              wordBreak: 'break-word',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(16px)',
              transition: 'opacity .65s ease .25s, transform .65s ease .25s',
            }}>
              {c.sub}
            </p>
          </div>

          {/* ── Account cards grid ── */}
          <div className="pb-grid">
            {ACCOUNTS.map((acc, i) => (
              <AccountCard
                key={acc.id}
                account={acc}
                lang={language}
                inView={inView}
                delay={i * 80}
                featured={acc.id === 'savings'}
              />
            ))}
          </div>

          {/* ── Trust bar ── */}
          <div className="pb-trust" style={{
            opacity: inView ? 1 : 0,
            transition: 'opacity .6s ease .55s',
          }}>
            {[
              { icon: '🏦', label: c.trusted },
              { icon: '🔒', label: c.fdic },
              { icon: '🛡️', label: c.secure },
            ].map((item, i) => (
              <div key={i} className="pb-trust-item">
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

export default PersonalBanking;