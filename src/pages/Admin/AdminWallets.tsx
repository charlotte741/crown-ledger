'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  CurrencyBitcoin as BitcoinIcon,
  ErrorOutlined as ErrorOutlineIcon,
  Search as SearchIcon,
  ThumbDown as RejectIcon,
  ThumbUp as ApproveIcon,
} from '@mui/icons-material';
import {
  useWalletLookup,
  useCreditWallet,
  useAdminWithdrawals,
  useReviewWithdrawal,
  type AdminWithdrawalRequest,
  type WithdrawalStatus,
} from '../../hooks/useAuth';

// ─── Design tokens (matches AdminUsers.tsx) ─────────────────────────────────

const BRAND = '#FA510F';
const BRAND_DARK = '#D94309';
const BRAND_SOFT = '#FFF4F0';

const ink = {
  900: '#0B1220',
  700: '#0F172A',
  600: '#475569',
  400: '#94A3B8',
  300: '#CBD5E1',
  200: '#E2E8F0',
  100: '#F1F5F9',
  50: '#F8FAFC',
};

const success = { text: '#047857', bg: '#ECFDF5', border: '#A7F3D0' };
const danger = { text: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' };
// const violet = { text: '#5B4FE9', bg: '#F3F2FF', border: '#DCD9FC' };
const amber = { text: '#92400E', bg: '#FFFBEB', border: '#FDE68A' };

const radius = { sm: '10px', md: '12px', lg: '16px', xl: '20px' };
const shadow = {
  card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 0 rgba(15,23,42,0.03)',
  raised: '0 10px 30px rgba(15,23,42,0.10)',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMoney(value: number | null | undefined, currency = '$') {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

const AVATAR_PALETTE = [
  { bg: '#FFE8DE', fg: BRAND_DARK },
  { bg: '#E4E1FF', fg: '#4C3FD9' },
  { bg: '#DCF3EC', fg: '#0F7A5C' },
  { bg: '#E1EEFB', fg: '#1D6FB8' },
  { bg: '#FBE7F0', fg: '#B23A73' },
  { bg: '#FDF1D6', fg: '#9A6A00' },
];
function avatarStyle(id: string) {
  const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

const STATUS_STYLES: Record<WithdrawalStatus, { bg: string; text: string }> = {
  pending: { bg: amber.bg, text: amber.text },
  approved: { bg: success.bg, text: success.text },
  rejected: { bg: danger.bg, text: danger.text },
};

function StatusChip({ status }: { status: WithdrawalStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <Chip
      size="small"
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      sx={{ bgcolor: style.bg, color: style.text, fontWeight: 700, fontSize: '0.68rem', height: 22 }}
    />
  );
}

// ─── Debounce hook ───────────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ─── Credit Wallet Card ──────────────────────────────────────────────────────

function CreditWalletCard({ onSuccess }: { onSuccess: (message: string) => void }) {
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const debouncedAccountNumber = useDebouncedValue(accountNumberInput.trim(), 500);

  const { data: lookupResult, isFetching: lookupLoading, isError: lookupFailed, error: lookupError } =
    useWalletLookup(debouncedAccountNumber);

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  const creditWallet = useCreditWallet();

  const numAmount = parseFloat(amount);
  const isValidAmount = amount !== '' && !isNaN(numAmount) && numAmount !== 0;
  const canSubmit = Boolean(lookupResult) && isValidAmount && reason.trim().length > 0;

  const handleSubmit = async () => {
    if (!lookupResult) {
      setFormError('Look up a valid account number first');
      return;
    }
    if (!isValidAmount) {
      setFormError('Enter a non-zero amount');
      return;
    }
    if (!reason.trim()) {
      setFormError('A reason is required for the audit log');
      return;
    }

    setFormError('');
    try {
      const result = await creditWallet.mutateAsync({
        accountNumber: lookupResult.accountNumber,
        amount: numAmount,
        reason: reason.trim(),
      });
      onSuccess(
        `${numAmount >= 0 ? 'Credited' : 'Debited'} ${formatMoney(Math.abs(numAmount), lookupResult.currency)} — new balance ${formatMoney(result.balanceAfter, lookupResult.currency)}`
      );
      setAccountNumberInput('');
      setAmount('');
      setReason('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to credit wallet');
    }
  };

  return (
    <Card
      elevation={0}
      sx={{ p: 2.5, borderRadius: radius.lg, border: `1px solid ${ink[200]}`, boxShadow: shadow.card }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
        <Box sx={{ width: 38, height: 38, borderRadius: radius.sm, bgcolor: BRAND_SOFT, display: 'grid', placeItems: 'center' }}>
          <WalletIcon sx={{ fontSize: '1.1rem', color: BRAND }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: ink[900] }}>
            Credit a wallet
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: ink[400] }}>
            Enter an account number to find the holder, then send funds.
          </Typography>
        </Box>
      </Box>

      <TextField
        fullWidth
        label="Account number"
        placeholder="e.g. 1234567890"
        value={accountNumberInput}
        onChange={(e) => {
          setAccountNumberInput(e.target.value.replace(/\D/g, ''));
          setFormError('');
        }}
        sx={{ mb: 1.5 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1.05rem', color: ink[400] }} />
              </InputAdornment>
            ),
            endAdornment: lookupLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : undefined,
          },
        }}
      />

      {/* Lookup result / error */}
      {debouncedAccountNumber.length >= 10 && !lookupLoading && lookupResult && (
        <Box
          sx={{
            mb: 2.5,
            p: 1.5,
            borderRadius: radius.md,
            bgcolor: success.bg,
            border: `1px solid ${success.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
          }}
        >
          <Avatar sx={{ ...avatarStyle(lookupResult.user.userId), width: 36, height: 36, fontSize: '0.78rem', fontWeight: 800 }}>
            {initials(lookupResult.user.firstName, lookupResult.user.lastName)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: ink[900] }}>
              {lookupResult.user.fullName}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: ink[600] }}>
              @{lookupResult.user.username} · Balance {formatMoney(lookupResult.balance, lookupResult.currency)}
            </Typography>
          </Box>
          <CheckIcon sx={{ color: success.text, fontSize: '1.2rem' }} />
        </Box>
      )}

      {debouncedAccountNumber.length >= 10 && !lookupLoading && lookupFailed && (
        <Alert severity="error" sx={{ borderRadius: radius.md, mb: 2.5, fontSize: '0.8rem' }}>
          {lookupError instanceof Error ? lookupError.message : 'Account not found'}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Amount"
        type="number"
        placeholder="Positive to credit, negative to debit"
        value={amount}
        disabled={!lookupResult}
        onChange={(e) => { setAmount(e.target.value); setFormError(''); }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Reason"
        placeholder="e.g. Manual top-up, correction"
        value={reason}
        disabled={!lookupResult}
        onChange={(e) => { setReason(e.target.value); setFormError(''); }}
        helperText="Recorded on this user's account history."
        sx={{ mb: 1.5 }}
      />

      {formError && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.5 }}>
          <ErrorOutlineIcon sx={{ fontSize: '1rem', color: danger.text }} />
          <Typography sx={{ fontSize: '0.78rem', color: danger.text }}>{formError}</Typography>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        disableElevation
        disabled={!canSubmit || creditWallet.isPending}
        onClick={handleSubmit}
        startIcon={creditWallet.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : undefined}
        sx={{
          bgcolor: BRAND,
          color: '#fff',
          py: 1.5,
          borderRadius: radius.md,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: '0.9rem',
          '&:hover': { bgcolor: BRAND_DARK },
          '&.Mui-disabled': { bgcolor: ink[300], color: '#fff' },
        }}
      >
        {creditWallet.isPending ? 'Processing…' : 'Submit'}
      </Button>
    </Card>
  );
}

// ─── Review Withdrawal Dialog ────────────────────────────────────────────────

function ReviewWithdrawalDialog({
  open,
  withdrawal,
  decision,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  withdrawal: AdminWithdrawalRequest | null;
  decision: 'approve' | 'reject' | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');

  const resetAndClose = () => {
    setNote('');
    onClose();
  };

  if (!withdrawal || !decision) return null;

  const isApprove = decision === 'approve';
  const accentColor = isApprove ? success : danger;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : resetAndClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, bgcolor: '#fff', m: { xs: 1.5, sm: 3 } } } }}
    >
      <DialogContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1.4, alignItems: 'center' }}>
            <Box sx={{ width: 38, height: 38, borderRadius: radius.sm, bgcolor: accentColor.bg, display: 'grid', placeItems: 'center' }}>
              {isApprove ? (
                <ApproveIcon sx={{ fontSize: '1.1rem', color: accentColor.text }} />
              ) : (
                <RejectIcon sx={{ fontSize: '1.1rem', color: accentColor.text }} />
              )}
            </Box>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: ink[900] }}>
              {isApprove ? 'Approve withdrawal' : 'Reject withdrawal'}
            </Typography>
          </Box>
          <IconButton onClick={resetAndClose} size="small" disabled={isSubmitting}>
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2, p: 1.5, borderRadius: radius.md, bgcolor: ink[50], border: `1px solid ${ink[100]}` }}>
          <Typography sx={{ fontSize: '0.8rem', color: ink[600], mb: 0.5 }}>
            <strong>{withdrawal.userId.firstName} {withdrawal.userId.lastName}</strong> ·{' '}
            {formatMoney(withdrawal.amount, withdrawal.walletId.currency)}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: ink[400], fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {withdrawal.bitcoinAddress}
          </Typography>
        </Box>

        {isApprove && withdrawal.walletId.balance < withdrawal.amount && (
          <Alert severity="warning" sx={{ borderRadius: radius.md, mb: 2, fontSize: '0.8rem' }}>
            This wallet's balance ({formatMoney(withdrawal.walletId.balance, withdrawal.walletId.currency)}) is lower than the requested amount.
          </Alert>
        )}

        <TextField
          fullWidth
          label="Note (optional)"
          placeholder={isApprove ? 'e.g. Verified and processed' : 'e.g. Address could not be verified'}
          value={note}
          disabled={isSubmitting}
          onChange={(e) => setNote(e.target.value)}
          multiline
          minRows={2}
          sx={{ mb: 2.5 }}
        />

        <Button
          variant="contained"
          fullWidth
          disableElevation
          disabled={isSubmitting}
          onClick={() => onConfirm(note.trim())}
          startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : undefined}
          sx={{
            bgcolor: accentColor.text,
            color: '#fff',
            py: 1.5,
            borderRadius: radius.md,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': { bgcolor: isApprove ? '#065F46' : '#991B1B' },
          }}
        >
          {isSubmitting ? 'Submitting…' : isApprove ? 'Confirm approval' : 'Confirm rejection'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Withdrawal Row ──────────────────────────────────────────────────────────

function WithdrawalRow({
  withdrawal,
  onApprove,
  onReject,
  onCopyAddress,
}: {
  withdrawal: AdminWithdrawalRequest;
  onApprove: () => void;
  onReject: () => void;
  onCopyAddress: () => void;
}) {
  const avatar = avatarStyle(withdrawal.userId._id);

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: radius.lg,
        border: `1px solid ${ink[200]}`,
        boxShadow: shadow.card,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.4,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', minWidth: 0 }}>
          <Avatar sx={{ bgcolor: avatar.bg, color: avatar.fg, width: 38, height: 38, fontSize: '0.78rem', fontWeight: 800 }}>
            {initials(withdrawal.userId.firstName, withdrawal.userId.lastName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: ink[900], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {withdrawal.userId.firstName} {withdrawal.userId.lastName}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: ink[400] }}>
              {withdrawal.walletId.accountNumber} · {formatDateTime(withdrawal.createdAt)}
            </Typography>
          </Box>
        </Box>
        <StatusChip status={withdrawal.status} />
      </Box>

      <Divider sx={{ borderColor: ink[100] }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: ink[900] }}>
          {formatMoney(withdrawal.amount, withdrawal.walletId.currency)}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
          <BitcoinIcon sx={{ fontSize: '0.95rem', color: ink[400] }} />
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: ink[600],
              fontFamily: 'monospace',
              maxWidth: 180,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {withdrawal.bitcoinAddress}
          </Typography>
          <Tooltip title="Copy address">
            <IconButton size="small" onClick={onCopyAddress}>
              <CopyIcon sx={{ fontSize: '0.9rem', color: ink[400] }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {withdrawal.status !== 'pending' && (
        <Box sx={{ p: 1.2, borderRadius: radius.sm, bgcolor: ink[50] }}>
          <Typography sx={{ fontSize: '0.72rem', color: ink[600] }}>
            {withdrawal.status === 'approved' ? 'Approved' : 'Rejected'}
            {withdrawal.reviewedAt ? ` on ${formatDateTime(withdrawal.reviewedAt)}` : ''}
            {withdrawal.reviewNote ? ` — "${withdrawal.reviewNote}"` : ''}
          </Typography>
        </Box>
      )}

      {withdrawal.status === 'pending' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onReject}
            startIcon={<RejectIcon sx={{ fontSize: '1rem' }} />}
            sx={{
              borderRadius: radius.md,
              textTransform: 'none',
              fontWeight: 700,
              borderColor: danger.border,
              color: danger.text,
              '&:hover': { borderColor: danger.text, bgcolor: danger.bg },
            }}
          >
            Reject
          </Button>
          <Button
            fullWidth
            variant="contained"
            disableElevation
            onClick={onApprove}
            startIcon={<ApproveIcon sx={{ fontSize: '1rem' }} />}
            sx={{
              borderRadius: radius.md,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: success.text,
              '&:hover': { bgcolor: '#065F46' },
            }}
          >
            Approve
          </Button>
        </Box>
      )}
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS: { label: string; value: WithdrawalStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function AdminWallets() {
  const [tab, setTab] = useState<WithdrawalStatus>('pending');
  const { data, isLoading, isError } = useAdminWithdrawals(tab, 1, 50);
  const reviewWithdrawal = useReviewWithdrawal();

  const [dialogWithdrawal, setDialogWithdrawal] = useState<AdminWithdrawalRequest | null>(null);
  const [dialogDecision, setDialogDecision] = useState<'approve' | 'reject' | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const withdrawals = data?.data ?? [];

  const openReviewDialog = (withdrawal: AdminWithdrawalRequest, decision: 'approve' | 'reject') => {
    setDialogWithdrawal(withdrawal);
    setDialogDecision(decision);
  };

  const closeReviewDialog = () => {
    setDialogWithdrawal(null);
    setDialogDecision(null);
  };

  const handleConfirmReview = async (note: string) => {
    if (!dialogWithdrawal || !dialogDecision) return;
    try {
      await reviewWithdrawal.mutateAsync({
        withdrawalId: dialogWithdrawal._id,
        decision: dialogDecision,
        note: note || undefined,
      });
      setSnackbar({
        open: true,
        message: `Withdrawal request ${dialogDecision === 'approve' ? 'approved' : 'rejected'}`,
        severity: 'success',
      });
      closeReviewDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Something went wrong',
        severity: 'error',
      });
    }
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setSnackbar({ open: true, message: 'Bitcoin address copied', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Could not copy address', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 0, fontFamily: 'inherit' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink[400], textTransform: 'uppercase', letterSpacing: '0.6px', mb: 0.6 }}>
          Admin · Wallets
        </Typography>
        <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' }, fontWeight: 900, color: ink[900], letterSpacing: '-0.02em' }}>
          Wallets & Withdrawals
        </Typography>
        <Typography sx={{ fontSize: '0.92rem', color: ink[600], mt: 0.4 }}>
          Credit user wallets directly, and review pending Bitcoin withdrawal requests.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '380px 1fr' }, gap: 3, alignItems: 'flex-start' }}>
        {/* Left: Credit wallet */}
        <CreditWalletCard onSuccess={(message) => setSnackbar({ open: true, message, severity: 'success' })} />

        {/* Right: Withdrawals */}
        <Box>
          <Tabs
            value={tab}
            onChange={(_, val) => setTab(val)}
            sx={{
              mb: 2.5,
              minHeight: 'unset',
              '& .MuiTabs-indicator': { bgcolor: BRAND, height: 3, borderRadius: 3 },
            }}
          >
            {TABS.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                label={t.label}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  minHeight: 'unset',
                  color: ink[400],
                  '&.Mui-selected': { color: BRAND },
                }}
              />
            ))}
          </Tabs>

          {isError && (
            <Alert severity="error" sx={{ borderRadius: radius.md, mb: 2 }}>
              Failed to load withdrawal requests.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`skeleton-${i}`} variant="rounded" height={150} sx={{ borderRadius: radius.lg }} />
              ))}

            {!isLoading && !isError && withdrawals.length === 0 && (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: ink[100], display: 'grid', placeItems: 'center' }}>
                  <BitcoinIcon sx={{ fontSize: '1.2rem', color: ink[400] }} />
                </Box>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: ink[700] }}>
                  No {tab} withdrawal requests
                </Typography>
              </Box>
            )}

            {!isLoading &&
              withdrawals.map((w) => (
                <WithdrawalRow
                  key={w._id}
                  withdrawal={w}
                  onApprove={() => openReviewDialog(w, 'approve')}
                  onReject={() => openReviewDialog(w, 'reject')}
                  onCopyAddress={() => handleCopyAddress(w.bitcoinAddress)}
                />
              ))}
          </Box>
        </Box>
      </Box>

      <ReviewWithdrawalDialog
        open={Boolean(dialogWithdrawal)}
        withdrawal={dialogWithdrawal}
        decision={dialogDecision}
        isSubmitting={reviewWithdrawal.isPending}
        onClose={closeReviewDialog}
        onConfirm={handleConfirmReview}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          iconMapping={{ success: <CheckIcon fontSize="inherit" />, error: <ErrorOutlineIcon fontSize="inherit" /> }}
          sx={{ borderRadius: radius.md, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}