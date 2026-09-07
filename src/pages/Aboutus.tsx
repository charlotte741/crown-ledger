/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/l18n';

const BRAND      = '#FA510F';
const BRAND_DARK = '#D94309';
const BRAND_GLOW = 'rgba(250,81,15,0.18)';

// ── useInView hook ────────────────────────────────────────────────────────────
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

// ── Counter animation ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 1800 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Why-choose-us card data ───────────────────────────────────────────────────
const WHY_CARDS = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    en: {
      title: 'Fully Regulated & Compliant',
      body: 'Fully licensed and operating under internationally recognised financial governance frameworks. Your capital is safeguarded at every level — from deposit to withdrawal.',
    },
    es: {
      title: 'Totalmente Regulado y Cumplidor',
      body: 'Totalmente licenciado y operando bajo marcos de gobernanza financiera reconocidos internacionalmente. Su capital está protegido en cada nivel — desde el depósito hasta el retiro.',
    },
    accent: '#60A5FA',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    en: {
      title: 'Daily & Instant Payouts',
      body: 'No waiting weeks to access your returns. Crown Ledger processes withdrawals daily, putting your earnings back in your hands the moment you need them.',
    },
    es: {
      title: 'Pagos Diarios e Instantáneos',
      body: 'Sin esperar semanas para acceder a sus rendimientos. Crown Ledger procesa retiros diariamente, poniendo sus ganancias en sus manos cuando las necesite.',
    },
    accent: '#34D399',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M7 5h.01M7 12h.01M7 19h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    ),
    en: {
      title: 'Diversified Portfolio Engine',
      body: 'From equities and real estate to commodities and technology, your funds are spread across asset classes that move independently — minimising volatility, maximising resilience.',
    },
    es: {
      title: 'Motor de Portafolio Diversificado',
      body: 'Desde acciones e inmuebles hasta materias primas y tecnología, sus fondos se distribuyen entre clases de activos que se mueven de forma independiente.',
    },
    accent: '#FBBF24',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    en: {
      title: 'Dedicated Wealth Advisors',
      body: 'Every investor is paired with a certified financial advisor. From onboarding to maturity, a real human champions your growth every step of the way.',
    },
    es: {
      title: 'Asesores de Patrimonio Dedicados',
      body: 'Cada inversor tiene un asesor financiero certificado. Desde el registro hasta la madurez, un ser humano real impulsa su crecimiento en cada paso.',
    },
    accent: '#F472B6',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 20V10M18 20V4M6 20v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    en: {
      title: 'Transparent Performance Reports',
      body: 'Real-time dashboards and quarterly audit reports keep you fully informed. No hidden fees, no opaque structures — just clear numbers you can trust.',
    },
    es: {
      title: 'Informes de Rendimiento Transparentes',
      body: 'Paneles en tiempo real e informes de auditoría trimestrales lo mantienen completamente informado. Sin tarifas ocultas ni estructuras opacas.',
    },
    accent: '#A78BFA',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M2 12h4M18 12h4M12 2v4M12 18v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    en: {
      title: 'Global Market Access',
      body: 'Unlock exposure to international markets from anywhere in the world. Crown Ledger bridges your capital with global opportunities — all in one seamless platform.',
    },
    es: {
      title: 'Acceso a Mercados Globales',
      body: 'Accede a mercados internacionales desde cualquier parte del mundo. Crown Ledger conecta su capital con oportunidades globales — todo en una plataforma perfecta.',
    },
    accent: '#4ADE80',
  },
];

const STATS = [
  { value: 12400, suffix: '+',  en: 'Active Investors',          es: 'Inversores Activos' },
  { value: 98,    suffix: '%',  en: 'Satisfaction Rate',         es: 'Tasa de Satisfacción' },
  { value: 4,     suffix: 'B+', en: 'Dollars Under Management',  es: 'Dólares en Gestión' },
  { value: 7,     suffix: '+',  en: 'Years of Excellence',       es: 'Años de Excelencia' },
];

