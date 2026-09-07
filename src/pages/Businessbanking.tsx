import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../context/l18n';
import img from "../assets/dollar.png"

const BRAND      = '#FA510F';
const BRAND_DARK = '#D94309';

// ── Service cards data ────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'corp-investment',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: '#60A5FA', glowColor: 'rgba(96,165,250,0.15)',
    en: { title: 'Corporate Investment Account', perks: ['No management fees under $1M', 'Real-time portfolio access', 'Multi-user permissions'] },
    es: { title: 'Cuenta de Inversión Corporativa', perks: ['Sin comisiones bajo $1M', 'Acceso a portafolio en tiempo real', 'Permisos multiusuario'] },
  },
  {
    id: 'institutional-savings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: '#34D399', glowColor: 'rgba(52,211,153,0.15)',
    en: { title: 'Institutional Savings', perks: ['High-yield interest rates', 'No minimum balance', 'SIPC protected'] },
    es: { title: 'Ahorro Institucional', perks: ['Tasas de alto rendimiento', 'Sin saldo mínimo', 'Protegido por SIPC'] },
  },
  {
    id: 'treasury',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#F472B6', glowColor: 'rgba(244,114,182,0.15)',
    en: { title: 'Treasury & Cash Management', perks: ['Automated cash sweeps', 'Short-term money market access', 'Liquidity forecasting tools'] },
    es: { title: 'Gestión de Tesorería', perks: ['Barridos de efectivo automatizados', 'Acceso a mercado monetario', 'Pronóstico de liquidez'] },
  },
  {
    id: 'reporting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: '#A78BFA', glowColor: 'rgba(167,139,250,0.15)',
    en: { title: 'Portfolio Reporting & Analytics', perks: ['Real-time performance dashboards', 'Custom investor reports', 'Tax-lot accounting'] },
    es: { title: 'Análisis de Portafolio', perks: ['Paneles en tiempo real', 'Reportes personalizados', 'Contabilidad fiscal por lote'] },
  },
  {
    id: 'retirement-plans',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: '#FBBF24', glowColor: 'rgba(251,191,36,0.15)',
    en: { title: 'Employee Retirement Plans', perks: ['Company-sponsored retirement plans', 'Automated contribution matching', 'Employee onboarding portal'] },
    es: { title: 'Planes de Jubilación', perks: ['Planes patrocinados por la empresa', 'Igualación automática de aportes', 'Portal de incorporación'] },
  },
  {
    id: 'corp-cards',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M2 10h20M6 15h3M13 15h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: '#FB923C', glowColor: 'rgba(251,146,60,0.15)',
    en: { title: 'Corporate Investment Cards', perks: ['Cashback into investment account', 'Spend tracking by team', 'Employee cards'] },
    es: { title: 'Tarjetas de Inversión Corporativa', perks: ['Cashback a la cuenta de inversión', 'Seguimiento de gastos por equipo', 'Tarjetas para empleados'] },
  },
];

const COPY = {
  en: {
    eyebrow:   'Institutional Investing',
    heading1:  'Investing built for',
    heading2:  'businesses that mean business.',
    sub:       'From startups to enterprises — Crown Ledger gives you the accounts, portfolios, and treasury tools to grow capital with confidence, every day.',
    // cta:       'Open institutional account',
    // cta2:      'Talk to an advisor',
    learn:     'Learn more',
  },
  es: {
    eyebrow:   'Inversión Institucional',
    heading1:  'Inversión construida para',
    heading2:  'empresas que van en serio.',
    sub:       'Desde startups hasta grandes empresas — Crown Ledger te da las cuentas, portafolios y herramientas de tesorería para crecer con confianza, todos los días.',
    cta:       'Abrir cuenta institucional',
    cta2:      'Hablar con un asesor',
    stat1_val: '50K+',   stat1_label: 'Empresas',
    stat2_val: '₦42B+',  stat2_label: 'Capital gestionado',
    stat3_val: '24/7',   stat3_label: 'Soporte',
    learn:     'Saber más',
    img_caption: 'Para empresarios nigerianos',
  },
};

