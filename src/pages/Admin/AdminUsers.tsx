/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useState } from 'react';
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
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowUpward as ArrowUpIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  ErrorOutlined as ErrorOutlineIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Remove as RemoveIcon,
  Savings as SavingsIcon,
  Search as SearchIcon,
  SwapVert as SwapVertIcon,
  Tune as TuneIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import {
  useAdminUsersBalances,
  useUpdateSavingsBalance,
  useGetUserBalanceDetails,
  useUpdateUserInvestmentBalance,
} from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SendEmailModal, { type EmailableUser } from './SendEmailModal'; // adjust path to match your structure

// ─── Design tokens ───────────────────────────────────────────────────────────

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
const violet = { text: '#5B4FE9', bg: '#F3F2FF', border: '#DCD9FC' };

const radius = { sm: '10px', md: '12px', lg: '16px', xl: '20px' };
const shadow = {
  card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 0 rgba(15,23,42,0.03)',
  raised: '0 10px 30px rgba(15,23,42,0.10)',
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface InvestmentBalance {
  totalInvested: number;
  portfolioValue: number;
  totalGains: number;
  avgReturn: number;
  activePlans: number;
}

interface SavingsBalance {
  balance: number;
  targetAmount: number;
  totalInterestEarned: number;
  monthlyInterest: number;
  activePlans: number;
  completedPlans: number;
}

interface AdminUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  createdAt: string;
  investmentBalance: InvestmentBalance;
  savingsBalance: SavingsBalance;
  totalBalance: number;
}

// ── Balance-details endpoint types (admin/user/:id/balance-details) ─────────

interface BalanceDetailsUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  accountType: string;
  currency: string;
  createdAt: string;
}

interface InvestmentDetailItem {
  investmentId: string;
  planName: string;
  amountInvested: number;
  currentValue: number;
  totalGain: number;
  status: string;
  investmentDate: string;
  maturityDate: string;
}

interface InvestmentsSection {
  summary: {
    totalInvested: number;
    activePlans: number;
    portfolioValue: number;
    totalGains: number;
    avgReturn: number;
    lastUpdated: string;
  };
  count: number;
  details: InvestmentDetailItem[];
}

interface SavingsPlanItem {
  _id: string;
  userId: string;
  planName: string;
  category: string | null;
  targetAmount: number;
  currentAmount: number;
  earnInterest: boolean;
  interestRate: number;
  duration: number | null;
  frequency: string | null;
  startDate: string;
  endDate: string | null;
  nextDepositDueDate: string | null;
  status: string;
  totalInterestEarned: number;
  progressPercentage: number;
  expectedInterest: number;
  isDefault: boolean;
  transactions: string[];
  createdAt: string;
  updatedAt: string;
}

interface SavingsDetailItem {
  planId: string;
  planName: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  earnInterest: boolean;
  totalInterestEarned: number;
}

interface SavingsSection {
  summary: {
    balance: number;
    targetAmount: number;
    totalInterestEarned: number;
    monthlyInterest: number;
    apy: number;
    activePlans: number;
    completedPlans: number;
    totalPlans: number;
    plans: SavingsPlanItem[];
  };
  count: number;
  details: SavingsDetailItem[];
}

interface UserBalanceDetails {
  user: BalanceDetailsUser;
  investments: InvestmentsSection;
  savings: SavingsSection;
}

type SortKey = 'name' | 'createdAt' | 'investment' | 'savings' | 'total';
type SortDirection = 'asc' | 'desc';
type InvestmentAction = 'add' | 'subtract' | 'set';

const PAGE_SIZE = 20;
const SKELETON_CARDS = 8;

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Name',
  createdAt: 'Date joined',
  investment: 'Investment balance',
  savings: 'Savings balance',
  total: 'Total balance',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined) {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRelative(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function fullName(u: AdminUser) {
  return `${u.firstName} ${u.lastName}`;
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

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: success.bg, text: success.text },
  completed: { bg: violet.bg, text: violet.text },
  pending: { bg: '#FFFBEB', text: '#92400E' },
  cancelled: { bg: danger.bg, text: danger.text },
};

function StatusChip({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { bg: ink[100], text: ink[600] };
  return (
    <Chip
      size="small"
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      sx={{ bgcolor: style.bg, color: style.text, fontWeight: 700, fontSize: '0.65rem', height: 20, textTransform: 'capitalize' }}
    />
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  loading,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  loading?: boolean;
}) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: radius.lg,
        bgcolor: '#fff',
        border: `1px solid ${ink[200]}`,
        boxShadow: shadow.card,
        flex: '1 1 220px',
        minWidth: 0,
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        '&:hover': { boxShadow: shadow.raised, transform: 'translateY(-1px)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.75 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: radius.sm,
            bgcolor: bg,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: '1.05rem', color }} />
        </Box>
        <Typography sx={{ fontSize: '0.78rem', color: ink[600], fontWeight: 600 }}>{label}</Typography>
      </Box>
      {loading ? (
        <Skeleton variant="text" width="70%" height={34} sx={{ mb: 0.4 }} />
      ) : (
        <Typography sx={{ fontSize: '1.55rem', fontWeight: 800, color: ink[900], mb: 0.4, letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
          {value}
        </Typography>
      )}
      <Typography sx={{ fontSize: '0.72rem', color: ink[400] }}>{sub}</Typography>
    </Box>
  );
}

// ─── Update Savings Balance Modal ───────────────────────────────────────────

interface UpdateSavingsModalProps {
  open: boolean;
  user: AdminUser | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { userId: string; action: 'add' | 'subtract'; amount: number; reason: string }) => Promise<void>;
}

