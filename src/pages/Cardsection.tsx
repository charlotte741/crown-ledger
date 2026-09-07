import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../context/l18n';

const BRAND      = '#FA510F';
const BRAND_DARK = '#D94309';

const PORTFOLIOS = [
  {
    id: 'starter',
    name: { en: 'Starter Portfolio', es: 'Portafolio Inicial' },
    yield: '5.00%',
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
    accent: '#60A5FA',
    chartPoints: '0,38 15,34 30,36 45,28 60,24 75,20 90,14 105,10',
    allocation: [
      { label: { en: 'Bonds', es: 'Bonos' }, pct: 45 },
      { label: { en: 'Cash', es: 'Efectivo' }, pct: 30 },
      { label: { en: 'Equities', es: 'Acciones' }, pct: 25 },
    ],
    perks: {
      en: ['5.00% target annual yield', 'Auto-diversified across 4 asset classes', 'No minimum balance', 'Daily interest accrual'],
      es: ['5.00% rendimiento anual objetivo', 'Diversificación automática en 4 clases de activos', 'Sin saldo mínimo', 'Interés diario'],
    },
  },
  {
    id: 'growth',
    name: { en: 'Growth Portfolio', es: 'Portafolio de Crecimiento' },
    yield: '8.00%',
    gradient: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
    accent: '#34D399',
    chartPoints: '0,40 15,35 30,38 45,26 60,18 75,20 90,8 105,4',
    allocation: [
      { label: { en: 'Equities', es: 'Acciones' }, pct: 40 },
      { label: { en: 'Real Estate', es: 'Inmuebles' }, pct: 35 },
      { label: { en: 'Bonds', es: 'Bonos' }, pct: 25 },
    ],
    perks: {
      en: ['8.00% target annual yield', 'Auto-rebalancing every quarter', 'Access to equities & real estate funds', 'Priority advisor support'],
      es: ['8.00% rendimiento anual objetivo', 'Rebalanceo automático trimestral', 'Acceso a acciones y fondos inmobiliarios', 'Soporte prioritario de asesor'],
    },
  },
  {
    id: 'elite',
    name: { en: 'Elite Portfolio', es: 'Portafolio Elite' },
    yield: '11.00%+',
    gradient: 'linear-gradient(135deg, #4A1942 0%, #0F172A 100%)',
    accent: '#F472B6',
    chartPoints: '0,42 15,36 30,30 45,24 60,22 75,12 90,10 105,2',
    allocation: [
      { label: { en: 'Global Markets', es: 'Mercados Globales' }, pct: 50 },
      { label: { en: 'Equities', es: 'Acciones' }, pct: 30 },
      { label: { en: 'Alternatives', es: 'Alternativos' }, pct: 20 },
    ],
    perks: {
      en: ['11%+ target annual yield', 'Dedicated wealth manager', 'Global market access', 'Zero FX fees on international assets'],
      es: ['11%+ rendimiento anual objetivo', 'Gestor de patrimonio dedicado', 'Acceso a mercados globales', 'Sin comisiones FX en activos internacionales'],
    },
  },
];

const PERK_ICONS = ['📈', '⚖️', '🌐', '👤'];

