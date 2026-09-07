/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
  Dialog,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  useDashboardOverview,
  useCompareInvestments,
  useMyWallet,
  useRequestWithdrawal,
  useMyWithdrawals,
} from '../../hooks/useAuth';
import { useGetProfile } from '../../hooks/useProfile'; // adjust path as needed
import InvestmentDetailsModal from './InvestmentDetailsModal';
import {
  ArrowDownward as ArrowDownIcon,
  Send as SendIcon,
  Add as AddIcon,
  AccountBalanceWallet as WalletIcon,
  SavingsOutlined as SavingsIcon,
  ArrowForwardIos as ArrowRightIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WithdrawIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  ContentCopy as CopyIcon,
  CurrencyBitcoin as BitcoinIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
} from '@mui/icons-material';

// ─── Animated Counter ──────────────────────────────────────────────────────────

function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    startRef.current = null;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / 1200, 1);
      setDisplay((1 - Math.pow(1 - p, 3)) * value);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return (
    <>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
}

// ─── Withdrawal status chip ─────────────────────────────────────────────────────

const WITHDRAWAL_STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: '#FFFBEB', text: '#92400E', icon: PendingIcon },
  approved: { bg: '#ECFDF5', text: '#047857', icon: SuccessIcon },
  rejected: { bg: '#FEF2F2', text: '#B91C1C', icon: RejectedIcon },
};

function WithdrawalStatusChip({ status }: { status: string }) {
  const style = WITHDRAWAL_STATUS_STYLES[status] ?? WITHDRAWAL_STATUS_STYLES.pending;
  const Icon = style.icon;
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ fontSize: '0.85rem !important', color: `${style.text} !important` }} />}
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      sx={{ bgcolor: style.bg, color: style.text, fontWeight: 700, fontSize: '0.65rem', height: 22 }}
    />
  );
}

const BTC_ADDRESS_REGEX =
  /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{25,90})$/;

// ─── Main Page ─────────────────────────────────────────────────────────────────