function UpdateSavingsModal({ open, user, isSubmitting, onClose, onSubmit }: UpdateSavingsModalProps) {
  const [action, setAction] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const resetAndClose = () => {
    setAction('add');
    setAmount('');
    setReason('');
    setError('');
    setConfirming(false);
    onClose();
  };

  const numAmount = parseFloat(amount);
  const isValidAmount = amount !== '' && !isNaN(numAmount) && numAmount > 0;
  const projectedBalance = user
    ? action === 'add'
      ? user.savingsBalance.balance + (isValidAmount ? numAmount : 0)
      : user.savingsBalance.balance - (isValidAmount ? numAmount : 0)
    : 0;
  const wouldOverdraw = action === 'subtract' && projectedBalance < 0;

  const validate = () => {
    if (!isValidAmount) {
      setError('Enter a valid amount greater than 0');
      return false;
    }
    if (!reason.trim()) {
      setError('A reason is required for the audit log');
      return false;
    }
    if (wouldOverdraw) {
      setError('Amount exceeds the current balance');
      return false;
    }
    return true;
  };

  const handlePrimaryAction = async () => {
    if (!validate() || !user) return;
    if (action === 'subtract' && !confirming) {
      setConfirming(true);
      return;
    }
    try {
      await onSubmit({ userId: user.userId, action, amount: numAmount, reason: reason.trim() });
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setConfirming(false);
    }
  };

  if (!user) return null;

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
            <Box sx={{ width: 38, height: 38, borderRadius: radius.sm, bgcolor: success.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <SavingsIcon sx={{ fontSize: '1.1rem', color: success.text }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: ink[900] }}>
                Update savings balance
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: ink[400], mt: 0.2 }}>
                {fullName(user)} · @{user.username}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={resetAndClose} size="small" aria-label="Close dialog" disabled={isSubmitting}>
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2.5, p: 1.5, borderRadius: radius.md, bgcolor: ink[50], border: `1px solid ${ink[100]}` }}>
          <Typography sx={{ fontSize: '0.68rem', color: ink[400], mb: 0.4, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>
            Current savings balance
          </Typography>
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: ink[900] }}>
            {formatCurrency(user.savingsBalance.balance)}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink[600], mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Action
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={action}
          disabled={isSubmitting}
          onChange={(_, val) => {
            if (!val) return;
            setAction(val);
            setConfirming(false);
            setError('');
          }}
          sx={{ mb: 2.5 }}
        >
          <ToggleButton
            value="add"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: `${radius.md} !important`,
              gap: 0.7,
              py: 1.2,
              color: ink[600],
              borderColor: ink[200],
              '&.Mui-selected': { bgcolor: success.bg, color: success.text, borderColor: success.border },
            }}
          >
            <AddIcon sx={{ fontSize: '1rem' }} /> Add funds
          </ToggleButton>
          {/* <ToggleButton
            value="subtract"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: `${radius.md} !important`,
              gap: 0.7,
              py: 1.2,
              color: ink[600],
              borderColor: ink[200],
              '&.Mui-selected': { bgcolor: danger.bg, color: danger.text, borderColor: danger.border },
            }}
          >
            <RemoveIcon sx={{ fontSize: '1rem' }} /> Subtract funds
          </ToggleButton> */}
        </ToggleButtonGroup>

        <TextField
          fullWidth
          label="Amount (USD)"
          type="number"
          value={amount}
          disabled={isSubmitting}
          onChange={(e) => {
            setAmount(e.target.value);
            setError('');
            setConfirming(false);
          }}
          sx={{ mb: 2 }}
          slotProps={{
            htmlInput: { min: 0, step: '0.01' },
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          }}
        />

        <TextField
          fullWidth
          label="Reason"
          placeholder="e.g. Bonus, correction, manual deposit"
          value={reason}
          disabled={isSubmitting}
          onChange={(e) => { setReason(e.target.value); setError(''); setConfirming(false); }}
          helperText="Recorded on this user's account history."
          sx={{ mb: 1 }}
        />

        {error && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.5 }}>
            <ErrorOutlineIcon sx={{ fontSize: '1rem', color: danger.text }} />
            <Typography sx={{ fontSize: '0.78rem', color: danger.text }}>{error}</Typography>
          </Box>
        )}

        {isValidAmount && (
          <Box
            sx={{
              mb: 2.5,
              p: 1.5,
              borderRadius: radius.md,
              bgcolor: action === 'add' ? success.bg : danger.bg,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', color: action === 'add' ? success.text : danger.text, fontWeight: 600 }}>
              New balance
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: action === 'add' ? success.text : danger.text }}>
              {formatCurrency(Math.max(projectedBalance, 0))}
            </Typography>
          </Box>
        )}

        {confirming && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: radius.md, bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>
              Confirm: subtract {isValidAmount ? formatCurrency(numAmount) : '$0.00'} from {user.firstName}&apos;s savings?
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.2 }}>
          {confirming && (
            <Button
              variant="outlined"
              onClick={() => setConfirming(false)}
              disabled={isSubmitting}
              sx={{ borderRadius: radius.md, textTransform: 'none', fontWeight: 700, borderColor: ink[200], color: ink[600] }}
            >
              Back
            </Button>
          )}
          <Button
            variant="contained"
            fullWidth
            onClick={handlePrimaryAction}
            disableElevation
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : undefined}
            sx={{
              bgcolor: action === 'add' ? BRAND : (confirming ? danger.text : ink[900]),
              color: '#fff',
              py: 1.5,
              borderRadius: radius.md,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: action === 'add' ? BRAND_DARK : (confirming ? '#991B1B' : ink[700]) },
              '&.Mui-disabled': { bgcolor: ink[300], color: '#fff' },
            }}
          >
            {isSubmitting ? 'Saving…' : action === 'add' ? 'Add funds' : confirming ? 'Confirm subtraction' : 'Continue'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Update Investment Balance Modal ────────────────────────────────────────

interface UpdateInvestmentModalProps {
  open: boolean;
  user: AdminUser | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    userId: string;
    action: InvestmentAction;
    amount: number;
    reason: string;
    investmentId?: string;
  }) => Promise<void>;
}

