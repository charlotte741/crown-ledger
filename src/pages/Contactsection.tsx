import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as ClockIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  ChatBubbleOutlined as MessageIcon,
  CheckCircleOutlined as CheckIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useI18n } from '../context/l18n';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND       = '#FA510F';
const BRAND_DARK  = '#D94309';
const BRAND_LIGHT = 'rgba(250,81,15,0.07)';

const contactTheme = createTheme({
  palette: { primary: { main: BRAND } },
  typography: { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif' },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            fontSize: 14,
            backgroundColor: '#FAFAFA',
            transition: 'background 0.2s ease, box-shadow 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(250,81,15,0.4)',
            },
            '&.Mui-focused': {
              backgroundColor: '#fff',
              boxShadow: '0 0 0 3px rgba(250,81,15,0.1)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: BRAND,
              borderWidth: 1.5,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: BRAND,
          },
        },
      },
    },
  },
});

// ─── Contact info cards data ──────────────────────────────────────────────────
const CONTACT_CARDS = [
  {
    icon: <PhoneIcon sx={{ fontSize: 20 }} />,
    titleKey: 'contact_card_phone_title' as const,
    line1Key: 'contact_card_phone_line1' as const,
    line2Key: 'contact_card_phone_line2' as const,
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: 'rgba(29,78,216,0.15)',
  },
  {
    icon: <EmailIcon sx={{ fontSize: 20 }} />,
    titleKey: 'contact_card_email_title' as const,
    line1Key: 'contact_card_email_line1' as const,
    line2Key: 'contact_card_email_line2' as const,
    color: BRAND,
    bg: BRAND_LIGHT,
    border: 'rgba(250,81,15,0.2)',
  },
  {
    icon: <LocationIcon sx={{ fontSize: 20 }} />,
    titleKey: 'contact_card_address_title' as const,
    line1Key: 'contact_card_address_line1' as const,
    line2Key: 'contact_card_address_line2' as const,
    color: '#065F46',
    bg: '#ECFDF5',
    border: 'rgba(6,95,70,0.15)',
  },
  {
    icon: <ClockIcon sx={{ fontSize: 20 }} />,
    titleKey: 'contact_card_hours_title' as const,
    line1Key: 'contact_card_hours_line1' as const,
    line2Key: 'contact_card_hours_line2' as const,
    color: '#92400E',
    bg: '#FFFBEB',
    border: 'rgba(146,64,14,0.15)',
  },
] as const;

const SUBJECT_OPTIONS = [
  'contact_subject_account',
  'contact_subject_loans',
  'contact_subject_cards',
  'contact_subject_investments',
  'contact_subject_fraud',
  'contact_subject_other',
] as const;

// ─── Decorative corner accent ─────────────────────────────────────────────────
function CornerAccent() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: { xs: 180, md: 320 },
        height: { xs: 180, md: 320 },
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: '0 0 0 100%',
        background: `radial-gradient(circle at top right, rgba(250,81,15,0.06) 0%, transparent 70%)`,
      }}
    />
  );
}