const COPY = {
  en: {
    eyebrow:      'Crown Ledger Portfolios',
    heading1:     'A portfolio for every',
    heading2:     'chapter of your life.',
    sub:          'From your first savings goal to a fully managed wealth strategy — there is a Crown Ledger portfolio shaped exactly for where you are, and where you are going.',
    // cta:          'Start investing',
    perks_label:  'Key benefits',
    global:       'Invest across 180+ global markets',
    instant:      'Instant portfolio activation on signup',
    freeze:       'Pause & resume contributions anytime',
    yield_label:  'Target Annual Yield',
    alloc_label:  'Asset Allocation',
  },
  es: {
    eyebrow:      'Portafolios Crown Ledger',
    heading1:     'Un portafolio para cada',
    heading2:     'etapa de tu vida.',
    sub:          'Desde tu primera meta de ahorro hasta una estrategia de patrimonio totalmente gestionada — hay un portafolio Crown Ledger diseñado para donde estás y hacia donde vas.',
    cta:          'Comenzar a invertir',
    perks_label:  'Beneficios clave',
    global:       'Invierte en más de 180 mercados globales',
    instant:      'Activación instantánea del portafolio',
    freeze:       'Pausa y reanuda aportes cuando quieras',
    yield_label:  'Rendimiento Anual Objetivo',
    alloc_label:  'Asignación de Activos',
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

/* ─── Portfolio panel (replaces the physical "card" image) ──────────────────── */
function PortfolioPanel({
  portfolio, lang, active,
}: {
  portfolio: typeof PORTFOLIOS[0];
  lang: string;
  active: boolean;
}) {
  const c = COPY[lang as keyof typeof COPY] ?? COPY.en;
  const name = portfolio.name[lang as keyof typeof portfolio.name] ?? portfolio.name.en;

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1.586 / 1',
        borderRadius: 18,
        background: portfolio.gradient,
        border: `1px solid ${portfolio.accent}33`,
        boxShadow: active
          ? '0 28px 72px rgba(0,0,0,0.55), 0 6px 20px rgba(0,0,0,0.35)'
          : '0 12px 36px rgba(0,0,0,0.4)',
        animation: active ? 'csFloat 5s ease-in-out infinite' : 'none',
        transition: 'box-shadow .4s ease',
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(16px,2.2vw,24px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* shimmer on active */}
      {active && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.09) 50%, transparent 70%)',
          animation: 'csShimmer 3.8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* faint radial glow */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${portfolio.accent}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top row: name + yield badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 4 }}>
            {c.yield_label}
          </div>
          <div style={{ fontSize: 'clamp(22px,2.6vw,30px)', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.5px' }}>
            {portfolio.yield}
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: `${portfolio.accent}22`,
          border: `1px solid ${portfolio.accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, flexShrink: 0,
        }}>
          📈
        </div>
      </div>

      {/* Mini chart */}
      <svg viewBox="0 0 105 44" width="100%" height="clamp(36px,5vw,52px)" preserveAspectRatio="none" style={{ position: 'relative' }}>
        <polyline
          points={portfolio.chartPoints}
          fill="none"
          stroke={portfolio.accent}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={`0,44 ${portfolio.chartPoints} 105,44`}
          fill={`${portfolio.accent}18`}
          stroke="none"
        />
      </svg>

      {/* Bottom row: name + allocation dots */}
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 'clamp(13px,1.4vw,15px)', fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.2px' }}>
          {name}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {portfolio.allocation.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? portfolio.accent : i === 1 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)',
              }} />
              <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)' }}>
                {(a.label[lang as keyof typeof a.label] ?? a.label.en)} {a.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Portfolio Stack – shared between desktop & mobile ─────────────────────── */
function PortfolioStack({
  active,
  onSelect,
  inView,
  lang,
}: {
  active: number;
  onSelect: (i: number) => void;
  inView: boolean;
  lang: string;
}) {
  const order = [active, (active + 1) % 3, (active + 2) % 3];

  const layers = [
    { zIndex: 10, top: '0%',  left: '0%',  rotate: '-4deg', scale: 1,    opacity: 1,    blur: 0 },
    { zIndex: 6,  top: '10%', left: '8%',  rotate: '4deg',  scale: 0.93, opacity: 0.82, blur: 0 },
    { zIndex: 3,  top: '19%', left: '15%', rotate: '10deg', scale: 0.86, opacity: 0.55, blur: 1 },
  ];

  return (
    <div className="cs-stack-wrap"
    style={{
      position: 'relative',
      width: '100%',
      paddingBottom: '58%',
      opacity: inView ? 1 : 0,
      transition: 'opacity .7s ease .3s',
    }}>
      {order.map((cardIdx, layerIdx) => {
        const ly = layers[layerIdx];
        const cd = PORTFOLIOS[cardIdx];
        const isActive = layerIdx === 0;
        return (
          <div
            key={cd.id}
            onClick={() => !isActive && onSelect(cardIdx)}
            style={{
              position: 'absolute',
              top: ly.top,
              left: ly.left,
              width: '95%',
              zIndex: ly.zIndex,
              transform: `rotate(${ly.rotate}) scale(${ly.scale})`,
              opacity: ly.opacity,
              filter: ly.blur ? `blur(${ly.blur}px)` : 'none',
              cursor: isActive ? 'default' : 'pointer',
              transition: 'all .55s cubic-bezier(.34,1.15,.64,1)',
              transformOrigin: 'bottom left',
            }}
          >
            <PortfolioPanel portfolio={cd} lang={lang} active={isActive} />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main section ──────────────────────────────────────────────────────────── */
const PortfoliosSection: React.FC = () => {
  const { language } = useI18n();
  const c    = COPY[language as keyof typeof COPY] ?? COPY.en;
  const [active, setActive] = useState(0);
  const { ref, inView } = useInView();
  const portfolio = PORTFOLIOS[active];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes csFloat   { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-12px) rotate(-4deg)} }
        @keyframes csShimmer { 0%{transform:translateX(-120%)} 100%{transform:translateX(220%)} }
        @keyframes csFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .cs-root {
          position: relative;
          overflow: hidden;
          font-family: "DM Sans", sans-serif;
          background: #07070E;
        }

        .cs-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1800&q=80&fit=crop');
          background-size: cover;
          background-position: center;
          z-index: 0;
        }
        .cs-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(7,7,14,0.78) 0%, rgba(7,7,14,0.68) 50%, rgba(7,7,14,0.88) 100%);
        }

        .cs-orb {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250,81,15,0.18) 0%, transparent 68%);
          top: 50%; right: 2%;
          transform: translateY(-50%);
          z-index: 1;
          pointer-events: none;
        }

        .cs-inner {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(56px,8vh,104px) clamp(16px,5vw,60px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(36px,5vw,80px);
          align-items: center;
        }

        .cs-left  { display:flex; flex-direction:column; min-width:0; }
        .cs-right { min-width:0; }

        .cs-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }

        .cs-tab {
          display:flex; align-items:center; gap:7px;
          padding:8px 16px;
          border-radius:99px;
          border:1.5px solid rgba(255,255,255,0.13);
          background:transparent;
          cursor:pointer;
          font-family:"DM Sans",sans-serif;
          font-size:12px; font-weight:600;
          color:rgba(255,255,255,0.42);
          letter-spacing:.2px;
          transition:all .2s ease;
          white-space:nowrap;
        }
        .cs-tab.active {
          background:${BRAND}; border-color:${BRAND}; color:#fff;
          box-shadow:0 4px 16px rgba(250,81,15,0.38);
        }
        .cs-tab:not(.active):hover {
          border-color:rgba(255,255,255,0.3);
          color:rgba(255,255,255,0.7);
        }

        .cs-perk {
          display:flex; align-items:center; gap:11px;
          font-size:clamp(12px,1.3vw,14px);
          color:rgba(255,255,255,0.68);
          line-height:1.5;
          transition:color .18s;
        }
        .cs-perk:hover { color:#fff; }

        .cs-perk-icon {
          width:28px; height:28px; border-radius:8px; flex-shrink:0;
          background:rgba(250,81,15,0.14);
          border:1px solid rgba(250,81,15,0.22);
          display:flex; align-items:center; justify-content:center;
          font-size:13px;
        }

        .cs-features {
          display:flex; flex-direction:column; gap:8px;
          padding:16px 18px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:14px;
          margin-bottom:26px;
        }
        .cs-feature-row {
          display:flex; align-items:center; gap:9px;
          font-size:clamp(11px,1.2vw,13px);
          color:rgba(255,255,255,0.5);
        }

        .cs-cta {
          display:inline-flex; align-items:center; gap:8px;
          background:${BRAND}; color:#fff;
          border:none; border-radius:12px;
          padding:13px 26px;
          font-size:14px; font-weight:700; cursor:pointer;
          font-family:"DM Sans",sans-serif;
          box-shadow:0 6px 22px rgba(250,81,15,0.32);
          transition:all .2s ease; letter-spacing:-.1px;
          align-self:flex-start;
          white-space:nowrap;
        }
        .cs-cta:hover { background:${BRAND_DARK}; transform:translateY(-2px); box-shadow:0 10px 28px rgba(250,81,15,0.45); }
        .cs-cta:active { transform:translateY(0); }

        .cs-inline-stack { display: none; }

        @media (max-width: 800px) {
          .cs-inner {
            grid-template-columns: 1fr;
            padding: clamp(40px,6vh,64px) clamp(14px,4vw,24px);
            gap: 28px;
          }
          .cs-orb { display: none; }
          .cs-inline-stack { display: block; margin-bottom: 24px; }
          .cs-right        { display: none; }
          .cs-stack-wrap {
            padding-bottom: 46% !important;
            max-width: 380px !important;
            margin: 0 auto !important;
          }
        }

        @media (max-width: 480px) {
          .cs-tabs { gap: 6px; }
          .cs-tab  { font-size: 11px; padding: 7px 13px; }
          .cs-stack-wrap {
            padding-bottom: 50% !important;
            max-width: 320px !important;
          }
        }
      `}</style>

      <section className="cs-root">
        <div className="cs-bg" />
        <div className="cs-orb" />

        <div className="cs-inner" ref={ref}>

          <div className="cs-left">

            <div style={{
              display:'flex', alignItems:'center', gap:9, marginBottom:16,
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(14px)',
              transition: 'opacity .55s ease .1s, transform .55s ease .1s',
            }}>
              <span style={{ width:24, height:2, background:BRAND, borderRadius:2, display:'inline-block', flexShrink:0 }} />
              <span style={{ fontSize:11, fontWeight:700, color:BRAND, textTransform:'uppercase', letterSpacing:'2.4px' }}>
                {c.eyebrow}
              </span>
            </div>

            <h2 style={{
              margin:'0 0 16px',
              fontWeight:800,
              fontSize:'clamp(30px,3.6vw,48px)',
              lineHeight:1.08, letterSpacing:'-0.03em',
              color:'#fff', wordBreak:'break-word',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(20px)',
              transition: 'opacity .65s ease .2s, transform .65s ease .2s',
            }}>
              {c.heading1}<br />
              <span style={{ background:`linear-gradient(90deg,${BRAND} 0%,#FF8A50 100%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                {c.heading2}
              </span>
            </h2>

            <p style={{
              margin:'0 0 44px',
              fontSize:'clamp(13px,1.35vw,15px)', lineHeight:1.82,
              color:'rgba(255,255,255,0.5)',
              wordBreak:'break-word', overflowWrap:'break-word',
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(16px)',
              transition: 'opacity .65s ease .3s, transform .65s ease .3s',
            }}>{c.sub}</p>

            <div className="cs-inline-stack" style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity .7s ease .35s',
            }}>
              <PortfolioStack active={active} onSelect={setActive} inView={inView} lang={language} />
            </div>

            <div className="cs-tabs" style={{ opacity: inView ? 1 : 0, transition:'opacity .5s ease .38s' }}>
              {PORTFOLIOS.map((cd, i) => (
                <button
                  key={cd.id}
                  className={`cs-tab${active === i ? ' active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  <span style={{ width:7, height:7, borderRadius:'50%', background: active===i ? '#fff' : BRAND, flexShrink:0, display:'inline-block' }} />
                  {cd.name[language as keyof typeof cd.name] ?? cd.name.en}
                </button>
              ))}
            </div>

            <div style={{ opacity: inView ? 1 : 0, transition:'opacity .5s ease .46s', marginBottom:20 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:10 }}>
                {c.perks_label}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {(portfolio.perks[language as keyof typeof portfolio.perks] ?? portfolio.perks.en).map((p, i) => (
                  <div key={i} className="cs-perk" style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'none' : 'translateX(-8px)',
                    transition: `opacity .48s ease ${0.5 + i * 0.07}s, transform .48s ease ${0.5 + i * 0.07}s`,
                  }}>
                    <span className="cs-perk-icon">{PERK_ICONS[i]}</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <div className="cs-features" style={{ opacity: inView ? 1 : 0, transition:'opacity .5s ease .7s' }}>
              {[
                { icon:'🌍', text: c.global  },
                { icon:'⚡', text: c.instant },
                { icon:'🧊', text: c.freeze  },
              ].map((f, i) => (
                <div key={i} className="cs-feature-row">
                  <span style={{ fontSize:14 }}>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            {/* <button className="cs-cta" style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'none' : 'translateY(12px)',
              transition: 'opacity .55s ease .78s, transform .55s ease .78s',
            }}>
              {c.cta}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button> */}
          </div>

          <div className="cs-right">
            <PortfolioStack active={active} onSelect={setActive} inView={inView} lang={language} />
          </div>

        </div>
      </section>
    </>
  );
};

export default PortfoliosSection;