function UpdateInvestmentModal({ open, user, isSubmitting, onClose, onSubmit }: UpdateInvestmentModalProps) {
  const [action, setAction] = useState<InvestmentAction>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [investmentId, setInvestmentId] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  // Fetch this user's investment plans so the plan picker is always populated,
  // regardless of whether the modal was opened from the details dialog or the row menu.
  const { data: balanceDetails, isLoading: plansLoading, isError: plansError } = useGetUserBalanceDetails(
    open ? user?.userId ?? undefined : undefined
  ) as { data?: UserBalanceDetails; isLoading: boolean; isError: boolean };
  const plans = balanceDetails?.investments.details ?? [];

  const resetAndClose = () => {
    setAction('add');
    setAmount('');
    setReason('');
    setInvestmentId('');
    setError('');
    setConfirming(false);
    onClose();
  };

  const numAmount = parseFloat(amount);
  const isValidAmount =
    amount !== '' && !isNaN(numAmount) && numAmount >= 0 && (action === 'set' ? true : numAmount > 0);
  const selectedPlan = investmentId ? plans.find((p) => p.investmentId === investmentId) : undefined;
  const currentValue = selectedPlan ? selectedPlan.currentValue : user?.investmentBalance.portfolioValue ?? 0;

  const projectedBalance = !isValidAmount
    ? currentValue
    : action === 'add'
    ? currentValue + numAmount
    : action === 'subtract'
    ? currentValue - numAmount
    : numAmount;

  const wouldOverdraw = action === 'subtract' && projectedBalance < 0;
  const needsConfirmation = action === 'subtract' || action === 'set';

  const validate = () => {
    if (!isValidAmount) {
      setError(action === 'set' ? 'Enter a valid balance amount' : 'Enter a valid amount greater than 0');
      return false;
    }
    if (!reason.trim()) {
      setError('A reason is required for the audit log');
      return false;
    }
    if (wouldOverdraw) {
      setError('Amount exceeds the current portfolio value');
      return false;
    }
    return true;
  };

  const handlePrimaryAction = async () => {
    if (!validate() || !user) return;
    if (needsConfirmation && !confirming) {
      setConfirming(true);
      return;
    }
    try {
      await onSubmit({
        userId: user.userId,
        action,
        amount: numAmount,
        reason: reason.trim(),
        investmentId: investmentId.trim() || undefined,
      });
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setConfirming(false);
    }
  };

  if (!user) return null;

  const actionColor = action === 'add' ? success : action === 'subtract' ? danger : violet;
  const primaryBg = action === 'add' ? BRAND : confirming ? danger.text : ink[900];
  const primaryHoverBg = action === 'add' ? BRAND_DARK : confirming ? '#991B1B' : ink[700];

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
            <Box sx={{ width: 38, height: 38, borderRadius: radius.sm, bgcolor: violet.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <TrendingUpIcon sx={{ fontSize: '1.1rem', color: violet.text }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: ink[900] }}>
                Update investment balance
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: ink[400], mt: 0.2 }}>
                {fullName(user)} · @{user.username}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={resetAndClose} size="small" aria-label="Close dialog" disabled={isSubmitting}>
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2.5, p: 1.5, borderRadius: radius.md, bgcolor: ink[50], border: `1px solid ${ink[100]}` }}>
          <Typography sx={{ fontSize: '0.68rem', color: ink[400], mb: 0.4, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 700 }}>
            {selectedPlan ? `Current value · ${selectedPlan.planName}` : 'Current portfolio value'}
          </Typography>
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: ink[900] }}>
            {formatCurrency(currentValue)}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink[600], mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Target
        </Typography>
        <FormControl fullWidth disabled={isSubmitting || plansLoading} sx={{ mb: 0.6 }}>
          <InputLabel id="investment-plan-select-label">Plan</InputLabel>
          <Select
            labelId="investment-plan-select-label"
            label="Plan"
            value={investmentId}
            onChange={(e) => {
              setInvestmentId(e.target.value as string);
              setError('');
              setConfirming(false);
            }}
            sx={{ borderRadius: radius.md }}
          >
            <MenuItem value="">
              <em>Overall portfolio value</em>
            </MenuItem>
            {plans.map((p) => (
              <MenuItem key={p.investmentId} value={p.investmentId}>
                {p.planName} — {formatCurrency(p.currentValue)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography sx={{ fontSize: '0.72rem', color: ink[400], mb: 2, ml: 0.2 }}>
          {plansLoading
            ? 'Loading this user\u2019s plans…'
            : plansError
            ? "Couldn't load plans — you can still apply the update to the overall portfolio."
            : plans.length === 0
            ? 'This user has no investment plans yet — the update will apply to the overall portfolio.'
            : 'Pick a specific plan, or leave it on the overall portfolio.'}
        </Typography>

        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink[600], mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Action
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={action}
          disabled={isSubmitting}
          onChange={(_, val) => {
            if (!val) return;
            setAction(val);
            setConfirming(false);
            setError('');
          }}
          sx={{ mb: 2.5 }}
        >
          <ToggleButton
            value="add"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: `${radius.md} !important`,
              gap: 0.7,
              py: 1.2,
              color: ink[600],
              borderColor: ink[200],
              '&.Mui-selected': { bgcolor: success.bg, color: success.text, borderColor: success.border },
            }}
          >
            <AddIcon sx={{ fontSize: '1rem' }} /> Add
          </ToggleButton>
          <ToggleButton
            value="subtract"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: `${radius.md} !important`,
              gap: 0.7,
              py: 1.2,
              color: ink[600],
              borderColor: ink[200],
              '&.Mui-selected': { bgcolor: danger.bg, color: danger.text, borderColor: danger.border },
            }}
          >
            <RemoveIcon sx={{ fontSize: '1rem' }} /> Subtract
          </ToggleButton>
          <ToggleButton
            value="set"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: `${radius.md} !important`,
              gap: 0.7,
              py: 1.2,
              color: ink[600],
              borderColor: ink[200],
              '&.Mui-selected': { bgcolor: violet.bg, color: violet.text, borderColor: violet.border },
            }}
          >
            <TuneIcon sx={{ fontSize: '1rem' }} /> Set
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          fullWidth
          label={action === 'set' ? 'New balance (USD)' : 'Amount (USD)'}
          type="number"
          value={amount}
          disabled={isSubmitting}
          onChange={(e) => {
            setAmount(e.target.value);
            setError('');
            setConfirming(false);
          }}
          sx={{ mb: 2 }}
          slotProps={{
            htmlInput: { min: 0, step: '0.01' },
            input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          }}
        />

        <TextField
          fullWidth
          label="Reason"
          placeholder="e.g. Correction, manual adjustment, bonus"
          value={reason}
          disabled={isSubmitting}
          onChange={(e) => { setReason(e.target.value); setError(''); setConfirming(false); }}
          helperText="Recorded on this user's account history."
          sx={{ mb: 1 }}
        />

        {error && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.5 }}>
            <ErrorOutlineIcon sx={{ fontSize: '1rem', color: danger.text }} />
            <Typography sx={{ fontSize: '0.78rem', color: danger.text }}>{error}</Typography>
          </Box>
        )}

        {isValidAmount && (
          <Box
            sx={{
              mb: 2.5,
              p: 1.5,
              borderRadius: radius.md,
              bgcolor: actionColor.bg,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.78rem', color: actionColor.text, fontWeight: 600 }}>
              {action === 'set' ? 'Balance will be set to' : 'New balance'}
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: actionColor.text }}>
              {formatCurrency(Math.max(projectedBalance, 0))}
            </Typography>
          </Box>
        )}

        {confirming && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: radius.md, bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>
              {action === 'subtract'
                ? `Confirm: subtract ${isValidAmount ? formatCurrency(numAmount) : '$0.00'} from ${user.firstName}'s ${selectedPlan ? `"${selectedPlan.planName}" plan` : 'investment balance'}?`
                : `Confirm: set ${user.firstName}'s ${selectedPlan ? `"${selectedPlan.planName}" plan` : 'investment balance'} to ${isValidAmount ? formatCurrency(numAmount) : '$0.00'}?`}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.2 }}>
          {confirming && (
            <Button
              variant="outlined"
              onClick={() => setConfirming(false)}
              disabled={isSubmitting}
              sx={{ borderRadius: radius.md, textTransform: 'none', fontWeight: 700, borderColor: ink[200], color: ink[600] }}
            >
              Back
            </Button>
          )}
          <Button
            variant="contained"
            fullWidth
            onClick={handlePrimaryAction}
            disableElevation
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : undefined}
            sx={{
              bgcolor: primaryBg,
              color: '#fff',
              py: 1.5,
              borderRadius: radius.md,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: primaryHoverBg },
              '&.Mui-disabled': { bgcolor: ink[300], color: '#fff' },
            }}
          >
            {isSubmitting
              ? 'Saving…'
              : confirming
              ? action === 'subtract'
                ? 'Confirm subtraction'
                : 'Confirm new balance'
              : action === 'add'
              ? 'Add funds'
              : 'Continue'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Row action menu ─────────────────────────────────────────────────────────

function RowActionsMenu({
  onUpdateSavings,
  onUpdateInvestment,
  onViewDetails,
  onCopyId,
}: {
  onUpdateSavings: () => void;
  onUpdateInvestment: () => void;
  onViewDetails: () => void;
  onCopyId: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Row actions">
        <MoreVertIcon sx={{ fontSize: '1.15rem' }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { borderRadius: radius.md, minWidth: 200, boxShadow: shadow.raised } } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); onViewDetails(); }} sx={{ fontSize: '0.85rem', gap: 1.2, py: 1 }}>
          <PeopleIcon sx={{ fontSize: '1.05rem', color: ink[600] }} />
          View details
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onUpdateSavings(); }} sx={{ fontSize: '0.85rem', gap: 1.2, py: 1 }}>
          <SavingsIcon sx={{ fontSize: '1.05rem', color: ink[600] }} />
          Update savings balance
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onUpdateInvestment(); }} sx={{ fontSize: '0.85rem', gap: 1.2, py: 1 }}>
          <TrendingUpIcon sx={{ fontSize: '1.05rem', color: ink[600] }} />
          Update investment balance
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setAnchorEl(null); onCopyId(); }} sx={{ fontSize: '0.85rem', gap: 1.2, py: 1 }}>
          <CopyIcon sx={{ fontSize: '1.05rem', color: ink[600] }} />
          Copy user ID
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── User Details Dialog ─────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 1.2, borderRadius: radius.sm, bgcolor: ink[50], border: `1px solid ${ink[100]}` }}>
      <Typography sx={{ fontSize: '0.65rem', color: ink[400], mb: 0.3 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: ink[900] }}>{value}</Typography>
    </Box>
  );
}

