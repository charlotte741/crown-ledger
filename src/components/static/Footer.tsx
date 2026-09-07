/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Link,
  Stack,
  Chip,
  Grid
} from '@mui/material';
// import Grid from '@mui/material/Grid2';
import {
  AccountBalance as PersonalBankingIcon,
  BusinessCenter as BusinessBankingIcon,
  TrendingUp as InvestmentsIcon,
  CreditCard as CardIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useI18n } from '../../context/l18n';
import img from '../../assets/crown.png';

// ─── Brand tokens (mirrors Header) ───────────────────────────────────────────
const BRAND       = '#FA510F';
const BRAND_DARK  = '#D94309';
// const BRAND_LIGHT = 'rgba(250,81,15,0.08)';

const footerTheme = createTheme({
  palette: { primary: { main: BRAND } },
  typography: { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' },
});

// ─── Static data ──────────────────────────────────────────────────────────────
const SERVICES = [
  { labelKey: 'service_personal_label' as const, icon: <PersonalBankingIcon sx={{ fontSize: 14 }} />, color: '#1D4ED8', bg: '#EFF6FF' },
  { labelKey: 'service_business_label' as const, icon: <BusinessBankingIcon sx={{ fontSize: 14 }} />, color: '#065F46', bg: '#ECFDF5' },
  { labelKey: 'service_investments_label' as const, icon: <InvestmentsIcon sx={{ fontSize: 14 }} />, color: '#92400E', bg: '#FFFBEB' },
  { labelKey: 'service_card_label' as const, icon: <CardIcon sx={{ fontSize: 14 }} />, color: '#6B21A8', bg: '#FAF5FF' },
];

const COMPANY_LINKS = [
  'footer_about_us',
] as const;

const SUPPORT_LINKS = [
  'footer_help_center',
  'footer_contact',
  'footer_security',
  'footer_fraud',
  'footer_accessibility',
] as const;

const LEGAL_LINKS = [
  'footer_privacy',
  'footer_terms',
  'footer_cookies',
  'footer_disclosures',
] as const;

const SOCIALS = [
  { icon: <FacebookIcon sx={{ fontSize: 18 }} />, label: 'Facebook' },
  { icon: <TwitterIcon sx={{ fontSize: 18 }} />,  label: 'Twitter / X' },
  { icon: <LinkedInIcon sx={{ fontSize: 18 }} />, label: 'LinkedIn' },
  { icon: <InstagramIcon sx={{ fontSize: 18 }} />,label: 'Instagram' },
];

const TRUST_BADGES = [
  { icon: <ShieldIcon sx={{ fontSize: 14 }} />,   key: 'footer_trust_fdic'    as const },
  { icon: <SecurityIcon sx={{ fontSize: 14 }} />, key: 'footer_trust_ssl'     as const },
  { icon: <VerifiedIcon sx={{ fontSize: 14 }} />, key: 'footer_trust_secured' as const },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterLogo() {
  const { t } = useI18n();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="img"
        src={img}
        alt="Crown Ledger Bank"
        sx={{
          width: 40,
          height: 40,
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 6px rgba(250,81,15,0.25)) brightness(1.15)',
        }}
      />
      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 15,
            color: '#F1F5F9',
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
            fontSize: 8.5,
            color: '#64748B',
            letterSpacing: '1.6px',
            textTransform: 'uppercase',
            lineHeight: 1,
            mt: 0.35,
          }}
        >
          {t('logo_tagline')}
        </Typography>
      </Box>
    </Box>
  );
}

