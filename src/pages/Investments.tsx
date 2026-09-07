/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useI18n } from './i18n';
import { useI18n } from '../context/l18n';

const BRAND      = '#FA510F';
const BRAND_DARK = '#D94309';

// ── Investment plans ──────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'premium',
    badge: 'Starter',
    bg: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=85&fit=crop',
    accentColor: '#60A5FA',
    gradFrom: '#1E3A5F',
    gradTo: '#0F172A',
    en: {
      name: 'Premium Plan',
      tagline: 'Perfect for beginners looking to start their investment journey with minimal risk.',
      min: '$100', max: '$2,999', rate: '5.00%', duration: '4 Days',
      minFull: '$100.00', maxFull: '$2,999.00',
      features: ['Guaranteed returns', 'Low entry barrier', 'Daily compounding', 'Instant withdrawal'],
    },
    es: {
      name: 'Plan Premium',
      tagline: 'Perfecto para principiantes que buscan comenzar su inversión con riesgo mínimo.',
      min: '$100', max: '$2,999', rate: '5.00%', duration: '4 Días',
      minFull: '$100.00', maxFull: '$2,999.00',
      features: ['Rendimientos garantizados', 'Baja barrera de entrada', 'Capitalización diaria', 'Retiro instantáneo'],
    },
  },
  {
    id: 'exclusive',
    badge: 'Popular',
    bg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85&fit=crop',
    accentColor: '#34D399',
    gradFrom: '#064E3B',
    gradTo: '#0F172A',
    en: {
      name: 'Exclusive Plan',
      tagline: 'Moderate returns with balanced risk. Ideal for building wealth steadily over a quarter.',
      min: '$3,000', max: '$8,999', rate: '8.00%', duration: '7 Days',
      minFull: '$3,000.00', maxFull: '$8,999.00',
      features: ['Higher yield returns', 'Weekly compounding', 'Portfolio dashboard', 'Priority support'],
    },
    es: {
      name: 'Plan Exclusivo',
      tagline: 'Rendimientos moderados con riesgo equilibrado. Ideal para construir riqueza.',
      min: '$3,000', max: '$8,999', rate: '8.00%', duration: '7 Días',
      minFull: '$3,000.00', maxFull: '$8,999.00',
      features: ['Rendimientos más altos', 'Capitalización semanal', 'Panel de portafolio', 'Soporte prioritario'],
    },
  },
  {
    id: 'supreme',
    badge: 'Premium',
    bg: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=900&q=85&fit=crop&crop=center',
    accentColor: '#F472B6',
    gradFrom: '#4A1942',
    gradTo: '#0F172A',
    en: {
      name: 'Supreme Plan',
      tagline: 'Premium investment offering excellent returns for serious investors over 10 days.',
      min: '$9,000', max: '$19,999', rate: '11.00%', duration: '10 Days',
      minFull: '$9,000.00', maxFull: '$19,999.00',
      features: ['Expert fund management', 'Real estate allocation', 'Bi-weekly compounding', 'VIP concierge'],
    },
    es: {
      name: 'Plan Supremo',
      tagline: 'Inversión premium con excelentes rendimientos para inversores serios en 10 días.',
      min: '$9,000', max: '$19,999', rate: '11.00%', duration: '10 Días',
      minFull: '$9,000.00', maxFull: '$19,999.00',
      features: ['Gestión experta de fondos', 'Asignación inmobiliaria', 'Capitalización quincenal', 'Conserjería VIP'],
    },
  },
  {
    id: 'platinum',
    badge: 'Elite',
    bg: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=85&fit=crop',
    accentColor: '#FBBF24',
    gradFrom: '#451A03',
    gradTo: '#0F172A',
    en: {
      name: 'Platinum Plan',
      tagline: 'Exclusive annual plan with maximum returns for high-net-worth individuals.',
      min: '$20,000', max: 'Unlimited', rate: '15.00%', duration: '30 Days',
      minFull: '$20,000.00', maxFull: '$99,999,999.00',
      features: ['Maximum yield returns', 'Private wealth manager', 'Global market access', 'White-glove service'],
    },
    es: {
      name: 'Plan Platino',
      tagline: 'Plan exclusivo con máximos rendimientos para personas de alto patrimonio neto.',
      min: '$20,000', max: 'Ilimitado', rate: '15.00%', duration: '30 Días',
      minFull: '$20,000.00', maxFull: '$99,999,999.00',
      features: ['Rendimiento máximo', 'Gestor de patrimonio privado', 'Acceso a mercados globales', 'Servicio personalizado'],
    },
  },
  {
    id: 'realestate',
    badge: 'Real Estate',
    bg: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=900&q=85&fit=crop',
    accentColor: '#A78BFA',
    gradFrom: '#2E1065',
    gradTo: '#0F172A',
    en: {
      name: 'Real Estate Fund',
      tagline: 'Invest in curated Nigerian real estate assets and earn steady rental yields.',
      min: '$5,000', max: '$49,999', rate: '9.50%', duration: '30 Days',
      minFull: '$5,000.00', maxFull: '$49,999.00',
      features: ['Diversified property portfolio', 'Rental income distributions', 'Property appreciation', 'Quarterly statements'],
    },
    es: {
      name: 'Fondo Inmobiliario',
      tagline: 'Invierte en activos inmobiliarios nigerianos seleccionados y gana rendimientos estables.',
      min: '$5,000', max: '$49,999', rate: '9.50%', duration: '30 Días',
      minFull: '$5,000.00', maxFull: '$49,999.00',
      features: ['Portafolio de propiedades diversificado', 'Distribución de ingresos por alquiler', 'Apreciación de propiedades', 'Informes trimestrales'],
    },
  },
  {
    id: 'agri',
    badge: 'Agriculture',
    bg: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=85&fit=crop',
    accentColor: '#4ADE80',
    gradFrom: '#14532D',
    gradTo: '#0F172A',
    en: {
      name: 'AgriYield Fund',
      tagline: 'Back Nigerian farmers and agribusinesses. Earn returns while funding food security.',
      min: '$500', max: '$9,999', rate: '7.00%', duration: '14 Days',
      minFull: '$500.00', maxFull: '$9,999.00',
      features: ['Impact-driven returns', 'Seasonal harvest cycles', 'Crop insurance cover', 'ESG certified'],
    },
    es: {
      name: 'Fondo AgroRendimiento',
      tagline: 'Apoya a agricultores y agronegocios nigerianos mientras generas rendimientos.',
      min: '$500', max: '$9,999', rate: '7.00%', duration: '14 Días',
      minFull: '$500.00', maxFull: '$9,999.00',
      features: ['Rendimientos con impacto social', 'Ciclos de cosecha estacional', 'Seguro de cultivos', 'Certificado ESG'],
    },
  },
];

