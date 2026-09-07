'use client';

import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon, ErrorOutlined as ErrorOutlineIcon } from '@mui/icons-material';
import { useSendCustomEmail } from '../../hooks/useAuth';

const ink = {
  900: '#0B1220',
  600: '#475569',
  400: '#94A3B8',
  200: '#E2E8F0',
  100: '#F1F5F9',
  50: '#F8FAFC',
};
const danger = { text: '#B91C1C', bg: '#FEF2F2' };
const BRAND = '#FA510F';
const BRAND_DARK = '#D94309';
const radius = { md: '12px', xl: '20px' };

export interface EmailableUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface SendEmailModalProps {
  open: boolean;
  users: EmailableUser[];
  /** Pre-selected user, e.g. when opened from a row action. Optional. */
  initialUser?: EmailableUser | null;
  onClose: () => void;
  onSent?: (message: string) => void;
}

export default function SendEmailModal({ open, users, initialUser = null, onClose, onSent }: SendEmailModalProps) {
  const [selectedUser, setSelectedUser] = useState<EmailableUser | null>(initialUser);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const sendEmail = useSendCustomEmail();

  const userOptions = useMemo(() => users, [users]);

  const resetAndClose = () => {
    setSelectedUser(initialUser);
    setSubject('');
    setMessage('');
    setError('');
    onClose();
  };

  const handleSend = async () => {
    if (!selectedUser) {
      setError('Select a user to send this email to');
      return;
    }
    if (!subject.trim()) {
      setError('Subject is required');
      return;
    }
    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    try {
      const result = await sendEmail.mutateAsync({
        userId: selectedUser.userId,
        subject: subject.trim(),
        message: message.trim(),
      });
      onSent?.(`Email sent to ${result.email}`);
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={sendEmail.isPending ? undefined : resetAndClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, bgcolor: '#fff', m: { xs: 1.5, sm: 3 } } } }}
    >
      <DialogContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1.4, alignItems: 'center' }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: '#FFF4F0', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <EmailIcon sx={{ fontSize: '1.1rem', color: BRAND }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: ink[900] }}>
                Send email
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: ink[400], mt: 0.2 }}>
                Compose a message to send to a user
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={resetAndClose} size="small" disabled={sendEmail.isPending}>
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        <Autocomplete
          options={userOptions}
          value={selectedUser}
          disabled={sendEmail.isPending || Boolean(initialUser)}
          getOptionLabel={(u) => `${u.firstName} ${u.lastName} (@${u.username})`}
          isOptionEqualToValue={(a, b) => a.userId === b.userId}
          onChange={(_, val) => {
            setSelectedUser(val);
            setError('');
          }}
          filterOptions={(options, state) => {
            const q = state.inputValue.trim().toLowerCase();
            if (!q) return options;
            return options.filter(
              (u) =>
                u.firstName.toLowerCase().includes(q) ||
                u.lastName.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.username.toLowerCase().includes(q)
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Recipient"
              placeholder="Search by name, email, or username…"
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.userId}>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: ink[900] }}>
                  {option.firstName} {option.lastName}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: ink[400] }}>
                  @{option.username} · {option.email}
                </Typography>
              </Box>
            </Box>
          )}
          sx={{ mb: 2.5 }}
        />

        <TextField
          fullWidth
          label="Subject"
          value={subject}
          disabled={sendEmail.isPending}
          onChange={(e) => { setSubject(e.target.value); setError(''); }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Message"
          placeholder="Write your message to this user…"
          value={message}
          disabled={sendEmail.isPending}
          onChange={(e) => { setMessage(e.target.value); setError(''); }}
          multiline
          minRows={6}
          helperText="Sent as a support-style email from Crown Ledger."
          sx={{ mb: 1 }}
        />

        {error && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.5 }}>
            <ErrorOutlineIcon sx={{ fontSize: '1rem', color: danger.text }} />
            <Typography sx={{ fontSize: '0.78rem', color: danger.text }}>{error}</Typography>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          disableElevation
          disabled={sendEmail.isPending}
          onClick={handleSend}
          startIcon={sendEmail.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : undefined}
          sx={{
            bgcolor: BRAND,
            color: '#fff',
            py: 1.5,
            borderRadius: radius.md,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': { bgcolor: BRAND_DARK },
            '&.Mui-disabled': { bgcolor: ink[200], color: '#fff' },
          }}
        >
          {sendEmail.isPending ? 'Sending…' : 'Send email'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}