function useInView(threshold = 0.06) {
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

// ── Service card ──────────────────────────────────────────────────────────────
function ServiceCard({ svc, lang, idx }: { svc: typeof SERVICES[0]; lang: string; idx: number }) {
  const [hov, setHov] = useState(false);
  const t = svc[lang as keyof typeof svc] as { title: string; perks: string[] } | undefined ?? svc.en;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.055)',
        border: hov ? `1px solid ${svc.color}55` : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 18,
        padding: '22px 22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        cursor: 'pointer',
        transition: 'all .25s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 16px 40px rgba(0,0,0,0.25), 0 0 0 1px ${svc.color}33` : '0 2px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animationDelay: `${0.08 + idx * 0.07}s`,
      }}
      className={`bb-card bb-card-${idx}`}
    >
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: svc.glowColor,
        border: `1px solid ${svc.color}30`,
        color: svc.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
        transition: 'transform .2s ease',
        transform: hov ? 'scale(1.1)' : 'none',
      }}>
        {svc.icon}
      </div>

      {/* Title */}
      <h3 style={{
        margin: '0 0 10px',
        fontWeight: 700,
        fontSize: 'clamp(14px,1.4vw,16px)',
        color: '#fff',
        lineHeight: 1.25,
        letterSpacing: '-0.2px',
      }}>{t.title}</h3>

      {/* Perks */}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {t.perks.map((p, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              background: svc.glowColor, border: `1px solid ${svc.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke={svc.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', lineHeight: 1.4 }}>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const InstitutionalInvesting: React.FC = () => {
  const { language } = useI18n();
  const c = COPY[language as keyof typeof COPY] ?? COPY.en;
  const { ref: secRef, inView } = useInView();
  const { ref: imgRef, inView: imgIn } = useInView(0.1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes bbFadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bbSlideL  { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
        @keyframes bbFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes bbPulse   {
          0%,100%{transform:scale(.95);box-shadow:0 0 0 0 rgba(250,81,15,.5);}
          70%{transform:scale(1);box-shadow:0 0 0 12px rgba(250,81,15,0);}
        }
        @keyframes bbCardIn  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .bb-root {
          position: relative;
          overflow: hidden;
          font-family: "DM Sans", sans-serif;
          background: linear-gradient(135deg,
            #0A0F1E 0%,
            #0F172A 30%,
            #14102A 60%,
            #0A0F1E 100%
          );
        }

        .bb-blob1 {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(250,81,15,0.14) 0%, transparent 65%);
          top: -200px; right: -150px;
        }
        .bb-blob2 {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%);
          bottom: -120px; left: -100px;
        }
        .bb-blob3 {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%);
          top: 40%; left: 35%;
        }

        .bb-grid-lines {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .bb-inner {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          padding: clamp(64px,9vh,108px) clamp(16px,5vw,60px);
          display: flex;
          flex-direction: column;
          gap: clamp(40px,6vh,64px);
        }

        .bb-img-col { position: relative; }

        .bb-img-frame {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          aspect-ratio: 3/4;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
        }
        .bb-img-frame img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: top center;
          display: block;
          filter: brightness(0.92) contrast(1.04);
          transition: transform 7s ease;
        }
        .bb-img-frame:hover img { transform: scale(1.03); }
        .bb-img-frame::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(0deg, rgba(10,15,30,0.65) 0%, rgba(10,15,30,0.1) 45%, transparent 65%);
          border-radius: 24px;
          z-index: 2;
        }

        .bb-corner-tl {
          position: absolute; top: -14px; left: -14px;
          width: 48px; height: 48px;
          border-top: 3px solid ${BRAND};
          border-left: 3px solid ${BRAND};
          border-radius: 5px 0 0 0; z-index: 3;
        }
        .bb-corner-br {
          position: absolute; bottom: -14px; right: -14px;
          width: 48px; height: 48px;
          border-bottom: 3px solid rgba(250,81,15,0.45);
          border-right: 3px solid rgba(250,81,15,0.45);
          border-radius: 0 0 5px 0; z-index: 3;
        }

        .bb-badge {
          position: absolute;
          top: 22px; right: -24px;
          z-index: 5;
          background: rgba(10,15,30,0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.35);
          min-width: 160px;
          animation: bbFloat 4.5s ease-in-out infinite;
        }

        .bb-img-caption {
          position: absolute; bottom: 0; left: 0; right: 0;
          z-index: 3; padding: 20px 22px;
          display: flex; align-items: center; gap: 8px;
        }

        .bb-stats {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
          margin-top: 18px;
        }
        .bb-stat {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 12px;
          text-align: center;
          transition: background .2s;
        }
        .bb-stat:hover { background: rgba(255,255,255,0.08); }

        .bb-top-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(36px,5vw,72px);
          align-items: center;
        }

        .bb-text-col { display: flex; flex-direction: column; }

        .bb-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px,1.8vw,20px);
        }

        .bb-card { animation: bbCardIn .55s ease both; }
        .bb-card-0{animation-delay:.05s} .bb-card-1{animation-delay:.12s}
        .bb-card-2{animation-delay:.19s} .bb-card-3{animation-delay:.26s}
        .bb-card-4{animation-delay:.33s} .bb-card-5{animation-delay:.40s}

        .bb-cta-row {
          display: flex; gap: 12px; flex-wrap: wrap;
          margin-top: 28px;
        }

        .bb-cta-p {
          display:inline-flex; align-items:center; gap:8px;
          background:${BRAND}; color:#fff;
          border:none; border-radius:12px;
          padding:13px 24px; font-size:14px; font-weight:700;
          cursor:pointer; font-family:"DM Sans",sans-serif;
          box-shadow:0 6px 22px rgba(250,81,15,0.32);
          transition:all .2s ease; white-space:nowrap;
        }
        .bb-cta-p:hover { background:${BRAND_DARK}; transform:translateY(-2px); box-shadow:0 10px 28px rgba(250,81,15,0.45); }
        .bb-cta-p:active { transform:translateY(0); }

        .bb-cta-s {
          display:inline-flex; align-items:center; gap:7px;
          background:rgba(255,255,255,0.07); color:#fff;
          border:1px solid rgba(255,255,255,0.2); border-radius:12px;
          padding:13px 22px; font-size:14px; font-weight:600;
          cursor:pointer; font-family:"DM Sans",sans-serif;
          backdrop-filter:blur(8px);
          transition:all .2s ease; white-space:nowrap;
        }
        .bb-cta-s:hover { background:rgba(255,255,255,0.13); border-color:rgba(255,255,255,0.4); transform:translateY(-2px); }
        .bb-cta-s:active { transform:translateY(0); }

        @media (max-width: 900px) {
          .bb-inner { padding: clamp(44px,6vh,68px) clamp(14px,4vw,28px); gap: 32px; }
          .bb-top-row { grid-template-columns: 1fr; gap: 28px; }
          .bb-img-frame { aspect-ratio: 16/9; }
          .bb-badge { top: 14px; right: -8px; min-width: 140px; }
          .bb-corner-tl { top:-10px; left:-10px; width:36px; height:36px; }
          .bb-corner-br { bottom:-10px; right:-10px; width:36px; height:36px; }
          .bb-cards-grid { grid-template-columns: repeat(2,1fr); }
        }

        @media (max-width: 560px) {
          .bb-cards-grid { grid-template-columns: 1fr; gap: 10px; }
          .bb-badge { display: none; }
          .bb-stats { gap: 8px; }
        }
      `}</style>

      <section className="bb-root">
        <div className="bb-blob1" />
        <div className="bb-blob2" />
        <div className="bb-blob3" />
        <div className="bb-grid-lines" />

        <div className="bb-inner" ref={secRef}>

          <div className="bb-top-row">

          <div
            className="bb-img-col"
            ref={imgRef}
            style={{
              opacity: imgIn ? 1 : 0,
              transform: imgIn ? 'none' : 'translateX(-28px)',
              transition: 'opacity .85s ease .1s, transform .85s cubic-bezier(.22,1,.36,1) .1s',
            }}
          >
            <div className="bb-corner-tl" />
            <div className="bb-corner-br" />

            <div className="bb-img-frame">
              <img
                src={img}
                style={{objectFit: "cover"}}
                alt="Institutional investing professional"
                loading="lazy"
              />
            </div>
          </div>

          <div className="bb-text-col">

            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18,
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(14px)',
              transition: 'opacity .55s ease .15s, transform .55s ease .15s',
            }}>
              <span style={{ width: 24, height: 2, background: BRAND, borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND, textTransform: 'uppercase', letterSpacing: '2.4px' }}>{c.eyebrow}</span>
            </div>

            <h2 style={{
              margin: '0 0 18px',
              fontSize: 'clamp(26px,3.6vw,48px)',
              lineHeight: 1.08, letterSpacing: '-0.03em',
              color: '#fff', wordBreak: 'break-word',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(20px)',
              transition: 'opacity .65s ease .25s, transform .65s ease .25s',
            }}>
              {c.heading1}<br />
              <span style={{ background: `linear-gradient(90deg,${BRAND} 0%,#FF8A50 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {c.heading2}
              </span>
            </h2>

            <p style={{
              margin: '0 0 4px',
              fontSize: 'clamp(13px,1.35vw,15.5px)', lineHeight: 1.8,
              color: 'rgba(255,255,255,0.52)',
              wordBreak: 'break-word', overflowWrap: 'break-word',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(16px)',
              transition: 'opacity .65s ease .35s, transform .65s ease .35s',
            }}>{c.sub}</p>

            <div
              className="bb-cta-row"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(14px)',
                transition: 'opacity .6s ease .82s, transform .6s ease .82s',
              }}
            >
              {/* <button className="bb-cta-p">
                {c.cta}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button> */}
              {/* <button className="bb-cta-s">
                {c.cta2}
              </button> */}
            </div>

          </div>
          </div>

          <div
            className="bb-cards-grid"
            style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity .5s ease .42s',
            }}
          >
            {SERVICES.map((svc, idx) => (
              <ServiceCard key={svc.id} svc={svc} lang={language} idx={idx} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default InstitutionalInvesting;