const COPY = {
  en: {
    eyebrow:  'Investment Plans',
    heading1: 'Grow your wealth.',
    heading2: 'On your terms.',
    sub:      'Choose from six carefully curated investment plans — from beginner-friendly entry points to elite wealth management strategies. Every dollar you invest works harder with Crown Ledger.',
    cta:      'Invest now',
    prev:     'Previous',
    next:     'Next',
    of:       'of',
    min_label: 'Minimum',
    max_label: 'Maximum',
    rate_label: 'Interest Rate',
    dur_label: 'Duration',
    features_label: 'What you get',
    trust1: 'SEC Regulated',
    trust2: 'Capital protected',
    trust3: 'Daily payouts',
  },
  es: {
    eyebrow:  'Planes de Inversión',
    heading1: 'Haz crecer tu patrimonio.',
    heading2: 'En tus términos.',
    sub:      'Elige entre seis planes de inversión — desde puntos de entrada para principiantes hasta estrategias de gestión de patrimonio elite.',
    cta:      'Invertir ahora',
    prev:     'Anterior',
    next:     'Siguiente',
    of:       'de',
    min_label: 'Mínimo',
    max_label: 'Máximo',
    rate_label: 'Tasa de Interés',
    dur_label: 'Duración',
    features_label: 'Qué incluye',
    trust1: 'Regulado SEC',
    trust2: 'Capital protegido',
    trust3: 'Pagos diarios',
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

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({
  plan, lang, active, idx, total, onPrev, onNext, onInvest,
}: {
  plan: typeof PLANS[0]; lang: string; active: boolean;
  idx: number; total: number;
  onPrev: () => void; onNext: () => void;
  onInvest: () => void;
}) {
  const t = plan[lang as keyof typeof plan] as typeof plan.en ?? plan.en;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className={`inv-card${active ? ' inv-card-active' : ''}`}
      style={{ '--accent': plan.accentColor, '--grad-from': plan.gradFrom } as React.CSSProperties}
    >
      {/* Background image */}
      <img
        src={plan.bg}
        alt={t.name}
        className={`inv-card-bg${imgLoaded ? ' loaded' : ''}`}
        onLoad={() => setImgLoaded(true)}
        loading="lazy"
      />
      {/* Gradient overlay */}
      <div className="inv-card-overlay" />

      {/* Shimmer highlight */}
      {active && <div className="inv-card-shimmer" />}

      {/* Content */}
      <div className="inv-card-body">

        {/* Top: badge + rate bubble */}
        <div className="inv-card-top">
          <span className="inv-badge">{plan.badge}</span>
          <div className="inv-rate-bubble">
            <span className="inv-rate-num">{t.rate}</span>
            <span className="inv-rate-label">APY</span>
          </div>
        </div>

        {/* Name + tagline */}
        <div className="inv-card-mid">
          <h3 className="inv-plan-name">{t.name}</h3>
          <p className="inv-plan-tagline">{t.tagline}</p>
        </div>

        {/* Stats grid */}
        <div className="inv-stats-grid">
          {[
            { label: 'MIN', val: t.min },
            { label: 'MAX', val: t.max },
            { label: 'DAYS', val: t.duration.split(' ')[0] },
          ].map((s) => (
            <div key={s.label} className="inv-stat-box">
              <div className="inv-stat-val">{s.val}</div>
              <div className="inv-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <ul className="inv-features">
          {t.features.map((f, i) => (
            <li key={i} className="inv-feature">
              <span className="inv-check">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA + nav */}
        <div className="inv-card-foot">
          <button className="inv-invest-btn" onClick={onInvest}>
            {lang === 'es' ? 'Invertir ahora' : 'Invest now'}
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="inv-nav-pills">
            <button className="inv-nav-btn" onClick={onPrev} aria-label="Previous">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="inv-counter">{idx + 1}/{total}</span>
            <button className="inv-nav-btn" onClick={onNext} aria-label="Next">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const Investments: React.FC = () => {
  const { language } = useI18n();
  const navigate = useNavigate();
  const c = COPY[language as keyof typeof COPY] ?? COPY.en;
  const [active, setActive] = useState(0);
  const [, setDir] = useState<'left'|'right'>('right');
  const [animating, setAnimating] = useState(false);
  const { ref, inView } = useInView();

  const go = useCallback((next: number, direction: 'left'|'right') => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setActive(next);
      setAnimating(false);
    }, 420);
  }, [animating]);

  const prev = () => go((active - 1 + PLANS.length) % PLANS.length, 'left');
  const next = useCallback(() => go((active + 1) % PLANS.length, 'right'), [active, go]);

  const goToSignup = () => navigate('/open-Account');

  // Auto-advance removed — navigation is now fully manual via arrows/dots.

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ─────────────────────────────────── SECTION */
        .inv-root {
          position: relative;
          overflow: hidden;
          font-family: "DM Sans", sans-serif;
          background: #ffffff;
        }

        /* background image */
        .inv-bg {
          position: absolute; inset: 0;
          background-image: url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1800&q=80&fit=crop');
          background-size: cover;
          background-position: center top;
          z-index: 0;
          opacity: 0.22;
          mix-blend-mode: luminosity;
        }
        .inv-bg-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(180deg,
            rgba(7,7,14,0.6) 0%,
            rgba(7,7,14,0.55) 40%,
            rgba(7,7,14,0.75) 75%,
            rgba(7,7,14,0.95) 100%
          );
        }

        /* mesh blobs */
        .inv-blob1 {
          position: absolute; z-index: 1; pointer-events: none;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(250,81,15,0.07) 0%, transparent 65%);
          top: -100px; left: -150px;
        }
        .inv-blob2 {
          position: absolute; z-index: 1; pointer-events: none;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%);
          bottom: -80px; right: -100px;
        }

        /* ─────────────────────────────────── LAYOUT */
        .inv-inner {
          position: relative; z-index: 2;
          max-width: 1200px; margin: 0 auto;
          padding: clamp(64px,9vh,108px) clamp(16px,5vw,60px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(40px,5vw,80px);
          align-items: center;
        }

        /* ── Desktop order: card LEFT, text RIGHT ── */
        .inv-slider-wrap { order: 1; }
        .inv-left        { order: 2; }

        /* ─────────────────────────────────── LEFT: header */
        .inv-left { display: flex; flex-direction: column; }

        .inv-dot-pulse {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${BRAND}; display: inline-block; flex-shrink: 0;
          animation: invPulse 2s ease-in-out infinite;
        }
        @keyframes invPulse {
          0%,100%{transform:scale(.9);box-shadow:0 0 0 0 rgba(250,81,15,.55);}
          70%{transform:scale(1);box-shadow:0 0 0 10px rgba(250,81,15,0);}
        }

        /* dot indicators */
        .inv-dots {
          display: flex; gap: 7px; margin-top: 32px; flex-wrap: wrap;
        }
        .inv-dot {
          width: 7px; height: 7px; border-radius: 50%;
          border: none; cursor: pointer; padding: 0;
          background: rgba(0,0,0,0.18);
          transition: all .3s ease;
        }
        .inv-dot.active-dot {
          width: 26px; border-radius: 4px;
          background: ${BRAND};
        }

        /* plan name ticker */
        .inv-ticker {
          margin-top: 14px;
          font-size: 12px; font-weight: 600;
          color: rgba(0,0,0,0.4);
          text-transform: uppercase; letter-spacing: 1.6px;
          transition: opacity .3s ease;
        }

        /* trust row */
        .inv-trust {
          display: flex; flex-wrap: wrap; gap: 20px;
          margin-top: 36px;
          padding-top: 24px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .inv-trust-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; font-weight: 600;
          color: #64748B;
        }

        /* ─────────────────────────────────── RIGHT: slider */
        .inv-slider-wrap {
          position: relative;
          perspective: 1000px;
        }

        /* ─────────────────────────────────── CARD */
        .inv-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          min-height: clamp(460px,55vh,580px);
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
          transition: transform .4s ease, box-shadow .4s ease;
          animation: invCardIn .45s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes invCardIn {
          from { opacity:0; transform:translateX(40px) scale(0.97); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
        @keyframes invCardInLeft {
          from { opacity:0; transform:translateX(-40px) scale(0.97); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }

        .inv-card.slide-left  { animation: invCardInLeft .45s cubic-bezier(.22,1,.36,1) both; }
        .inv-card.slide-right { animation: invCardIn .45s cubic-bezier(.22,1,.36,1) both; }

        .inv-card:hover { transform: translateY(-4px); box-shadow: 0 40px 90px rgba(0,0,0,0.55); }

        /* Background image inside card */
        .inv-card-bg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          opacity: 0; transition: opacity .6s ease;
          z-index: 0;
        }
        .inv-card-bg.loaded { opacity: 1; }

        /* gradient overlay inside card */
        .inv-card-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(
            160deg,
            rgba(var(--grad-from-rgb, 30,58,95), 0.78) 0%,
            rgba(7,7,14,0.92) 70%
          );
        }

        /* shimmer */
        .inv-card-shimmer {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%);
          animation: invShimmer 3.5s ease-in-out infinite;
        }
        @keyframes invShimmer {
          0%{transform:translateX(-120%)} 100%{transform:translateX(220%)}
        }

        /* card body */
        .inv-card-body {
          position: relative; z-index: 3;
          display: flex; flex-direction: column;
          height: 100%; padding: 26px 26px 24px;
          gap: 0;
        }

        .inv-card-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; margin-bottom: 20px;
        }

        .inv-badge {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.2px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 99px; padding: 5px 12px;
          color: rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
        }

        .inv-rate-bubble {
          background: var(--accent, ${BRAND});
          border-radius: 14px;
          padding: 8px 14px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          min-width: 72px;
        }
        .inv-rate-num {
          display: block; font-family: "Space Grotesk",sans-serif;
          font-size: 18px; font-weight: 700; color: #fff; line-height: 1;
          letter-spacing: '-0.3px';
        }
        .inv-rate-label {
          display: block; font-size: 9px; font-weight: 700;
          color: rgba(255,255,255,0.7); text-transform: uppercase;
          letter-spacing: '1.2px'; margin-top: 2px;
        }

        .inv-card-mid { margin-bottom: 18px; }

        .inv-plan-name {
          margin: 0 0 8px;
          font-size: clamp(20px,2.2vw,26px);
          color: #fff; line-height: 1.1; letter-spacing: -0.4px;
        }
        .inv-plan-tagline {
          margin: 0;
          font-size: clamp(12px,1.2vw,13.5px); line-height: 1.65;
          color: rgba(255,255,255,0.58);
        }

        .inv-stats-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 8px; margin-bottom: 18px;
        }
        .inv-stat-box {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 10px 8px; text-align: center;
        }
        .inv-stat-val {
          font-family: "Space Grotesk",sans-serif;
          font-size: clamp(13px,1.3vw,15px); font-weight: 700;
          color: #fff; line-height: 1;
        }
        .inv-stat-lbl {
          font-size: 9px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1px; color: rgba(255,255,255,0.4); margin-top: 4px;
        }

        .inv-features {
          margin: 0 0 20px; padding: 0; list-style: none;
          display: flex; flex-direction: column; gap: 8px;
          flex: 1;
        }
        .inv-feature {
          display: flex; align-items: center; gap: 9px;
          font-size: clamp(11.5px,1.1vw,13px); color: rgba(255,255,255,0.7); line-height: 1.4;
        }
        .inv-check {
          width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
          background: rgba(var(--accent-rgb, 250,81,15), 0.15);
          border: 1px solid rgba(var(--accent-rgb, 250,81,15), 0.3);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent, ${BRAND});
        }

        .inv-card-foot {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          flex-wrap: wrap;
        }

        .inv-invest-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: ${BRAND}; color: #fff; border: none;
          border-radius: 11px; padding: 12px 20px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: "DM Sans",sans-serif;
          box-shadow: 0 4px 18px rgba(250,81,15,0.35);
          transition: all .2s ease;
          white-space: nowrap;
        }
        .inv-invest-btn:hover { background:${BRAND_DARK}; transform:translateY(-1px); }

        .inv-nav-pills {
          display: flex; align-items: center; gap: 6px;
        }
        .inv-nav-btn {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          transition: all .2s ease;
        }
        .inv-nav-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.08); }
        .inv-counter {
          font-size: 11px; font-weight: 600;
          color: #64748B; min-width: 28px; text-align: center;
        }

        /* ─────────────────────────────────── RESPONSIVE */
        @media (max-width: 860px) {
          .inv-inner {
            grid-template-columns: 1fr;
            padding: clamp(44px,6vh,68px) clamp(14px,4vw,28px);
            gap: 32px;
          }
          .inv-slider-wrap { order: 2; }
          .inv-left        { order: 1; }
          .inv-card { min-height: clamp(420px,70vw,520px); }
        }

        @media (max-width: 480px) {
          .inv-card { min-height: 480px; }
          .inv-card-body { padding: 20px 18px; }
          .inv-plan-name { font-size: 20px; }
        }
      `}</style>

      <section className="inv-root">
        <div className="inv-blob1" />
        <div className="inv-blob2" />

        <div className="inv-inner" ref={ref}>

          {/* ════════ LEFT (desktop) / TOP (mobile): header + controls ════════ */}
          <div
            className="inv-left"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(24px)',
              transition: 'opacity .7s ease .1s, transform .7s ease .1s',
            }}
          >
            {/* Eyebrow */}
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:18 }}>
              <span className="inv-dot-pulse" />
              <span style={{ fontSize:11, fontWeight:700, color:BRAND, textTransform:'uppercase', letterSpacing:'2.4px' }}>
                {c.eyebrow}
              </span>
            </div>

            {/* Heading */}
            <h2 style={{
              margin:'0 0 18px',
              fontWeight:800,
              fontSize:'clamp(28px,3.8vw,52px)',
              lineHeight:1.07, letterSpacing:'-0.03em',
              color:'#0D1117', wordBreak:'break-word',
            }}>
              {c.heading1}<br />
              <span style={{ background:`linear-gradient(90deg,${BRAND} 0%,#FF8A50 100%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                {c.heading2}
              </span>
            </h2>

            {/* Sub */}
            <p style={{
              margin:0, fontSize:'clamp(13px,1.35vw,15.5px)', lineHeight:1.8,
              color:'#64748B', wordBreak:'break-word', overflowWrap:'break-word',
            }}>{c.sub}</p>

            {/* Dot nav */}
            <div className="inv-dots">
              {PLANS.map((p, i) => (
                <button
                  key={p.id}
                  className={`inv-dot${active===i ? ' active-dot' : ''}`}
                  onClick={() => go(i, i > active ? 'right' : 'left')}
                  aria-label={p.en.name}
                />
              ))}
            </div>

            {/* Active plan name ticker */}
            <div className="inv-ticker" key={active}>
              {PLANS[active][language as keyof typeof PLANS[0]] && (PLANS[active][language as keyof typeof PLANS[0]] as any).name
                ? (PLANS[active][language as keyof typeof PLANS[0]] as any).name
                : PLANS[active].en.name}
            </div>

            {/* Trust row */}
            <div className="inv-trust">
              {[
                { icon:'🏛️', label: c.trust1 },
                { icon:'🔒', label: c.trust2 },
                { icon:'⚡', label: c.trust3 },
              ].map((t, i) => (
                <div key={i} className="inv-trust-item">
                  <span style={{ fontSize:15 }}>{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* ════════ RIGHT (desktop) / BELOW subtitle (mobile): slider card ════════ */}
          <div
            className="inv-slider-wrap"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateX(28px)',
              transition: 'opacity .75s ease .2s, transform .75s ease .2s',
            }}
          >
            {!animating && (
              <PlanCard
                plan={PLANS[active]}
                lang={language}
                active={true}
                idx={active}
                total={PLANS.length}
                onPrev={prev}
                onNext={next}
                onInvest={goToSignup}
              />
            )}
          </div>

        </div>
      </section>
    </>
  );
};

export default Investments;