// ─── Info card ────────────────────────────────────────────────────────────────
function ContactCard({
  icon, titleKey, line1Key, line2Key, color, bg, border,
}: typeof CONTACT_CARDS[number]) {
  const { t } = useI18n();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2.5,
        borderRadius: 3,
        border: `1px solid ${border}`,
        bgcolor: bg,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 24px ${border}`,
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
          boxShadow: `0 2px 8px ${border}`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', mb: 0.5 }}>
          {t(titleKey)}
        </Typography>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>
          {t(line1Key)}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: '#64748B', mt: 0.25 }}>
          {t(line2Key)}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
const ContactSection = () => {
  const { t } = useI18n();

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
    setSnackOpen(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <ThemeProvider theme={contactTheme}>
      <Box
        component="section"
        id="contact"
        sx={{
          bgcolor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 7, md: 10 },
        }}
      >
        <CornerAccent />

        {/* Subtle bottom-left blob */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(250,81,15,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            px: { xs: 2.5, sm: 4, md: 6 },
            position: 'relative',
          }}
        >
          {/* ── Section header ── */}
          <Box sx={{ mb: { xs: 5, md: 7 }, maxWidth: 560 }}>
            {/* Label pill */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.75,
                py: 0.625,
                borderRadius: 10,
                bgcolor: BRAND_LIGHT,
                border: `1px solid rgba(250,81,15,0.2)`,
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: BRAND,
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.5, transform: 'scale(0.8)' },
                  },
                }}
              />
              <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: BRAND, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                {t('contact_pill_label')}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: { xs: 28, md: 36 },
                fontWeight: 800,
                color: '#0F172A',
                lineHeight: 1.15,
                letterSpacing: '-0.8px',
                mb: 1.5,
              }}
            >
              {t('contact_heading_line1')}{' '}
              <Box
                component="span"
                sx={{
                  color: BRAND,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    width: '100%',
                    height: 3,
                    bgcolor: BRAND,
                    borderRadius: 2,
                    opacity: 0.25,
                  },
                }}
              >
                {t('contact_heading_accent')}
              </Box>
            </Typography>

            <Typography sx={{ fontSize: 15, color: '#64748B', lineHeight: 1.7 }}>
              {t('contact_subheading')}
            </Typography>
          </Box>

          {/* ── Main flex row ── */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start' }}>

            {/* ── Left — info cards ── */}
            <Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
              <Stack spacing={2}>
                {CONTACT_CARDS.map((card) => (
                  <ContactCard key={card.titleKey} {...card} />
                ))}
              </Stack>
            </Box>

            {/* ── Right — form ── */}
            <Box sx={{ flex: '2 1 420px', minWidth: 0 }}>
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
                  p: { xs: 3, sm: 4 },
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${BRAND} 0%, ${BRAND_DARK} 60%, transparent 100%)`,
                  },
                }}
              >
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                  {t('contact_form_title')}
                </Typography>

                <Typography sx={{ fontSize: 13, color: '#94A3B8', mb: 3.5 }}>
                  {t('contact_form_subtitle')}
                </Typography>

                <Stack spacing={2.5}>

                  {/* Name + Email */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
                      <TextField
                        fullWidth
                        label={t('contact_field_name')}
                        value={form.name}
                        onChange={handleChange('name')}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ fontSize: 16, color: '#CBD5E1' }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
                      <TextField
                        fullWidth
                        label={t('contact_field_email')}
                        type="email"
                        value={form.email}
                        onChange={handleChange('email')}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon sx={{ fontSize: 16, color: '#CBD5E1' }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Subject */}
                  <TextField
                    fullWidth
                    select
                    label={t('contact_field_subject')}
                    value={form.subject}
                    onChange={handleChange('subject')}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SubjectIcon sx={{ fontSize: 16, color: '#CBD5E1' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  >
                    {SUBJECT_OPTIONS.map((key) => (
                      <MenuItem key={key} value={key} sx={{ fontSize: 14 }}>
                        {t(key)}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Message */}
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={7}
                    label={t('contact_field_message')}
                    value={form.message}
                    onChange={handleChange('message')}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                            <MessageIcon sx={{ fontSize: 16, color: '#CBD5E1' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  {/* Submit button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={submitted}
                    startIcon={submitted ? <CheckIcon /> : <SendIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      bgcolor: submitted ? '#10B981' : BRAND,
                      color: 'white',
                      py: 1.5,
                      borderRadius: 2.5,
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: '-0.1px',
                      boxShadow: submitted
                        ? '0 4px 14px rgba(16,185,129,0.35)'
                        : `0 4px 14px rgba(250,81,15,0.35)`,
                      transition: 'all .2s ease',
                      '&:hover': {
                        bgcolor: submitted ? '#059669' : BRAND_DARK,
                        boxShadow: submitted
                          ? '0 6px 20px rgba(16,185,129,0.45)'
                          : `0 6px 20px rgba(250,81,15,0.45)`,
                        transform: 'translateY(-1px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#10B981',
                        color: 'white',
                        opacity: 1,
                      },
                    }}
                  >
                    {submitted ? t('contact_btn_sent') : t('contact_btn_send')}
                  </Button>

                  <Typography sx={{ fontSize: 11.5, color: '#CBD5E1', textAlign: 'center' }}>
                    {t('contact_form_privacy_note')}
                  </Typography>

                </Stack>
              </Box>
            </Box>

          </Box>
        </Box>

        {/* Success snackbar */}
        <Snackbar
          open={snackOpen}
          autoHideDuration={5000}
          onClose={() => setSnackOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackOpen(false)}
            severity="success"
            icon={<CheckIcon />}
            sx={{
              bgcolor: '#0F172A',
              color: 'white',
              borderRadius: 2.5,
              fontSize: 13,
              '& .MuiAlert-icon': { color: '#10B981' },
              '& .MuiAlert-action .MuiIconButton-root': { color: '#64748B' },
            }}
          >
            {t('contact_success_message')}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ContactSection;