// ── Main Component ────────────────────────────────────────────────────────────
const AboutUs: React.FC = () => {
  const { language } = useI18n();
  const navigate = useNavigate();
  const lang = language as 'en' | 'es';

  const hero  = useInView(0.06);
  const vm    = useInView(0.06);
  const stats = useInView(0.06);
  const why   = useInView(0.06);

  return (
    <>
      <style>{`
        

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ab-root {
          font-family: 'DM Sans', sans-serif;
          background: #06090F;
          color: #E2E8F0;
          overflow: hidden;
          position: relative;
        }

        .ab-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 clamp(16px, 5vw, 64px);
        }

        /* ── HERO ── */
        .ab-hero {
          position: relative;
          padding: clamp(64px, 10vh, 120px) 0 clamp(48px, 8vh, 96px);
          overflow: hidden;
        }
        .ab-hero-ghost {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(60px, 16vw, 200px);
          color: rgba(255,255,255,0.025);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          letter-spacing: 0.04em;
          z-index: 0;
        }
        .ab-hero-bar {
          position: absolute;
          top: 0; right: -40px;
          width: clamp(180px, 28vw, 420px);
          height: 100%;
          background: linear-gradient(170deg, ${BRAND_GLOW} 0%, transparent 65%);
          border-left: 1px solid rgba(250,81,15,0.15);
          z-index: 0;
          clip-path: polygon(18% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
        .ab-hero-content { position: relative; z-index: 1; }

        .ab-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 3px;
          color: ${BRAND}; margin-bottom: 22px;
        }
        .ab-eyebrow-line { width: 32px; height: 1px; background: ${BRAND}; }

        .ab-hero-heading {
        //   font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 700;
          font-size: clamp(34px, 6vw, 80px);
          line-height: 1.04;
          letter-spacing: -0.02em;
          color: #F8FAFC;
          max-width: 700px;
          margin-bottom: 22px;
          word-break: break-word;
        }
        .ab-hero-heading em { font-style: italic; color: ${BRAND}; }

        .ab-hero-sub {
          font-size: clamp(13px, 1.45vw, 16.5px);
          line-height: 1.85;
          color: #94A3B8;
          max-width: 540px;
          word-break: break-word;
        }

        .ab-divider {
          display: flex; align-items: center; gap: 14px;
          margin: clamp(36px, 6vh, 72px) 0;
        }
        .ab-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, rgba(250,81,15,0.4) 0%, rgba(255,255,255,0.06) 100%);
        }
        .ab-divider-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${BRAND}; flex-shrink: 0;
          box-shadow: 0 0 10px ${BRAND};
        }

        /* ── VISION & MISSION ── */
        .ab-vm-section {
          padding: clamp(48px, 8vh, 96px) 0;
          position: relative;
        }
        .ab-vm-section::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none; z-index: 0;
        }
        .ab-vm-grid {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(16px, 2.5vw, 40px);
        }
        .ab-vm-card {
          background: #0D1117;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: clamp(24px, 3.5vw, 46px);
          position: relative; overflow: hidden;
          transition: border-color .3s ease, transform .3s ease;
        }
        .ab-vm-card:hover { border-color: rgba(250,81,15,0.35); transform: translateY(-3px); }
        .ab-vm-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, ${BRAND}, transparent);
          border-radius: 20px 20px 0 0;
        }
        .ab-vm-num {
          position: absolute; bottom: -10px; right: 16px;
          font-family: 'Bebas Neue', sans-serif; font-size: 100px;
          color: rgba(255,255,255,0.03); line-height: 1;
          pointer-events: none; user-select: none;
        }
        .ab-vm-icon {
          width: 48px; height: 48px;
          background: ${BRAND_GLOW}; border: 1px solid rgba(250,81,15,0.25);
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          color: ${BRAND}; margin-bottom: 20px;
        }
        .ab-vm-title {
        //   font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(20px, 2.6vw, 30px); font-weight: 700;
          color: #F8FAFC; margin-bottom: 12px; letter-spacing: -0.02em;
        }
        .ab-vm-body {
          font-size: clamp(13px, 1.3vw, 15px);
          line-height: 1.85; color: #94A3B8;
          word-break: break-word;
        }

        /* ── STATS STRIP ── */
        .ab-stats {
          padding: clamp(40px, 7vh, 76px) 0;
          background: #0A0D14;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ab-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(12px, 2vw, 28px);
        }
        .ab-stat-item {
          text-align: center;
          padding: clamp(16px, 2.5vw, 30px) 10px;
          position: relative;
        }
        .ab-stat-item + .ab-stat-item::before {
          content: ''; position: absolute;
          left: 0; top: 20%; height: 60%; width: 1px;
          background: rgba(255,255,255,0.07);
        }
        .ab-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(34px, 5vw, 62px);
          line-height: 1; color: ${BRAND};
          display: block; letter-spacing: 0.02em;
        }
        .ab-stat-label {
          font-size: clamp(9px, 1vw, 11.5px); font-weight: 600;
          text-transform: uppercase; letter-spacing: 2px;
          color: #64748B; margin-top: 6px; display: block;
        }

        /* ── WHY CHOOSE US ── */
        .ab-why {
          padding: clamp(56px, 9vh, 104px) 0;
          position: relative; overflow: hidden;
        }
        .ab-why::before {
          content: '';
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(250,81,15,0.055) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }
        .ab-why-header {
          position: relative; z-index: 1;
          text-align: center;
          margin-bottom: clamp(36px, 5vh, 64px);
        }
        .ab-section-label {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 3px;
          color: ${BRAND}; margin-bottom: 14px;
        }
        .ab-why-heading {
        //   font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(28px, 4.5vw, 54px); font-weight: 700;
          color: #F8FAFC; line-height: 1.08; letter-spacing: -0.02em;
          max-width: 600px; margin: 0 auto 14px;
          word-break: break-word;
        }
        .ab-why-heading em { font-style: italic; color: ${BRAND}; }
        .ab-why-sub {
          font-size: clamp(12.5px, 1.3vw, 15px); color: #64748B;
          line-height: 1.75; max-width: 480px; margin: 0 auto;
          word-break: break-word;
        }
        .ab-why-grid {
          position: relative; z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(12px, 1.8vw, 22px);
        }
        .ab-why-card {
          background: #0D1117;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: clamp(20px, 2.8vw, 32px);
          position: relative; overflow: hidden;
          transition: border-color .3s ease, transform .3s ease, box-shadow .3s ease;
          cursor: default;
        }
        .ab-why-card:hover { transform: translateY(-5px); box-shadow: 0 24px 60px rgba(0,0,0,0.4); }
        .ab-why-card:hover .ab-wc-icon-wrap { transform: scale(1.08); }
        .ab-why-card::after {
          content: ''; position: absolute; inset: 0; border-radius: 18px;
          opacity: 0; transition: opacity .3s ease;
          background: radial-gradient(circle at 30% 30%, var(--card-accent-glow, rgba(250,81,15,0.08)) 0%, transparent 65%);
        }
        .ab-why-card:hover::after { opacity: 1; }
        .ab-wc-icon-wrap {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; transition: transform .25s ease; flex-shrink: 0;
        }
        .ab-wc-title {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px, 1.3vw, 15.5px); font-weight: 700;
          color: #F1F5F9; margin-bottom: 9px;
          letter-spacing: -0.01em; line-height: 1.3;
          word-break: break-word;
        }
        .ab-wc-body {
          font-size: clamp(12px, 1.1vw, 13.5px);
          color: #64748B; line-height: 1.75;
          word-break: break-word;
        }

        /* ── CTA STRIP ── */
        .ab-cta-strip {
          background: linear-gradient(135deg, #0F1520 0%, #0A0D14 100%);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: clamp(48px, 8vh, 86px) 0;
          text-align: center; position: relative; overflow: hidden;
        }
        .ab-cta-strip::before {
          content: '';
          position: absolute; bottom: -120px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 300px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(250,81,15,0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .ab-cta-heading {
        //   font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(24px, 3.8vw, 48px); font-weight: 700;
          color: #F8FAFC; margin-bottom: 12px;
          letter-spacing: -0.02em; position: relative; z-index: 1;
          word-break: break-word;
        }
        .ab-cta-heading em { font-style: italic; color: ${BRAND}; }
        .ab-cta-sub {
          font-size: clamp(12.5px, 1.35vw, 15.5px); color: #64748B;
          margin-bottom: 32px; position: relative; z-index: 1;
        }
        .ab-cta-btn {
          display: inline-flex; align-items: center; gap: 9px;
          background: ${BRAND}; color: #fff; border: none;
          border-radius: 12px; padding: 14px 30px;
          font-size: 14px; font-weight: 700; font-family: 'DM Sans', sans-serif;
          cursor: pointer; box-shadow: 0 6px 28px rgba(250,81,15,0.38);
          transition: all .22s ease; position: relative; z-index: 1;
          letter-spacing: 0.01em;
        }
        .ab-cta-btn:hover { background: ${BRAND_DARK}; transform: translateY(-2px); box-shadow: 0 10px 36px rgba(250,81,15,0.45); }

        /* ── ANIMATION UTILITIES ── */
        .ab-fade { transition: opacity .75s ease, transform .75s ease; }
        .ab-fade-hidden  { opacity: 0; transform: translateY(28px); }
        .ab-fade-visible { opacity: 1; transform: translateY(0); }
        .ab-fade-card { transition: opacity .65s ease, transform .65s ease; }
        .ab-fade-card-hidden  { opacity: 0; transform: translateY(32px); }
        .ab-fade-card-visible { opacity: 1; transform: translateY(0); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .ab-vm-grid    { grid-template-columns: 1fr; }
          .ab-why-grid   { grid-template-columns: repeat(2, 1fr); }
          .ab-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ab-stat-item + .ab-stat-item::before { display: none; }
          .ab-stat-item { border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; }
        }
        @media (max-width: 560px) {
          .ab-why-grid { grid-template-columns: 1fr; }
          .ab-hero-bar { display: none; }
          .ab-vm-card  { padding: 22px 18px; }
          .ab-why-card { padding: 20px 16px; }
        }
        @media (max-width: 360px) {
          .ab-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ab-root">

        {/* ══ HERO ══ */}
        <section className="ab-hero">
          <div className="ab-hero-ghost">CROWN LEDGER</div>
          <div className="ab-hero-bar" />
          <div className="ab-inner">
            <div className="ab-hero-content" ref={hero.ref}>

              <div
                className={`ab-fade ${hero.inView ? 'ab-fade-visible' : 'ab-fade-hidden'}`}
                style={{ transitionDelay: '0ms' }}
              >
                <div className="ab-eyebrow">
                  <span className="ab-eyebrow-line" />
                  {lang === 'es' ? 'Acerca de Crown Ledger' : 'About Crown Ledger'}
                </div>
              </div>

              <h1
                className={`ab-hero-heading ab-fade ${hero.inView ? 'ab-fade-visible' : 'ab-fade-hidden'}`}
                style={{ transitionDelay: '80ms' }}
              >
                {lang === 'es'
                  ? <>Donde tu patrimonio<br /><em>encuentra su propósito.</em></>
                  : <>Where your wealth<br /><em>finds its purpose.</em></>
                }
              </h1>

              <p
                className={`ab-hero-sub ab-fade ${hero.inView ? 'ab-fade-visible' : 'ab-fade-hidden'}`}
                style={{ transitionDelay: '160ms' }}
              >
                {lang === 'es'
                  ? 'Crown Ledger es una plataforma digital de inversión de clase mundial — construida para democratizar el acceso a instrumentos financieros de élite, empoderar a inversores de todo el mundo y canalizar capital hacia los sectores que más importan.'
                  : "Crown Ledger is a world-class digital investment platform — built to democratise access to elite financial instruments, empower investors globally, and channel capital into the sectors that matter most."
                }
              </p>

              <div
                className={`ab-divider ab-fade ${hero.inView ? 'ab-fade-visible' : 'ab-fade-hidden'}`}
                style={{ transitionDelay: '240ms', maxWidth: 560 }}
              >
                <div className="ab-divider-line" />
                <div className="ab-divider-dot" />
              </div>

            </div>
          </div>
        </section>

        {/* ══ VISION & MISSION ══ */}
        <section className="ab-vm-section">
          <div className="ab-inner">
            <div ref={vm.ref} className="ab-vm-grid">

              {/* Vision */}
              <div
                className={`ab-vm-card ab-fade-card ${vm.inView ? 'ab-fade-card-visible' : 'ab-fade-card-hidden'}`}
                style={{ transitionDelay: '0ms' }}
              >
                <span className="ab-vm-num">01</span>
                <div className="ab-vm-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </div>
                <h3 className="ab-vm-title">{lang === 'es' ? 'Nuestra Visión' : 'Our Vision'}</h3>
                <p className="ab-vm-body">
                  {lang === 'es'
                    ? 'Convertirnos en la plataforma de inversión más confiable del mundo — donde cada individuo, independientemente de su origen o nivel de ingresos, tenga acceso a las mismas herramientas de construcción de riqueza. Imaginamos un mundo donde la libertad financiera no es un privilegio, sino un derecho.'
                    : "To become the world's most trusted investment platform — where every individual, regardless of background or income bracket, has access to the same wealth-building tools once reserved for the elite. We envision a world where financial freedom is not a privilege, but a right."
                  }
                </p>
              </div>

              {/* Mission */}
              <div
                className={`ab-vm-card ab-fade-card ${vm.inView ? 'ab-fade-card-visible' : 'ab-fade-card-hidden'}`}
                style={{ transitionDelay: '120ms' }}
              >
                <span className="ab-vm-num">02</span>
                <div className="ab-vm-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <line x1="12" y1="2" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="ab-vm-title">{lang === 'es' ? 'Nuestra Misión' : 'Our Mission'}</h3>
                <p className="ab-vm-body">
                  {lang === 'es'
                    ? 'Ofrecer rendimientos de inversión consistentes, transparentes y regulados en clases de activos diversificados — empoderando a inversores de todo el mundo para crecer con confianza. A través de la tecnología, la integridad y la gestión experta de fondos, hacemos que cada dólar trabaje más duro, de manera más inteligente y con propósito.'
                    : "To deliver consistent, transparent, and regulated investment returns across diversified asset classes — empowering investors worldwide to grow wealth with confidence. Through technology, integrity, and expert fund management, we make every dollar work harder, smarter, and with purpose."
                  }
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ══ STATS STRIP ══ */}
        <section className="ab-stats">
          <div className="ab-inner">
            <div ref={stats.ref} className="ab-stats-grid">
              {STATS.map((s, i) => (
                <div
                  key={i}
                  className={`ab-stat-item ab-fade ${stats.inView ? 'ab-fade-visible' : 'ab-fade-hidden'}`}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <span className="ab-stat-num">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </span>
                  <span className="ab-stat-label">{s[lang] ?? s.en}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ WHY CHOOSE US ══ */}
        <section className="ab-why">
          <div className="ab-inner">
            <div
              ref={why.ref}
              className={`ab-why-header ab-fade ${why.inView ? 'ab-fade-visible' : 'ab-fade-hidden'}`}
              style={{ transitionDelay: '0ms' }}
            >
              <div className="ab-section-label">
                <span style={{ width: 28, height: 1, background: BRAND, display: 'inline-block' }} />
                {lang === 'es' ? 'Por Qué Elegirnos' : 'Why Choose Us'}
              </div>
              <h2 className="ab-why-heading">
                {lang === 'es'
                  ? <>Seis razones por las que los inversores<br /><em>confían en Crown Ledger.</em></>
                  : <>Six reasons investors<br /><em>trust Crown Ledger.</em></>
                }
              </h2>
              <p className="ab-why-sub">
                {lang === 'es'
                  ? 'Construimos Crown Ledger sobre cuatro pilares — transparencia, regulación, rendimiento y cuidado. Esto es lo que nos diferencia.'
                  : "We built Crown Ledger on four pillars — transparency, regulation, performance, and care. Here's what sets us apart."
                }
              </p>
            </div>

            <div className="ab-why-grid">
              {WHY_CARDS.map((card, i) => (
                <div
                  key={i}
                  className={`ab-why-card ab-fade-card ${why.inView ? 'ab-fade-card-visible' : 'ab-fade-card-hidden'}`}
                  style={{
                    transitionDelay: `${80 + i * 75}ms`,
                    ['--card-accent-glow' as any]: card.accent + '18',
                  }}
                >
                  <div
                    className="ab-wc-icon-wrap"
                    style={{ background: card.accent + '18', border: `1px solid ${card.accent}30`, color: card.accent }}
                  >
                    {card.icon}
                  </div>
                  <h4 className="ab-wc-title">{card[lang]?.title ?? card.en.title}</h4>
                  <p className="ab-wc-body">{card[lang]?.body ?? card.en.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA STRIP ══ */}
        <section className="ab-cta-strip">
          <div className="ab-inner">
            <h2 className="ab-cta-heading">
              {lang === 'es'
                ? <>¿Listo para crecer con <em>Crown Ledger?</em></>
                : <>Ready to grow with <em>Crown Ledger?</em></>
              }
            </h2>
            <p className="ab-cta-sub">
              {lang === 'es'
                ? 'Únete a más de 12,000 inversores que ya están construyendo riqueza generacional en nuestra plataforma.'
                : 'Join over 12,000 investors already building generational wealth on our platform.'
              }
            </p>
            <button className="ab-cta-btn" onClick={() => navigate('/open-Account')}>
              {lang === 'es' ? 'Comenzar a Invertir Hoy' : 'Start Investing Today'}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

      </div>
    </>
  );
};

export default AboutUs;