import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useI18n } from './i18n';
import { useI18n } from '../context/l18n';

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND = '#FA510F';
const BRAND_DARK = '#D94309';

const COPY = {
  en: {
    eyebrow: 'The future of Investments',
    h1: 'Your money,',
    h2: 'your rules.',
    sub: 'Crown Ledger gives you full control — instant transfers, zero hidden fees, and smart savings that work for you 24/7.',
    cta1: 'Open free account',
    stat1_label: 'Active users',
    stat2_val: '$18B+',
    stat2_label: 'Transfers daily',
    stat3_val: '4.9★',
    stat3_label: 'App rating',
  },
  es: {
    eyebrow: 'El futuro de la banca',
    h1: 'Tu dinero,',
    h2: 'tus reglas.',
    sub: 'NovaPay te da control total — transferencias instantáneas, cero cargos ocultos y ahorros inteligentes que trabajan para ti 24/7.',
    cta1: 'Abrir cuenta gratis',
    cta2: 'Ver cómo funciona',
    stat1_val: '2.4M+',
    stat1_label: 'Usuarios activos',
    stat2_val: '$18B+',
    stat2_label: 'Transferencias diarias',
    stat3_val: '4.9★',
    stat3_label: 'Calificación app',
    captions: ['Lagos · Nigeria', 'Accra · Ghana', 'Nairobi · Kenia', 'Kano · Nigeria'],
  },
};

// ─── Slide images (Unsplash — free) ──────────────────────────────────────────
const SLIDES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fit=crop', // city skyline
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600&q=80&fit=crop', // fintech
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80&fit=crop', // trading
  'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1600&q=80&fit=crop', // mobile banking
];

// ─── Floating card data ───────────────────────────────────────────────────────
// transfer → top-right | savings → bottom-right | instant → bottom-left
const FLOAT_CARDS = [
  {
    id: 'transfer',
    icon: '↗',
    label: { en: 'Transfer sent', es: 'Transferencia enviada' },
    value: '+$250,000',
    color: '#10B981',
    delay: '0s',
    top: '12%',
    right: '3%',
  },
  {
    id: 'savings',
    icon: '🔒',
    label: { en: 'Savings goal', es: 'Meta de ahorro' },
    value: '87% reached',
    color: BRAND,
    delay: '0.4s',
    bottom: '14%',
    right: '3%',
  },
  // {
  //   id: 'notify',
  //   icon: '⚡',
  //   label: { en: 'Instant payment', es: 'Pago instantáneo' },
  //   value: '0.3s',
  //   color: '#6366F1',
  //   delay: '0.8s',
  //   bottom: '14%',
  //   left: '2%',
  // },
];

