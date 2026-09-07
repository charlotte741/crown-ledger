import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Divider,
  Paper,
  ListItemIcon,
  useScrollTrigger,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
} from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  AccountBalance as PersonalBankingIcon,
  BusinessCenter as BusinessBankingIcon,
  TrendingUp as InvestmentsIcon,
  CreditCard as CardIcon,
  ExpandMore,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useI18n } from '../../context/l18n';
import type { Language } from '../../context/l18n';
import img from "../../assets/crown.png"

// ─── Brand color ─────────────────────────────────────────────────────────────
const BRAND = '#FA510F';
const BRAND_DARK = '#D94309';
const BRAND_LIGHT = 'rgba(250,81,15,0.08)';

// ─── Scroll helper ────────────────────────────────────────────────────────────
// Central place for smooth-scrolling to a section id on the one-page layout.
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const headerTheme = createTheme({
  palette: { primary: { main: BRAND } },
  typography: { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          fontSize: 14,
          letterSpacing: '-0.1px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { overflowX: 'hidden', maxWidth: '100vw' } },
    },
  },
});

// ─── Language Toggle ──────────────────────────────────────────────────────────
function LanguageToggle() {
  const { language, setLanguage } = useI18n();
  const other: Language = language === 'en' ? 'es' : 'en';

  return (
    <Button
      onClick={() => setLanguage(other)}
      variant="text"
      size="small"
      sx={{
        minWidth: 0,
        px: 1.25,
        py: 0.625,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.12)',
        color: '#475569',
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: '0.4px',
        lineHeight: 1,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: BRAND,
          color: BRAND,
          bgcolor: BRAND_LIGHT,
        },
      }}
    >
      {other.toUpperCase()}
    </Button>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServiceItem {
  labelKey: 'service_personal_label' | 'service_business_label' | 'service_investments_label' | 'service_card_label';
  descKey: 'service_personal_desc' | 'service_business_desc' | 'service_investments_desc' | 'service_card_desc';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  sectionId: string; // NEW — where this service item scrolls to
}

const SERVICE_DEFS: ServiceItem[] = [
  {
    labelKey: 'service_personal_label',
    descKey: 'service_personal_desc',
    icon: <PersonalBankingIcon sx={{ fontSize: 20 }} />,
    color: '#1D4ED8',
    bgColor: '#EFF6FF',
    sectionId: 'personal-banking',
  },
  {
    labelKey: 'service_business_label',
    descKey: 'service_business_desc',
    icon: <BusinessBankingIcon sx={{ fontSize: 20 }} />,
    color: '#065F46',
    bgColor: '#ECFDF5',
    sectionId: 'business-banking',
  },
  {
    labelKey: 'service_investments_label',
    descKey: 'service_investments_desc',
    icon: <InvestmentsIcon sx={{ fontSize: 20 }} />,
    color: '#92400E',
    bgColor: '#FFFBEB',
    sectionId: 'investments',
  },
  {
    labelKey: 'service_card_label',
    descKey: 'service_card_desc',
    icon: <CardIcon sx={{ fontSize: 20 }} />,
    color: '#6B21A8',
    bgColor: '#FAF5FF',
    sectionId: 'cards',
  },
];

// NAV_LINK_KEYS are now derived from translation keys
const NAV_LINK_KEYS = ['nav_home', 'nav_about', 'nav_services', 'nav_contact'] as const;
type NavLinkKey = (typeof NAV_LINK_KEYS)[number];