function InvestmentPlanRow({ item }: { item: InvestmentDetailItem }) {
  return (
    <Box sx={{ p: 1.4, borderRadius: radius.md, border: `1px solid ${ink[100]}`, bgcolor: ink[50], display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: ink[900] }}>{item.planName}</Typography>
        <StatusChip status={item.status} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', color: ink[400] }}>Invested</Typography>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: ink[900] }}>{formatCurrency(item.amountInvested)}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', color: ink[400] }}>Current value</Typography>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: ink[900] }}>{formatCurrency(item.currentValue)}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
        <Typography sx={{ fontSize: '0.72rem', color: item.totalGain >= 0 ? success.text : danger.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.2 }}>
          {item.totalGain >= 0 && <ArrowUpIcon sx={{ fontSize: '0.7rem' }} />}
          {formatCurrency(item.totalGain)} gain
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: ink[400] }}>Matures {formatDate(item.maturityDate)}</Typography>
      </Box>
    </Box>
  );
}

function SavingsPlanRow({ plan }: { plan: SavingsPlanItem }) {
  return (
    <Box sx={{ p: 1.4, borderRadius: radius.md, border: `1px solid ${ink[100]}`, bgcolor: ink[50], display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: ink[900] }}>{plan.planName}</Typography>
        <StatusChip status={plan.status} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: plan.targetAmount > 0 ? '1fr 1fr' : '1fr', gap: 1 }}>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', color: ink[400] }}>Current amount</Typography>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: ink[900] }}>{formatCurrency(plan.currentAmount)}</Typography>
        </Box>
        {plan.targetAmount > 0 && (
          <Box>
            <Typography sx={{ fontSize: '0.65rem', color: ink[400] }}>Target</Typography>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: ink[900] }}>{formatCurrency(plan.targetAmount)}</Typography>
          </Box>
        )}
      </Box>
      {plan.targetAmount > 0 && (
        <Box sx={{ height: 6, borderRadius: 999, bgcolor: ink[200], overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${Math.min(plan.progressPercentage, 100)}%`, bgcolor: BRAND, borderRadius: 999 }} />
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
        <Typography sx={{ fontSize: '0.68rem', color: ink[400] }}>
          {plan.earnInterest ? `${plan.interestRate}% APY · ${formatCurrency(plan.totalInterestEarned)} earned` : 'No interest'}
        </Typography>
        {plan.nextDepositDueDate && (
          <Typography sx={{ fontSize: '0.68rem', color: ink[400] }}>Next due {formatDate(plan.nextDepositDueDate)}</Typography>
        )}
      </Box>
    </Box>
  );
}

function UserDetailsDialog({
  open,
  userId,
  fallbackUser,
  onClose,
  onUpdateSavings,
  onUpdateInvestment,
}: {
  open: boolean;
  userId: string | null;
  fallbackUser: AdminUser | null;
  onClose: () => void;
  onUpdateSavings: (u: AdminUser) => void;
  onUpdateInvestment: (u: AdminUser) => void;
}) {
  // Only fetch while the dialog is actually open.
  const { data, isLoading, isError } = useGetUserBalanceDetails(
    open ? userId ?? undefined : undefined
  ) as { data?: UserBalanceDetails; isLoading: boolean; isError: boolean };

  if (!fallbackUser && !data) return null;

  const person = data?.user ?? fallbackUser!;
  const avatar = avatarStyle(person.userId);

  const portfolioValue = data?.investments.summary.portfolioValue ?? fallbackUser?.investmentBalance.portfolioValue ?? 0;
  const savingsBalance = data?.savings.summary.balance ?? fallbackUser?.savingsBalance.balance ?? 0;
  const totalBalance = data ? portfolioValue + savingsBalance : fallbackUser?.totalBalance ?? 0;

  const buildBase = (): AdminUser =>
    fallbackUser ?? {
      userId: person.userId,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      username: person.username,
      createdAt: person.createdAt,
      investmentBalance: {
        totalInvested: data?.investments.summary.totalInvested ?? 0,
        portfolioValue: data?.investments.summary.portfolioValue ?? 0,
        totalGains: data?.investments.summary.totalGains ?? 0,
        avgReturn: data?.investments.summary.avgReturn ?? 0,
        activePlans: data?.investments.summary.activePlans ?? 0,
      },
      savingsBalance: {
        balance: data?.savings.summary.balance ?? 0,
        targetAmount: data?.savings.summary.targetAmount ?? 0,
        totalInterestEarned: data?.savings.summary.totalInterestEarned ?? 0,
        monthlyInterest: data?.savings.summary.monthlyInterest ?? 0,
        activePlans: data?.savings.summary.activePlans ?? 0,
        completedPlans: data?.savings.summary.completedPlans ?? 0,
      },
      totalBalance,
    };

  const handleUpdateSavingsClick = () => {
    const base = buildBase();

    // Prefer the freshest savings numbers from the details endpoint when we have them.
    const merged: AdminUser = data
      ? {
          ...base,
          savingsBalance: {
            balance: data.savings.summary.balance,
            targetAmount: data.savings.summary.targetAmount,
            totalInterestEarned: data.savings.summary.totalInterestEarned,
            monthlyInterest: data.savings.summary.monthlyInterest,
            activePlans: data.savings.summary.activePlans,
            completedPlans: data.savings.summary.completedPlans,
          },
        }
      : base;

    onUpdateSavings(merged);
  };

  const handleUpdateInvestmentClick = () => {
    const base = buildBase();

    // Prefer the freshest investment numbers from the details endpoint when we have them.
    const merged: AdminUser = data
      ? {
          ...base,
          investmentBalance: {
            totalInvested: data.investments.summary.totalInvested,
            portfolioValue: data.investments.summary.portfolioValue,
            totalGains: data.investments.summary.totalGains,
            avgReturn: data.investments.summary.avgReturn,
            activePlans: data.investments.summary.activePlans,
          },
        }
      : base;

    onUpdateInvestment(merged);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: radius.xl, bgcolor: '#fff', m: { xs: 1.5, sm: 3 } } } }}
    >
      <DialogContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Avatar sx={{ bgcolor: avatar.bg, color: avatar.fg, width: 46, height: 46, fontWeight: 800, flexShrink: 0 }}>
              {initials(person.firstName, person.lastName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: ink[900] }}>
                {person.firstName} {person.lastName}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: ink[400], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                @{person.username} · {person.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Close dialog">
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        {isError && (
          <Alert severity="warning" sx={{ borderRadius: radius.md, mb: 2 }}>
            Couldn&apos;t load full plan-level details. Showing summary data instead.
          </Alert>
        )}

        <Box sx={{ mb: 1, p: 1.5, borderRadius: radius.md, bgcolor: ink[50], border: `1px solid ${ink[100]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.68rem', color: ink[400] }}>User ID</Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: ink[700], fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {person.userId}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.68rem', color: ink[400] }}>Joined</Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: ink[700] }}>{formatDate(person.createdAt)}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2.5, p: 1.5, borderRadius: radius.md, bgcolor: BRAND_SOFT, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8rem', color: BRAND_DARK, fontWeight: 700 }}>Total balance</Typography>
          {isLoading && !fallbackUser ? (
            <Skeleton variant="text" width={90} height={26} />
          ) : (
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: BRAND_DARK }}>{formatCurrency(totalBalance)}</Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: ink[900], display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <TrendingUpIcon sx={{ fontSize: '1rem', color: violet.text }} /> Investments
          </Typography>
          <Button
            size="small"
            onClick={handleUpdateInvestmentClick}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: BRAND }}
          >
            Update balance
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
            <Skeleton variant="rounded" height={78} />
            <Skeleton variant="rounded" height={78} />
          </Box>
        ) : data ? (
          data.investments.details.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
              {data.investments.details.map((item) => (
                <InvestmentPlanRow key={item.investmentId} item={item} />
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: ink[400], mb: 2.5 }}>No investment plans yet.</Typography>
          )
        ) : (
          fallbackUser && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, gap: 1.2, mb: 2.5 }}>
              <DetailRow label="Total invested" value={formatCurrency(fallbackUser.investmentBalance.totalInvested)} />
              <DetailRow label="Portfolio value" value={formatCurrency(fallbackUser.investmentBalance.portfolioValue)} />
              <DetailRow label="Total gains" value={formatCurrency(fallbackUser.investmentBalance.totalGains)} />
              <DetailRow label="Avg. return" value={`${fallbackUser.investmentBalance.avgReturn}%`} />
            </Box>
          )
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: ink[900], display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <SavingsIcon sx={{ fontSize: '1rem', color: success.text }} /> Savings
          </Typography>
          <Button
            size="small"
            onClick={handleUpdateSavingsClick}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: BRAND }}
          >
            Update balance
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Skeleton variant="rounded" height={90} />
            <Skeleton variant="rounded" height={90} />
          </Box>
        ) : data ? (
          data.savings.summary.plans.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {data.savings.summary.plans.map((plan) => (
                <SavingsPlanRow key={plan._id} plan={plan} />
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: ink[400] }}>No savings plans yet.</Typography>
          )
        ) : (
          fallbackUser && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
              <DetailRow label="Balance" value={formatCurrency(fallbackUser.savingsBalance.balance)} />
              <DetailRow label="Target amount" value={formatCurrency(fallbackUser.savingsBalance.targetAmount)} />
              <DetailRow label="Interest earned" value={formatCurrency(fallbackUser.savingsBalance.totalInterestEarned)} />
              <DetailRow label="Active plans" value={String(fallbackUser.savingsBalance.activePlans)} />
            </Box>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── User Card ───────────────────────────────────────────────────────────────

function UserCard({
  user,
  onOpenDetails,
  onUpdateSavings,
  onUpdateInvestment,
  onCopyId,
}: {
  user: AdminUser;
  onOpenDetails: () => void;
  onUpdateSavings: () => void;
  onUpdateInvestment: () => void;
  onCopyId: () => void;
}) {
  const avatar = avatarStyle(user.userId);

  return (
    <Card
      onClick={onOpenDetails}
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: radius.lg,
        border: `1px solid ${ink[200]}`,
        boxShadow: shadow.card,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.6,
        transition: 'box-shadow 150ms ease, transform 150ms ease, border-color 150ms ease',
        '&:hover': { boxShadow: shadow.raised, transform: 'translateY(-2px)', borderColor: ink[300] },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
          <Avatar sx={{ bgcolor: avatar.bg, color: avatar.fg, width: 42, height: 42, fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>
            {initials(user.firstName, user.lastName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: ink[900], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fullName(user)}
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: ink[400], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0, mt: -0.5, mr: -0.5 }}>
          <RowActionsMenu
            onViewDetails={onOpenDetails}
            onUpdateSavings={onUpdateSavings}
            onUpdateInvestment={onUpdateInvestment}
            onCopyId={onCopyId}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: ink[100] }} />

      {/* Balances */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: ink[400], textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
            Investment
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: ink[900] }}>
            {formatCurrency(user.investmentBalance.portfolioValue)}
          </Typography>
          {user.investmentBalance.totalGains > 0 && (
            <Typography sx={{ fontSize: '0.7rem', color: success.text, display: 'flex', alignItems: 'center', gap: 0.2, mt: 0.2 }}>
              <ArrowUpIcon sx={{ fontSize: '0.7rem' }} />
              {formatCurrency(user.investmentBalance.totalGains)}
            </Typography>
          )}
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: ink[400], textTransform: 'uppercase', letterSpacing: '0.4px', mb: 0.3 }}>
            Savings
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: ink[900] }}>
            {formatCurrency(user.savingsBalance.balance)}
          </Typography>
          {user.savingsBalance.targetAmount > 0 && (
            <Typography sx={{ fontSize: '0.7rem', color: ink[400], mt: 0.2 }}>
              of {formatCurrency(user.savingsBalance.targetAmount)} goal
            </Typography>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pt: 1.4,
          borderTop: `1px solid ${ink[100]}`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.6 }}>
          <Tooltip title="Investment plans">
            <Chip size="small" label={user.investmentBalance.activePlans} sx={{ bgcolor: violet.bg, color: violet.text, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
          </Tooltip>
          <Tooltip title="Savings plans">
            <Chip size="small" label={user.savingsBalance.activePlans} sx={{ bgcolor: success.bg, color: success.text, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
          </Tooltip>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '0.64rem', color: ink[400] }}>Total balance</Typography>
          <Typography sx={{ fontSize: '0.98rem', fontWeight: 800, color: BRAND }}>
            {formatCurrency(user.totalBalance)}
          </Typography>
        </Box>
      </Box>

      <Tooltip title={formatDate(user.createdAt)}>
        <Typography sx={{ fontSize: '0.68rem', color: ink[400], width: 'fit-content' }}>
          Joined {formatRelative(user.createdAt)}
        </Typography>
      </Tooltip>
    </Card>
  );
}

function UserCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{ p: 2.25, borderRadius: radius.lg, border: `1px solid ${ink[200]}`, boxShadow: shadow.card, display: 'flex', flexDirection: 'column', gap: 1.6 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Skeleton variant="circular" width={42} height={42} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="90%" height={16} />
        </Box>
      </Box>
      <Divider sx={{ borderColor: ink[100] }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Skeleton variant="text" width="80%" height={38} />
        <Skeleton variant="text" width="80%" height={38} />
      </Box>
      <Skeleton variant="rounded" height={36} />
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const { data, isLoading, isError } = useAdminUsersBalances();
  const updateSavingsBalance = useUpdateSavingsBalance();
  const navigate = useNavigate();
  const updateInvestmentBalance = useUpdateUserInvestmentBalance();
  const users = (data ?? []) as unknown as AdminUser[];
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [savingsUser, setSavingsUser] = useState<AdminUser | null>(null);
  const [savingsModalOpen, setSavingsModalOpen] = useState(false);

  const [investmentUser, setInvestmentUser] = useState<AdminUser | null>(null);
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSortKeyChange = (key: SortKey) => {
    setSortKey(key);
    setPage(1);
  };

  const toggleSortDirection = () => {
    setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
    );
  }, [users, search]);

  const sorted = useMemo(() => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    const rows = [...filtered];
    rows.sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return fullName(a).localeCompare(fullName(b)) * dir;
        case 'createdAt':
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
        case 'investment':
          return (a.investmentBalance.portfolioValue - b.investmentBalance.portfolioValue) * dir;
        case 'savings':
          return (a.savingsBalance.balance - b.savingsBalance.balance) * dir;
        case 'total':
          return (a.totalBalance - b.totalBalance) * dir;
        default:
          return 0;
      }
    });
    return rows;
  }, [filtered, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalUsers = users.length;
  const totalAUM = users.reduce((sum, u) => sum + (u.totalBalance ?? 0), 0);
  const totalInvested = users.reduce((sum, u) => sum + (u.investmentBalance?.totalInvested ?? 0), 0);
  const totalSavings = users.reduce((sum, u) => sum + (u.savingsBalance?.balance ?? 0), 0);

  const handleOpenDetails = (u: AdminUser) => {
    setDetailsUser(u);
    setDetailsOpen(true);
  };

  const handleOpenSavingsModal = (u: AdminUser) => {
    setSavingsUser(u);
    setSavingsModalOpen(true);
  };

  const handleOpenInvestmentModal = (u: AdminUser) => {
    setInvestmentUser(u);
    setInvestmentModalOpen(true);
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setSnackbar({ open: true, message: 'User ID copied to clipboard', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Could not copy — copy it manually from the details panel', severity: 'error' });
    }
  };

  const handleSavingsUpdate = async (payload: {
    userId: string;
    action: 'add' | 'subtract';
    amount: number;
    reason: string;
  }) => {
    const result = await updateSavingsBalance.mutateAsync(payload);
    setSnackbar({
      open: true,
      message: `${payload.action === 'add' ? 'Added' : 'Subtracted'} ${formatCurrency(payload.amount)} — new balance ${formatCurrency(result?.balanceAfter)}`,
      severity: 'success',
    });
  };

  const handleInvestmentUpdate = async (payload: {
    userId: string;
    action: InvestmentAction;
    amount: number;
    reason: string;
    investmentId?: string;
  }) => {
    const result = await updateInvestmentBalance.mutateAsync(payload);
    // TEMP DEBUG — inspect the real response shape, then remove this line.
    // console.log('[update-investment-balance] raw result', result);

    const verb = payload.action === 'add' ? 'Added' : payload.action === 'subtract' ? 'Subtracted' : 'Set';
    const resolvedBalance =
      (result as any)?.newBalance ??
      (result as any)?.balanceAfter ??
      (result as any)?.newInvestmentBalance ??
      (result as any)?.currentValue;

    setSnackbar({
      open: true,
      message:
        resolvedBalance !== undefined
          ? `${verb} investment balance — new balance ${formatCurrency(resolvedBalance)}`
          : `${verb} investment balance.`,
      severity: 'success',
    });
  };

  return (
    <Box sx={{ p: 0, fontFamily: 'inherit' }}>
      {/* Header */}
                  {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink[400], textTransform: 'uppercase', letterSpacing: '0.6px', mb: 0.6 }}>
            Admin · Users
          </Typography>
          <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' }, fontWeight: 900, color: ink[900], letterSpacing: '-0.02em' }}>
            Users
          </Typography>
          <Typography sx={{ fontSize: '0.92rem', color: ink[600], mt: 0.4 }}>
            View balances and manage user savings accounts.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<EmailIcon sx={{ fontSize: '1.05rem' }} />}
            onClick={() => setEmailModalOpen(true)}
            sx={{
              borderColor: ink[200],
              color: ink[700],
              px: 2.5,
              py: 1.2,
              borderRadius: radius.md,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': { borderColor: ink[300], bgcolor: ink[50] },
            }}
          >
            Send email
          </Button>

          <Button
            variant="contained"
            disableElevation
            startIcon={<WalletIcon sx={{ fontSize: '1.05rem' }} />}
            onClick={() => navigate('/admin/wallets')}
            sx={{
              bgcolor: BRAND,
              color: '#fff',
              px: 2.5,
              py: 1.2,
              borderRadius: radius.md,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': { bgcolor: BRAND_DARK },
            }}
          >
            Wallets
          </Button>
        </Box>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ borderRadius: radius.md, mb: 3 }}>
          Failed to load users. Please try again.
        </Alert>
      )}

      {/* Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <StatCard icon={PeopleIcon} label="Total users" value={totalUsers.toLocaleString()} sub="Registered accounts" color={BRAND} bg={BRAND_SOFT} loading={isLoading} />
        <StatCard icon={WalletIcon} label="Total AUM" value={formatCurrency(totalAUM)} sub="Across all users" color={ink[900]} bg={ink[100]} loading={isLoading} />
        <StatCard icon={TrendingUpIcon} label="Total invested" value={formatCurrency(totalInvested)} sub="Investment principal" color={violet.text} bg={violet.bg} loading={isLoading} />
        <StatCard icon={SavingsIcon} label="Total savings" value={formatCurrency(totalSavings)} sub="Savings balances" color={success.text} bg={success.bg} loading={isLoading} />
      </Box>

      {/* Search + sort */}
      <Box sx={{ mb: 2.5, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search by name, email, or username…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          size="small"
          sx={{
            width: { xs: '100%', sm: 320 },
            bgcolor: '#fff',
            '& .MuiOutlinedInput-root': { borderRadius: radius.md },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.1rem', color: ink[400] }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearch(''); setPage(1); }} aria-label="Clear search">
                    <CloseIcon sx={{ fontSize: '0.95rem' }} />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          <FormControl size="small" sx={{ minWidth: 170, bgcolor: '#fff' }}>
            <InputLabel id="sort-select-label">Sort by</InputLabel>
            <Select
              labelId="sort-select-label"
              label="Sort by"
              value={sortKey}
              onChange={(e) => handleSortKeyChange(e.target.value as SortKey)}
              sx={{ borderRadius: radius.md }}
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <MenuItem key={key} value={key}>{SORT_LABELS[key]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}>
            <IconButton
              onClick={toggleSortDirection}
              size="small"
              sx={{ border: `1px solid ${ink[200]}`, borderRadius: radius.md, bgcolor: '#fff' }}
            >
              <SwapVertIcon sx={{ fontSize: '1.15rem', color: ink[600], transform: sortDirection === 'asc' ? 'scaleY(1)' : 'scaleY(-1)' }} />
            </IconButton>
          </Tooltip>

          <Typography sx={{ fontSize: '0.78rem', color: ink[400], whiteSpace: 'nowrap' }}>
            {sorted.length.toLocaleString()} {sorted.length === 1 ? 'result' : 'results'}
          </Typography>
        </Box>
      </Box>

      {/* Card grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(300px, 1fr))' },
          gap: 2,
        }}
      >
        {isLoading &&
          Array.from({ length: SKELETON_CARDS }).map((_, i) => <UserCardSkeleton key={`skeleton-${i}`} />)}

        {!isLoading && !isError && paginated.length === 0 && (
          <Box sx={{ gridColumn: '1 / -1', py: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: ink[100], display: 'grid', placeItems: 'center' }}>
              <SearchIcon sx={{ fontSize: '1.2rem', color: ink[400] }} />
            </Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: ink[700] }}>
              No users found
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: ink[400] }}>
              {search ? `Nothing matches "${search}".` : 'No users to show yet.'}
            </Typography>
            {search && (
              <Button
                size="small"
                onClick={() => setSearch('')}
                sx={{ mt: 0.5, textTransform: 'none', fontWeight: 700, color: BRAND }}
              >
                Clear search
              </Button>
            )}
          </Box>
        )}

        {!isLoading && paginated.map((u) => (
          <UserCard
            key={u.userId}
            user={u}
            onOpenDetails={() => handleOpenDetails(u)}
            onUpdateSavings={() => handleOpenSavingsModal(u)}
            onUpdateInvestment={() => handleOpenInvestmentModal(u)}
            onCopyId={() => handleCopyId(u.userId)}
          />
        ))}
      </Box>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontSize: '0.78rem', color: ink[400] }}>
            Page {page} of {pageCount}
          </Typography>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, val) => setPage(val)}
            shape="rounded"
            size="small"
            sx={{ '& .Mui-selected': { bgcolor: `${BRAND} !important`, color: '#fff' } }}
          />
        </Box>
      )}

      <UpdateSavingsModal
        open={savingsModalOpen}
        user={savingsUser}
        isSubmitting={updateSavingsBalance.isPending}
        onClose={() => setSavingsModalOpen(false)}
        onSubmit={handleSavingsUpdate}
      />

      <UpdateInvestmentModal
        open={investmentModalOpen}
        user={investmentUser}
        isSubmitting={updateInvestmentBalance.isPending}
        onClose={() => setInvestmentModalOpen(false)}
        onSubmit={handleInvestmentUpdate}
      />

      <UserDetailsDialog
        open={detailsOpen}
        userId={detailsUser?.userId ?? null}
        fallbackUser={detailsUser}
        onClose={() => setDetailsOpen(false)}
        onUpdateSavings={(u) => { setDetailsOpen(false); handleOpenSavingsModal(u); }}
        onUpdateInvestment={(u) => { setDetailsOpen(false); handleOpenInvestmentModal(u); }}
      />

      <SendEmailModal
        open={emailModalOpen}
        users={users as unknown as EmailableUser[]}
        onClose={() => setEmailModalOpen(false)}
        onSent={(message) => setSnackbar({ open: true, message, severity: 'success' })}
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