// ─── Slide indicator dots ─────────────────────────────────────────────────────
function Dots({ count, active, onChange }: { count: number; active: number; onChange: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          style={{
            width: i === active ? 28 : 8,
            height: 8,
            borderRadius: 99,
            background: i === active ? BRAND : 'rgba(255,255,255,0.35)',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'width 0.4s cubic-bezier(.4,0,.2,1), background 0.3s ease',
          }}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ─── Floating glass card ─────────────────────────────────────────────────────
function FloatCard({
  icon, label, value, color, delay, style, isLeft,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  delay: string;
  style: React.CSSProperties;
  isLeft?: boolean;
}) {
  return (
    <div
      className={`hero-float-card${isLeft ? ' hero-float-card-left' : ''}`}
      style={{
        position: 'absolute',
        ...style,
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 16,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 170,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        animation: `floatUp 0.7s ${delay} both, bobble 4s ${delay} ease-in-out infinite`,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.5px', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { language } = useI18n();
  const navigate = useNavigate();
  const copy = COPY[language as keyof typeof COPY] ?? COPY.en;

  const [slide, setSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // mount animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const goTo = (next: number) => {
    if (transitioning || next === slide) return;
    setTransitioning(true);
    setPrevSlide(slide);
    setSlide(next);
    setTimeout(() => {
      setPrevSlide(null);
      setTransitioning(false);
    }, 900);
  };

  // auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSlide((s) => {
        const next = (s + 1) % SLIDES.length;
        setPrevSlide(s);
        setTransitioning(true);
        setTimeout(() => {
          setPrevSlide(null);
          setTransitioning(false);
        }, 900);
        return next;
      });
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes floatUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bobble {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.97); }
        }
        @keyframes heroTextIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(250,81,15,0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(250,81,15,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(250,81,15,0); }
        }
        .hero-cta-primary:hover {
          background: ${BRAND_DARK} !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 36px rgba(250,81,15,0.45) !important;
        }
        .hero-cta-primary:active { transform: translateY(0) !important; }
        .hero-cta-secondary:hover {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.6) !important;
          transform: translateY(-2px) !important;
        }
        .hero-cta-secondary:active { transform: translateY(0) !important; }

        /* Hide float cards on narrow screens so they don't overlap content */
        @media (max-width: 768px) {
          .hero-float-card { display: none !important; }
        }
        /* Shrink float cards on medium screens */
        @media (max-width: 1024px) {
          .hero-float-card { transform: scale(0.88); transform-origin: top right; }
          .hero-float-card-left { transform-origin: bottom left; }
        }
      `}</style>

      <section
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '70vh',
          overflow: 'hidden',
          fontFamily: '"DM Sans", sans-serif',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Background slides ── */}
        {SLIDES.map((src, i) => (
          <div
            key={src}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              animation:
                i === slide
                  ? 'fadeSlideIn 0.9s ease forwards'
                  : i === prevSlide
                  ? 'fadeSlideOut 0.9s ease forwards'
                  : undefined,
              opacity: i === slide ? 1 : i === prevSlide ? 1 : 0,
              zIndex: i === slide ? 1 : i === prevSlide ? 0 : -1,
            }}
          />
        ))}

        {/* ── Gradient overlay ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(10,10,18,0.88) 0%, rgba(10,10,18,0.65) 50%, rgba(10,10,18,0.35) 100%)',
            zIndex: 2,
          }}
        />

        {/* ── Noise texture overlay ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            zIndex: 3,
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        />

        {/* ── Orange accent line ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent 0%, ${BRAND} 30%, ${BRAND} 70%, transparent 100%)`,
            zIndex: 10,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.6s ease 0.2s',
          }}
        />

        {/* ── Main content ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
            padding: 'clamp(48px, 8vh, 96px) clamp(16px, 5vw, 64px) clamp(80px, 10vh, 100px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 'min(600px, 100%)',
              width: '100%',
              gap: 0,
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 24,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: BRAND,
                  animation: 'pulse-ring 2s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '2.5px',
                }}
              >
                {copy.eyebrow}
              </span>
            </div>

            {/* Heading */}
            <h1
              style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 800,
                fontSize: 'clamp(36px, 5.5vw, 74px)',
                lineHeight: 1.05,
                letterSpacing: 'clamp(-1px, -0.03em, -2px)',
                color: '#ffffff',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(28px)',
                transition: 'opacity 0.65s ease 0.2s, transform 0.65s ease 0.2s',
              }}
            >
              {copy.h1}
              <br />
              <span
                style={{
                  background: `linear-gradient(90deg, ${BRAND} 0%, #FF8A50 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {copy.h2}
              </span>
            </h1>

            {/* Sub */}
            <p
              style={{
                marginTop: 20,
                marginBottom: 0,
                fontSize: 'clamp(14px, 1.6vw, 17px)',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.62)',
                maxWidth: '100%',
                fontWeight: 400,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.65s ease 0.32s, transform 0.65s ease 0.32s',
              }}
            >
              {copy.sub}
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                marginTop: 32,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.65s ease 0.44s, transform 0.65s ease 0.44s',
              }}
            >
              <button
                className="hero-cta-primary"
                onClick={() => navigate('/open-Account')}
                style={{
                  background: BRAND,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: 'clamp(12px, 1.5vw, 15px) clamp(18px, 2.5vw, 28px)',
                  fontSize: 'clamp(13px, 1.4vw, 15px)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 6px 24px rgba(250,81,15,0.35)`,
                  transition: 'all 0.2s ease',
                  letterSpacing: '-0.2px',
                  fontFamily: '"DM Sans", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                }}
              >
                {copy.cta1}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Floating glass cards ── */}
        {FLOAT_CARDS.map((card) => {
          const posStyle: React.CSSProperties = {};
          if (card.top) posStyle.top = card.top;
          if (card.right) posStyle.right = card.right;
          if (card.bottom) posStyle.bottom = card.bottom;
          // if (card.left) posStyle.left = card.left;

          return (
            <FloatCard
              key={card.id}
              icon={card.icon}
              label={card.label[language as keyof typeof card.label] ?? card.label.en}
              value={card.value}
              color={card.color}
              delay={card.delay}
              style={posStyle}
              // isLeft={!!card.left}
            />
          );
        })}

        {/* ── Bottom bar: caption + dots ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 6,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%)',
            padding: 'clamp(16px, 3vh, 28px) clamp(20px, 5vw, 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Dots count={SLIDES.length} active={slide} onChange={goTo} />
        </div>

        {/* ── Scroll indicator ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 68,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: mounted ? 0.45 : 0,
            transition: 'opacity 0.6s ease 1.2s',
          }}
        >
          <div
            style={{
              width: 22,
              height: 36,
              borderRadius: 11,
              border: '1.5px solid rgba(255,255,255,0.4)',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 6,
            }}
          >
            <div
              style={{
                width: 3,
                height: 8,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.7)',
                animation: 'bobble 1.8s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;