// Maps plain nav links (everything except the services dropdown) to section ids
const NAV_SECTION_IDS: Partial<Record<NavLinkKey, string>> = {
  nav_home: 'home',
  nav_about: 'about',
  nav_contact: 'contact',
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ onClick }: { onClick?: () => void }) {
  const { t } = useI18n();
  return (
    <Box
      onClick={onClick}
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
            color: '#0F172A',
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

// ─── Services Dropdown ────────────────────────────────────────────────────────
interface ServicesDropdownProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

function ServicesDropdown({ open, anchorEl, onClose }: ServicesDropdownProps) {
  const { t } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open, anchorEl, onClose]);

  if (!anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();

  const handleServiceClick = (sectionId: string) => {
    onClose();
    // wait a tick so the dropdown closes before we scroll
    requestAnimationFrame(() => scrollToSection(sectionId));
  };

  return (
    <Grow in={open} timeout={180} style={{ transformOrigin: 'top center' }}>
      <Paper
        ref={dropdownRef}
        elevation={0}
        sx={{
          position: 'fixed',
          top: rect.bottom + 10,
          left: Math.max(8, rect.left - 60),
          width: 370,
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.09)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
          zIndex: 1400,
          overflow: 'hidden',
          p: 1.5,
          maxWidth: 'calc(100vw - 16px)',
        }}
      >
        <Box sx={{ px: 1.5, pb: 0.75 }}>
          <Typography
            sx={{
              fontSize: 10.5,
              fontWeight: 700,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {t('services_heading')}
          </Typography>
        </Box>

        {SERVICE_DEFS.map((service, i) => (
          <Fade in={open} timeout={120 + i * 60} key={service.labelKey}>
            <Box
              onClick={() => handleServiceClick(service.sectionId)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 1.5,
                py: 1.25,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'background 0.15s ease, transform 0.15s ease',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  transform: 'translateX(3px)',
                  '& .arrow': { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  bgcolor: service.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: service.color,
                  flexShrink: 0,
                }}
              >
                {service.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                  {t(service.labelKey)}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, mt: 0.2 }}>
                  {t(service.descKey)}
                </Typography>
              </Box>
              <ArrowForwardIcon
                className="arrow"
                sx={{
                  fontSize: 15,
                  color: '#CBD5E1',
                  opacity: 0,
                  transform: 'translateX(-4px)',
                  transition: 'opacity 0.15s ease, transform 0.15s ease',
                  flexShrink: 0,
                }}
              />
            </Box>
          </Fade>
        ))}

        <Divider sx={{ my: 1.25 }} />
        <Box
          onClick={() => handleServiceClick('personal-banking')}
          sx={{
            mx: 1.5,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            bgcolor: BRAND_LIGHT,
            border: `1px solid rgba(250,81,15,0.2)`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'background 0.15s ease',
            '&:hover': { bgcolor: `rgba(250,81,15,0.13)` },
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: BRAND }}>
              {t('services_cta_label')}
            </Typography>
            <Typography sx={{ fontSize: 11, color: BRAND_DARK, opacity: 0.8 }}>
              {t('services_cta_sub')}
            </Typography>
          </Box>
          <ArrowForwardIcon sx={{ fontSize: 16, color: BRAND }} />
        </Box>
      </Paper>
    </Grow>
  );
}

// ─── Desktop Nav ──────────────────────────────────────────────────────────────
interface DesktopNavProps {
  activeNav: NavLinkKey | null;
  onNavClick: (navKey: NavLinkKey, e: React.MouseEvent<HTMLElement>) => void;
  servicesOpen: boolean;
}

function DesktopNav({ activeNav, onNavClick, servicesOpen }: DesktopNavProps) {
  const { t } = useI18n();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      {NAV_LINK_KEYS.map((key) => {
        const isActive = activeNav === key || (key === 'nav_services' && servicesOpen);
        return (
          <Button
            key={key}
            onClick={(e) => onNavClick(key, e)}
            endIcon={
              key === 'nav_services'
                ? servicesOpen
                  ? <ArrowUpIcon sx={{ fontSize: '15px !important', ml: -0.75, transition: 'transform 0.2s ease' }} />
                  : <ArrowDownIcon sx={{ fontSize: '15px !important', ml: -0.75, transition: 'transform 0.2s ease' }} />
                : undefined
            }
            sx={{
              color: isActive ? BRAND : '#475569',
              fontWeight: isActive ? 700 : 500,
              fontSize: 14,
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              position: 'relative',
              transition: 'color 0.15s ease, background 0.15s ease',
              '&:hover': { bgcolor: BRAND_LIGHT, color: BRAND },
              ...(isActive && { bgcolor: BRAND_LIGHT }),
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 4,
                left: '50%',
                transform: isActive ? 'translateX(-50%) scaleX(1)' : 'translateX(-50%) scaleX(0)',
                width: '60%',
                height: 2,
                bgcolor: BRAND,
                borderRadius: 1,
                transition: 'transform 0.2s ease',
              },
              '&:hover::after': { transform: 'translateX(-50%) scaleX(1)' },
            }}
          >
            {t(key)}
          </Button>
        );
      })}
    </Box>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { t } = useI18n();
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const navigate = useNavigate()

  const handleClose = () => {
    setServicesExpanded(false);
    onClose();
  };

  const handleNavItemClick = (key: NavLinkKey) => {
    if (key === 'nav_services') {
      setServicesExpanded((p) => !p);
      return;
    }
    const sectionId = NAV_SECTION_IDS[key];
    handleClose();
    if (sectionId) {
      requestAnimationFrame(() => scrollToSection(sectionId));
    }
  };

  const handleServiceItemClick = (sectionId: string) => {
    handleClose();
    requestAnimationFrame(() => scrollToSection(sectionId));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            maxWidth: '85vw',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Drawer header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          flexShrink: 0,
        }}
      >
        <Logo onClick={() => handleNavItemClick('nav_home')} />
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: '#475569',
            bgcolor: 'rgba(0,0,0,0.04)',
            borderRadius: 1.5,
            transition: 'transform 0.15s ease',
            '&:hover': { transform: 'rotate(90deg)', bgcolor: BRAND_LIGHT, color: BRAND },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Nav links */}
      <List sx={{ px: 1.5, pt: 1.5, flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_LINK_KEYS.map((key, i) => (
          <React.Fragment key={key}>
            <Fade in={open} timeout={200 + i * 60}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavItemClick(key)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    px: 2,
                    py: 1.25,
                    transition: 'background 0.15s ease',
                    '&:hover': { bgcolor: BRAND_LIGHT },
                    '&:hover .nav-label': { color: BRAND },
                  }}
                >
                  <ListItemText
                    primary={t(key)}
                    slotProps={{
                      primary: {
                        className: 'nav-label',
                        style: { fontSize: 15, fontWeight: 500, color: '#0F172A', transition: 'color 0.15s ease' },
                      },
                    }}
                  />
                  {key === 'nav_services' && (
                    <Box
                      sx={{
                        transform: servicesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        display: 'flex',
                        color: '#64748B',
                      }}
                    >
                      <ExpandMore sx={{ fontSize: 20 }} />
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
            </Fade>

            {key === 'nav_services' && (
              <Collapse in={servicesExpanded} timeout={220} unmountOnExit>
                <List disablePadding sx={{ pl: 1, pb: 0.5 }}>
                  {SERVICE_DEFS.map((service) => (
                    <ListItem key={service.labelKey} disablePadding>
                      <ListItemButton
                        onClick={() => handleServiceItemClick(service.sectionId)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.25,
                          px: 2,
                          py: 0.875,
                          transition: 'background 0.15s ease',
                          '&:hover': { bgcolor: BRAND_LIGHT },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 38 }}>
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 1.5,
                              bgcolor: service.bgColor,
                              color: service.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Box sx={{ fontSize: 15, color: service.color, display: 'flex' }}>
                              {service.icon}
                            </Box>
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={t(service.labelKey)}
                          slotProps={{
                            primary: { style: { fontSize: 13.5, fontWeight: 500, color: '#1E293B' } },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* CTA buttons */}
      <Box sx={{ px: 2.5, pb: 3, pt: 1, flexShrink: 0 }}>
        <Divider sx={{ mb: 2 }} />
        {/* Language toggle inside drawer */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
          <LanguageToggle />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Button
            fullWidth
            onClick={() => navigate("/login")}
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'rgba(250,81,15,0.4)',
              color: BRAND,
              py: 1.25,
              fontWeight: 600,
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: BRAND, bgcolor: BRAND_LIGHT },
            }}
          >
            {t('cta_login')}
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/open-Account')}
            size="large"
            sx={{
              bgcolor: BRAND,
              color: 'white',
              py: 1.25,
              fontWeight: 600,
              boxShadow: `0 4px 14px rgba(250,81,15,0.35)`,
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: BRAND_DARK,
                boxShadow: `0 6px 20px rgba(250,81,15,0.45)`,
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'translateY(0)' },
            }}
          >
            {t('cta_signup')}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

// ─── Animated hamburger icon ──────────────────────────────────────────────────
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <Box
      sx={{
        width: 20,
        height: 14,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            height: 2,
            bgcolor: '#0F172A',
            borderRadius: 1,
            transition: 'all 0.25s ease',
            transformOrigin: 'center',
            ...(open && i === 0 && { transform: 'rotate(45deg) translate(4px, 4px)' }),
            ...(open && i === 1 && { opacity: 0, transform: 'scaleX(0)' }),
            ...(open && i === 2 && { transform: 'rotate(-45deg) translate(4px, -4px)' }),
          }}
        />
      ))}
    </Box>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────
const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useI18n();
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<NavLinkKey | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesAnchor, setServicesAnchor] = useState<HTMLElement | null>(null);

  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 10 });

  const handleNavClick = (navKey: NavLinkKey, e: React.MouseEvent<HTMLElement>) => {
    if (navKey === 'nav_services') {
      if (servicesOpen) {
        setServicesOpen(false);
        setServicesAnchor(null);
      } else {
        setServicesOpen(true);
        setServicesAnchor(e.currentTarget);
        setActiveNav('nav_services');
      }
    } else {
      setActiveNav(navKey);
      setServicesOpen(false);
      setServicesAnchor(null);

      const sectionId = NAV_SECTION_IDS[navKey];
      if (sectionId) scrollToSection(sectionId);
    }
  };

  return (
    <ThemeProvider theme={headerTheme}>
      {/* Spacer so fixed header doesn't cover page content */}
      <Box sx={{ height: { xs: 64, md: 72 } }} />
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: 'white',
            borderBottom: '1px solid',
            borderColor: scrolled ? 'rgba(0,0,0,0.09)' : 'rgba(0,0,0,0.06)',
            boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.07)' : 'none',
            transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              maxWidth: 1200,
              width: '100%',
              mx: 'auto',
              px: { xs: 2, sm: 3, md: 4 },
              minHeight: { xs: 64, md: 72 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              overflow: 'hidden',
            }}
          >
            {/* Logo */}
            <Logo onClick={() => scrollToSection('home')} />

            {/* Desktop Nav */}
            {!isMobile && (
              <DesktopNav
                activeNav={activeNav}
                onNavClick={handleNavClick}
                servicesOpen={servicesOpen}
              />
            )}

            {/* Desktop CTA + Language toggle */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
                <LanguageToggle />
                <Button
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{
                    borderColor: 'rgba(250,81,15,0.4)',
                    color: BRAND,
                    px: 2.5,
                    py: 0.875,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: BRAND,
                      bgcolor: BRAND_LIGHT,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  {t('cta_login')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/open-Account')}
                  sx={{
                    bgcolor: BRAND,
                    color: 'white',
                    px: 2.5,
                    py: 0.875,
                    boxShadow: `0 3px 10px rgba(250,81,15,0.3)`,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: BRAND_DARK,
                      boxShadow: `0 5px 18px rgba(250,81,15,0.45)`,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  {t('cta_signup')}
                </Button>
              </Box>
            )}

            {/* Mobile hamburger */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileOpen((p) => !p)}
                disableRipple
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  border: '1px solid rgba(0,0,0,0.09)',
                  bgcolor: mobileOpen ? BRAND_LIGHT : 'transparent',
                  transition: 'background 0.15s ease',
                  '&:hover': { bgcolor: BRAND_LIGHT },
                  flexShrink: 0,
                  marginRight: '25px',
                }}
              >
                <HamburgerIcon open={mobileOpen} />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      {/* Services dropdown — desktop only */}
      {!isMobile && (
        <ServicesDropdown
          open={servicesOpen}
          anchorEl={servicesAnchor}
          onClose={() => {
            setServicesOpen(false);
            setServicesAnchor(null);
          }}
        />
      )}

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </ThemeProvider>
  );
};

export default Header;