const DashboardHome = () => {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useDashboardOverview();
  const { data: compareInvestmentsData, isLoading: isCompareLoading } = useCompareInvestments();
  const { data: profileResponse } = useGetProfile();
  const profile = profileResponse?.data;
  const [userName, setUserName] = useState('User');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | undefined>();
  const [withdrawal, setWithdrawal] = useState({ open: false, investmentId: '', amount: '', error: '', success: false });

  // ── Wallet ──
  const { data: myWallet, isLoading: walletLoading } = useMyWallet();
  const { data: myWithdrawals, isLoading: withdrawalsLoading } = useMyWithdrawals();
  const requestWithdrawal = useRequestWithdrawal();
  const [walletWithdrawal, setWalletWithdrawal] = useState({
    open: false,
    amount: '',
    bitcoinAddress: '',
    error: '',
    success: false,
  });
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.firstName || 'User');
    }
  }, []);

  const displayInitials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const handleOpenModal = (investmentId: string) => {
    setSelectedInvestmentId(investmentId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInvestmentId(undefined);
  };

  const selectedInvestment = dashboardData?.investmentsList?.find((inv) => inv._id === withdrawal.investmentId);
  const openWithdrawal = (investmentId: string) => setWithdrawal({ open: true, investmentId, amount: '', error: '', success: false });
  const closeWithdrawal = () => setWithdrawal({ open: false, investmentId: '', amount: '', error: '', success: false });
  const submitWithdrawal = () => {
    const amount = Number.parseFloat(withdrawal.amount);
    const available = selectedInvestment?.currentValue ?? 0;
    if (!Number.isFinite(amount) || amount <= 0) return setWithdrawal((s) => ({ ...s, error: 'Enter a valid amount.' }));
    if (amount > available) return setWithdrawal((s) => ({ ...s, error: `You can withdraw up to $${available.toFixed(2)}.` }));
    setWithdrawal((s) => ({ ...s, success: true, error: '' }));
  };

  // ── Wallet withdrawal handlers ──
  const openWalletWithdrawal = () =>
    setWalletWithdrawal({ open: true, amount: '', bitcoinAddress: '', error: '', success: false });
  const closeWalletWithdrawal = () =>
    setWalletWithdrawal({ open: false, amount: '', bitcoinAddress: '', error: '', success: false });

  const submitWalletWithdrawal = async () => {
    const amount = Number.parseFloat(walletWithdrawal.amount);
    const available = myWallet?.availableBalance ?? 0;

    if (!Number.isFinite(amount) || amount <= 0) {
      setWalletWithdrawal((s) => ({ ...s, error: 'Enter a valid amount.' }));
      return;
    }
    if (amount > available) {
      setWalletWithdrawal((s) => ({
        ...s,
        error: `You can withdraw up to ${myWallet?.currency ?? ''} ${available.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
      }));
      return;
    }
    const trimmedAddress = walletWithdrawal.bitcoinAddress.trim();
    if (!trimmedAddress || !BTC_ADDRESS_REGEX.test(trimmedAddress)) {
      setWalletWithdrawal((s) => ({ ...s, error: 'Enter a valid Bitcoin wallet address.' }));
      return;
    }

    try {
      await requestWithdrawal.mutateAsync({ amount, bitcoinAddress: trimmedAddress });
      setWalletWithdrawal((s) => ({ ...s, success: true, error: '' }));
    } catch (err) {
      setWalletWithdrawal((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      }));
    }
  };

  const handleCopyAccountNumber = async () => {
    if (!myWallet?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(myWallet.accountNumber);
      setCopiedAccountNumber(true);
      setTimeout(() => setCopiedAccountNumber(false), 2000);
    } catch {
      // clipboard not available — silently ignore
    }
  };

  // Show loading state
  if (isLoading || isCompareLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboardData) {
    return <Typography>Unable to load dashboard data</Typography>;
  }

  // Transform API data to match UI structure - Map only balances
  const balanceStats = [
    {
      label: 'Total Balance',
      value: dashboardData.balances.totalBalance,
      change: '',
      icon: WalletIcon,
      gradient: 'linear-gradient(135deg, #FA510F 0%, #D94309 100%)',
      shadow: '0 8px 32px rgba(250,81,15,0.35)',
      textColor: '#fff',
      labelColor: 'rgba(255,255,255,0.8)',
      changeColor: 'rgba(255,255,255,0.9)',
      iconBg: 'rgba(255,255,255,0.2)',
      iconColor: '#fff',
    },
    {
      label: 'Investments Balance',
      value: dashboardData.balances.investmentsBalance,
      change: '',
      icon: ArrowDownIcon,
      gradient: null,
      bg: '#FFFFFF',
      textColor: '#0F172A',
      labelColor: '#9CA3AF',
      changeColor: '#059669',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      label: 'Savings Balance',
      value: dashboardData.balances.savingsBalance,
      change: '',
      icon: SavingsIcon,
      gradient: null,
      bg: '#FFFFFF',
      textColor: '#0F172A',
      labelColor: '#9CA3AF',
      changeColor: '#0EA5E9',
      iconBg: '#F0F9FF',
      iconColor: '#0EA5E9',
    },
    {
      label: 'Total Gain',
      value: dashboardData.investments.totalGain,
      change: `${dashboardData.investments.gainPercentage.toFixed(2)}% return`,
      icon: TrendingUpIcon,
      gradient: null,
      bg: '#FFFFFF',
      textColor: '#0F172A',
      labelColor: '#9CA3AF',
      changeColor: '#059669',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
  ];

  const stats = balanceStats.map((stat) => ({
    ...stat,
    prefix: '$',
    decimals: 2, // Display exact amounts with 2 decimal places
  }));

  return (
    <Box>
      {/* ── Welcome ── */}
      <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={profile?.profilePhoto}
            sx={{
              width: 48, height: 48, border: '2px solid #FA510F',
              boxShadow: '0 0 0 3px rgba(250,81,15,0.15)',
              bgcolor: '#FA510F', fontSize: '1rem', fontWeight: 700,
            }}
          >
            {displayInitials}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', mb: 0.1 }}>Good morning 👋</Typography>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Welcome back, {userName}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2, mb: 3.5 }}>
        {stats.map((s) => (
          <Box
            key={s.label}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: '18px',
              background: s.gradient || s.bg,
              boxShadow: s.shadow || '0 2px 12px rgba(0,0,0,0.06)',
              border: s.gradient ? 'none' : '1px solid rgba(0,0,0,0.06)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: s.shadow
                  ? '0 14px 40px rgba(250,81,15,0.4)'
                  : '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            {/* decorative circle */}
            <Box sx={{
              position: 'absolute', top: -20, right: -20,
              width: 80, height: 80, borderRadius: '50%',
              background: s.gradient ? 'rgba(255,255,255,0.12)' : (s.iconBg + '80'),
            }} />
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              bgcolor: s.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 1.5,
            }}>
              <s.icon sx={{ color: s.iconColor, fontSize: '1.1rem' }} />
            </Box>
            <Typography sx={{ fontSize: '0.68rem', color: s.labelColor, fontWeight: 600, mb: 0.3 }}>
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1.1rem', sm: '1.35rem' }, fontWeight: 800, color: s.textColor, lineHeight: 1.1 }}>
              <AnimatedNumber value={s.value} prefix={s.prefix} decimals={s.decimals || 0} />
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: s.changeColor, mt: 0.5, fontWeight: 600 }}>
              {s.change}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Wallet ── */}
      <Box
        sx={{
          p: 3,
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: '12px',
                bgcolor: '#FFF4F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <WalletIcon sx={{ color: '#FA510F', fontSize: '1.15rem' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Wallet</Typography>
              {walletLoading ? (
                <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Loading account…</Typography>
              ) : myWallet ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                    Account: {myWallet.accountNumber}
                  </Typography>
                  <Tooltip title={copiedAccountNumber ? 'Copied!' : 'Copy account number'}>
                    <IconButton size="small" onClick={handleCopyAccountNumber} sx={{ p: 0.3 }}>
                      <CopyIcon sx={{ fontSize: '0.8rem', color: '#9CA3AF' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>No wallet found</Typography>
              )}
            </Box>
          </Box>

          <Button
            variant="contained"
            disabled={!myWallet || myWallet.availableBalance <= 0}
            startIcon={<BitcoinIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={openWalletWithdrawal}
            sx={{
              bgcolor: '#FA510F',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              '&:hover': { bgcolor: '#D94309' },
              '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
            }}
          >
            Withdraw to Bitcoin
          </Button>
        </Box>

        {walletLoading ? (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <CircularProgress size={20} />
          </Box>
        ) : myWallet ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#F8F9FA' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, mb: 0.4 }}>
                Wallet Balance
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                {myWallet.currency}{' '}
                {myWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#F8F9FA' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, mb: 0.4 }}>
                Available to Withdraw
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                {myWallet.currency}{' '}
                {myWallet.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
            We couldn&apos;t find a wallet on your account. Please contact support.
          </Typography>
        )}

        {/* Withdrawal history */}
        {myWithdrawals && myWithdrawals.length > 0 && (
          <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', mb: 1.5 }}>
              Recent Withdrawal Requests
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {myWithdrawals.slice(0, 5).map((w) => (
                <Box
                  key={w._id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    p: 1.4,
                    borderRadius: '12px',
                    bgcolor: '#F8F9FA',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {myWallet?.currency ?? ''} {w.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        color: '#9CA3AF',
                        fontFamily: 'monospace',
                        maxWidth: 220,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {w.bitcoinAddress}
                    </Typography>
                    {w.reviewNote && (
                      <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', mt: 0.2 }}>
                        Note: {w.reviewNote}
                      </Typography>
                    )}
                  </Box>
                  <WithdrawalStatusChip status={w.status} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {!withdrawalsLoading && myWithdrawals && myWithdrawals.length === 0 && (
          <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', mt: 2 }}>
            No withdrawal requests yet.
          </Typography>
        )}
      </Box>

      {/* ── Quick actions + Allocation ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>

        {/* Quick Actions */}
        <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', mb: 2 }}>Quick Actions</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {[
              { label: 'Invest Money',     icon: SendIcon,    gradient: 'linear-gradient(135deg,#FA510F,#D94309)', shadow: '0 4px 14px rgba(250,81,15,0.3)', text: '#fff', path: '/dashboard/investments' },
              { label: 'Save Money',       icon: AddIcon,     gradient: null, border: '1.5px solid rgba(250,81,15,0.3)', bg: '#FFF4F0', text: '#FA510F', path: '/dashboard/savings' },
            ].map((action) => (
              <Box
                key={action.label}
                onClick={() => navigate(action.path)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  py: 1.3, px: 1.8, borderRadius: '12px',
                  background: action.gradient,
                  border: 'none',
                  boxShadow: action.shadow || 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)', opacity: 0.92 },
                }}
              >
                <action.icon sx={{ color: action.text, fontSize: '1.1rem' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: action.text }}>
                  {action.label}
                </Typography>
                <ArrowRightIcon sx={{ fontSize: '0.75rem', color: action.text, ml: 'auto', opacity: 0.7 }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Portfolio Allocation */}
        <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Allocation</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#FA510F', fontWeight: 700, cursor: 'pointer' }}>Current</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {dashboardData.allocation && Object.entries(dashboardData.allocation).map(([key, value]) => (
              <Box key={key}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{value}%</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: '99px', bgcolor: '#F1F3F9', overflow: 'hidden' }}>
                  <Box sx={{
                    height: '100%',
                    width: `${value}%`,
                    bgcolor: '#FA510F',
                    borderRadius: '99px',
                    transition: 'width 1s ease',
                  }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Investments Comparison ── */}
      {compareInvestmentsData && compareInvestmentsData.length > 0 && (
        <Box sx={{ p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Investment Comparison</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.3 }}>Side-by-side performance</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {compareInvestmentsData.map((inv, idx) => (
              <Box
                key={inv.id}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: idx === 0 ? '#FFF4F0' : '#F0F9FF',
                  border: `1.5px solid ${idx === 0 ? 'rgba(250,81,15,0.2)' : 'rgba(14,165,233,0.2)'}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 20px ${idx === 0 ? 'rgba(250,81,15,0.15)' : 'rgba(14,165,233,0.15)'}`,
                  },
                }}
              >
                {/* Plan Name and Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: idx === 0 ? '#FA510F' : '#0EA5E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUpIcon sx={{ color: '#fff', fontSize: '1rem' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                      {inv.planName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                      {inv.daysRemaining} days remaining
                    </Typography>
                  </Box>
                </Box>

                {/* Amount Invested */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, mb: 0.3 }}>
                    Amount Invested
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                    ${inv.amountInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>

                {/* Current Value */}
                <Box sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, mb: 0.3 }}>
                    Current Value
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                    ${inv.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>

                {/* Gain */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, mb: 0.3 }}>
                      Total Gain
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: inv.totalGain >= 0 ? '#059669' : '#DC2626' }}>
                      ${inv.totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, mb: 0.3 }}>
                      Return %
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: inv.gainPercentage >= 0 ? '#059669' : '#DC2626' }}>
                      {inv.gainPercentage >= 0 ? '+' : ''}{inv.gainPercentage.toFixed(2)}%
                    </Typography>
                  </Box>
                </Box>

                <Button size="small" startIcon={<WithdrawIcon sx={{ fontSize: '0.95rem !important' }} />} onClick={() => openWithdrawal(inv.id)} sx={{ mt: 0.5, color: '#FA510F', bgcolor: '#FFFFFF', borderRadius: '9px', textTransform: 'none', fontWeight: 700, fontSize: '0.72rem', '&:hover': { bgcolor: '#FFE5DA' } }}>Withdraw</Button>

                {/* Dates */}
                <Box sx={{ display: 'flex', gap: 1, pt: 1.5, borderTop: `1px solid ${idx === 0 ? 'rgba(250,81,15,0.1)' : 'rgba(14,165,233,0.1)'}` }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', mb: 0.2 }}>Investment Date</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                      {new Date(inv.investmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF', mb: 0.2 }}>Maturity Date</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                      {new Date(inv.maturityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ── Bottom row: Investments ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr' }, gap: 2.5 }}>

        {/* Recent Investments */}
        <Box sx={{ p: 3, borderRadius: '20px', bgcolor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Your Investments</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#FA510F', fontWeight: 700, cursor: 'pointer' }}>See all</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {dashboardData.investmentsList && dashboardData.investmentsList.slice(0, 5).map((inv, i) => (
              <Box
                key={inv._id}
                onClick={() => handleOpenModal(inv._id)}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  py: 1.4,
                  borderBottom: i < Math.min(dashboardData.investmentsList.length - 1, 4) ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  transition: 'background 0.15s',
                  borderRadius: '10px',
                  px: 0.5,
                  mx: -0.5,
                  '&:hover': { bgcolor: '#F8F9FA' },
                  cursor: 'pointer',
                }}
              >
                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    {inv.planName}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Invested: ${inv.amountInvested.toLocaleString()}</Typography>
                </Box>
                <Button size="small" startIcon={<WithdrawIcon sx={{ fontSize: '0.85rem !important' }} />} onClick={(event: React.MouseEvent) => { event.stopPropagation(); openWithdrawal(inv._id); }} sx={{ color: '#FA510F', textTransform: 'none', fontWeight: 700, fontSize: '0.68rem', minWidth: 0, px: 1, '&:hover': { bgcolor: '#FFF4F0' } }}>Withdraw</Button>
                {/* Return */}
                <Typography sx={{
                  fontSize: '0.9rem', fontWeight: 800, flexShrink: 0,
                  color: inv.gainPercentage > 0 ? '#059669' : '#DC2626',
                }}>
                  {inv.gainPercentage > 0 ? '+' : ''}{inv.gainPercentage.toFixed(2)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Investment Withdrawal Dialog (existing, unchanged) ── */}
      <Dialog open={withdrawal.open} onClose={closeWithdrawal} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '22px', p: 1 } } }}>
        <Box sx={{ p: 2.5 }}>
          {withdrawal.success ? (
            <Box sx={{ textAlign: 'center' }}>
              <SuccessIcon sx={{ color: '#059669', fontSize: 56, mb: 1 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>Withdrawal successful</Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem', mt: 1, mb: 2.5 }}>Your withdrawal request is submitted to the administrator successfully.</Typography>
              <Button fullWidth variant="contained" onClick={closeWithdrawal} sx={{ bgcolor: '#FA510F', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>Done</Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>Withdraw from investment</Typography>
                <IconButton size="small" onClick={closeWithdrawal} aria-label="Close withdrawal dialog"><CloseIcon fontSize="small" /></IconButton>
              </Box>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem', mb: 1.5 }}>Available: ${(selectedInvestment?.currentValue ?? 0).toFixed(2)}</Typography>
              <TextField fullWidth autoFocus type="number" label="Amount" value={withdrawal.amount} error={!!withdrawal.error} helperText={withdrawal.error || ''} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWithdrawal((s) => ({ ...s, amount: event.target.value, error: '' }))} slotProps={{ htmlInput: { min: 0.01, step: 0.01 }, input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
                <Button fullWidth onClick={closeWithdrawal} sx={{ bgcolor: '#F8F9FA', color: '#374151', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>Cancel</Button>
                <Button fullWidth variant="contained" onClick={submitWithdrawal} startIcon={<WithdrawIcon />} sx={{ bgcolor: '#FA510F', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>Withdraw</Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>

      {/* ── Wallet BTC Withdrawal Dialog ── */}
      <Dialog
        open={walletWithdrawal.open}
        onClose={requestWithdrawal.isPending ? undefined : closeWalletWithdrawal}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '22px', p: 1 } } }}
      >
        <Box sx={{ p: 2.5 }}>
          {walletWithdrawal.success ? (
            <Box sx={{ textAlign: 'center' }}>
              <SuccessIcon sx={{ color: '#059669', fontSize: 56, mb: 1 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                Withdrawal request submitted
              </Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.82rem', mt: 1, mb: 2.5 }}>
                Your Bitcoin withdrawal request has been sent to the administrator for review. You&apos;ll be notified once it&apos;s approved.
              </Typography>
              <Button fullWidth variant="contained" onClick={closeWalletWithdrawal} sx={{ bgcolor: '#FA510F', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
                Done
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>Withdraw to Bitcoin</Typography>
                <IconButton size="small" onClick={closeWalletWithdrawal} aria-label="Close withdrawal dialog" disabled={requestWithdrawal.isPending}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.8rem', mb: 1.5 }}>
                Available: {myWallet?.currency ?? ''}{' '}
                {(myWallet?.availableBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Typography>
              <TextField
                fullWidth
                autoFocus
                type="number"
                label="Amount"
                value={walletWithdrawal.amount}
                disabled={requestWithdrawal.isPending}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setWalletWithdrawal((s) => ({ ...s, amount: event.target.value, error: '' }))
                }
                slotProps={{
                  htmlInput: { min: 0.00000001, step: 'any' },
                  input: {
                    startAdornment: <InputAdornment position="start">{myWallet?.currency ?? '$'}</InputAdornment>,
                  },
                }}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                fullWidth
                label="Bitcoin Wallet Address"
                placeholder="bc1… or 1… or 3…"
                value={walletWithdrawal.bitcoinAddress}
                disabled={requestWithdrawal.isPending}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setWalletWithdrawal((s) => ({ ...s, bitcoinAddress: event.target.value, error: '' }))
                }
                error={!!walletWithdrawal.error}
                helperText={walletWithdrawal.error || 'Funds will be sent to this address once approved.'}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BitcoinIcon sx={{ fontSize: '1.05rem', color: '#9CA3AF' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.85rem' } }}
              />
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
                <Button
                  fullWidth
                  onClick={closeWalletWithdrawal}
                  disabled={requestWithdrawal.isPending}
                  sx={{ bgcolor: '#F8F9FA', color: '#374151', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={submitWalletWithdrawal}
                  disabled={requestWithdrawal.isPending}
                  startIcon={
                    requestWithdrawal.isPending ? (
                      <CircularProgress size={16} sx={{ color: '#fff' }} />
                    ) : (
                      <WithdrawIcon />
                    )
                  }
                  sx={{ bgcolor: '#FA510F', borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#D94309' } }}
                >
                  {requestWithdrawal.isPending ? 'Submitting…' : 'Request Withdrawal'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>

      {/* Investment Details Modal */}
      <InvestmentDetailsModal
        open={modalOpen}
        investmentId={selectedInvestmentId}
        onClose={handleCloseModal}
        onWithdraw={(investmentId) => { handleCloseModal(); openWithdrawal(investmentId); }}
      />
    </Box>
  );
};

export default DashboardHome;