function FooterLinkGroup({ titleKey, links }: { titleKey: string; links: readonly string[] }) {
  const { t } = useI18n();
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 700,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          mb: 2,
        }}
      >
        {t(titleKey as any)}
      </Typography>
      <Stack spacing={1.25}>
        {links.map((key) => (
          <Link
            key={key}
            href="#"
            underline="none"
            sx={{
              fontSize: 13.5,
              color: '#94A3B8',
              fontWeight: 400,
              transition: 'color 0.15s ease, padding-left 0.15s ease',
              display: 'block',
              '&:hover': { color: BRAND, pl: 0.5 },
            }}
          >
            {t(key as any)}
          </Link>
        ))}
      </Stack>
    </Box>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
  const { t } = useI18n();

  return (
    <ThemeProvider theme={footerTheme}>
      <Box
        component="footer"
        sx={{
          bgcolor: '#0B1220',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          /* Subtle radial glow top-left */
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -120,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250,81,15,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* ── Top accent bar ── */}
        <Box
          sx={{
            height: 3,
            background: `linear-gradient(90deg, ${BRAND} 0%, ${BRAND_DARK} 50%, transparent 100%)`,
          }}
        />

        {/* ── Main content ── */}
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2.5, sm: 4, md: 6 },
            pt: { xs: 5, md: 7 },
            pb: { xs: 4, md: 5 },
          }}
        >
          <Grid container spacing={{ xs: 5, md: 6 }}>

            {/* ── Brand column ── */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FooterLogo />

              <Typography
                sx={{
                  mt: 2.5,
                  fontSize: 13,
                  color: '#64748B',
                  lineHeight: 1.7,
                  maxWidth: 300,
                }}
              >
                {t('footer_brand_desc')}
              </Typography>

              {/* Contact info */}
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                {[
                  { icon: <PhoneIcon sx={{ fontSize: 14 }} />, text: '+1 (800) 555-CROWN' },
                  { icon: <EmailIcon sx={{ fontSize: 14 }} />, text: 'support@crownledger.com' },
                  { icon: <LocationIcon sx={{ fontSize: 14 }} />, text: '100 Financial Plaza, New York, NY' },
                ].map(({ icon, text }) => (
                  <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(250,81,15,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: BRAND,
                        flexShrink: 0,
                      }}
                    >
                      {icon}
                    </Box>
                    <Typography sx={{ fontSize: 12.5, color: '#94A3B8' }}>{text}</Typography>
                  </Box>
                ))}
              </Stack>

              {/* Social icons */}
              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                {SOCIALS.map(({ icon, label }) => (
                  <IconButton
                    key={label}
                    aria-label={label}
                    size="small"
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1.5,
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#64748B',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        color: BRAND,
                        borderColor: `rgba(250,81,15,0.4)`,
                        bgcolor: 'rgba(250,81,15,0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* ── Services column ── */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  mb: 2,
                }}
              >
                {t('footer_services_heading')}
              </Typography>
              <Stack spacing={1.5}>
                {SERVICES.map((s) => (
                  <Link key={s.labelKey} href="#" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, '&:hover .svc-label': { color: BRAND }, '&:hover .svc-icon': { transform: 'scale(1.1)' } }}>
                    <Box
                      className="svc-icon"
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: s.color,
                        flexShrink: 0,
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      {s.icon}
                    </Box>
                    <Typography
                      className="svc-label"
                      sx={{ fontSize: 13, color: '#94A3B8', fontWeight: 400, transition: 'color 0.15s ease' }}
                    >
                      {t(s.labelKey)}
                    </Typography>
                  </Link>
                ))}
              </Stack>
            </Grid>

            {/* ── Company column ── */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FooterLinkGroup titleKey="footer_company_heading" links={COMPANY_LINKS} />
            </Grid>

            {/* ── Support column ── */}
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <FooterLinkGroup titleKey="footer_support_heading" links={SUPPORT_LINKS} />
            </Grid>

            {/* ── Newsletter / App ── */}
            <Grid size={{ xs: 12, sm: 12, md: 2 }}>
              {/* <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  mb: 2,
                }}
              >
                {t('footer_app_heading')}
              </Typography> */}

              {/* App store badges */}
              {/* <Stack spacing={1.25}>
                {(['footer_app_ios', 'footer_app_android'] as const).map((key) => (
                  <Box
                    key={key}
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        borderColor: `rgba(250,81,15,0.5)`,
                        bgcolor: 'rgba(250,81,15,0.07)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 9, color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                      {key === 'footer_app_ios' ? 'Download on the' : 'Get it on'}
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3 }}>
                      {t(key)}
                    </Typography>
                  </Box>
                ))}
              </Stack> */}

              {/* Trust badges */}
              <Stack spacing={1} sx={{ mt: 3 }}>
                {TRUST_BADGES.map(({ icon, key }) => (
                  <Chip
                    key={key}
                    icon={React.cloneElement(icon, { sx: { fontSize: '14px !important', color: `${BRAND} !important` } })}
                    label={t(key)}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(250,81,15,0.07)',
                      border: '1px solid rgba(250,81,15,0.18)',
                      color: '#94A3B8',
                      fontSize: 11,
                      height: 26,
                      justifyContent: 'flex-start',
                      '& .MuiChip-label': { pl: 0.5 },
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>

          {/* ── Bottom bar ── */}
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mt: { xs: 5, md: 6 }, mb: 3 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography sx={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
              {t('footer_copyright').replace('{year}', String(new Date().getFullYear()))}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 2, sm: 3 },
                alignItems: 'center',
              }}
            >
              {LEGAL_LINKS.map((key) => (
                <Link
                  key={key}
                  href="#"
                  underline="none"
                  sx={{
                    fontSize: 12,
                    color: '#475569',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: BRAND },
                  }}
                >
                  {t(key)}
                </Link>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Footer;