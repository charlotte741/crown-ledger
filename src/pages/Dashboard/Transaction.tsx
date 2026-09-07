import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  // Button,
  TextField,
  IconButton,
  Dialog,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  // ArrowDownward as IncomeIcon,
  ArrowUpward as ExpenseIcon,
  ChevronLeft as ChevronIcon,
  // Download as DownloadIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  CreditCard as CardIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon,
  // ShoppingBag as ShoppingIcon,
  // LocalCafe as CafeIcon,
  // FitnessCenter as GymIcon,
  // LocalGasStation as GasIcon,
  // Restaurant as RestaurantIcon,
  // SwapHoriz as TransferIcon,
  // Subscriptions as SubsIcon,
  AccountBalanceWallet as WalletIcon,
  // Bolt as BoltIcon,
  // MedicalServices as MedIcon,
  // Flight as TravelIcon,
  // Home as RentIcon,
  TrendingUp as GainIcon,
  AccountBalance as SavingsIcon,
} from '@mui/icons-material';
import { useInvestmentTransactions, useSavingsTransactions } from '../../hooks/useAuth';

// ─── Types ────────────────────────────────────────────────────────────────────
type TxStatus = 'completed' | 'pending' | 'failed';
type TxType   = 'income' | 'expense' | 'investment' | 'savings';

interface TransactionDisplay {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  status: TxStatus;
  type: TxType;
  card: string;
  note?: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

// ─── Animated number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = React.useRef<number | null>(null);
  React.useEffect(() => {
    ref.current = null;
    const step = (ts: number) => {
      if (!ref.current) ref.current = ts;
      const p = Math.min((ts - ref.current) / 1100, 1);
      setDisplay((1 - Math.pow(1 - p, 3)) * value);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{prefix}{display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
}

// ─── Transaction Detail Dialog ────────────────────────────────────────────────
function TxDetail({ tx, open, onClose }: { tx: TransactionDisplay | null; open: boolean; onClose: () => void }) {
  if (!tx) return null;
  
  const isPositive = tx.amount >= 0;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 } } } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>Transaction Details</Typography>
          <IconButton size="small" onClick={onClose} sx={{ bgcolor: '#F5F6FA' }}><CloseIcon fontSize="small" /></IconButton>
        </Box>

        {/* Icon + name */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: tx.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
            boxShadow: `0 8px 24px ${tx.iconColor}25` }}>
            <tx.Icon sx={{ color: tx.iconColor, fontSize: '1.8rem' }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{tx.name}</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', mt: 0.3 }}>{tx.category}</Typography>
          <Typography sx={{ fontSize: '1.9rem', fontWeight: 900, mt: 1.5,
            color: isPositive ? '#059669' : '#0F172A' }}>
            {isPositive ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        {/* Details grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {[
            { label: 'Date', value: new Date(tx.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: 'Card', value: tx.card },
            { label: 'Status', value: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) },
            ...(tx.note ? [{ label: 'Note', value: tx.note }] : []),
          ].map(row => (
            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1,
              borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600 }}>{row.label}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Status badge */}
        <Box sx={{
          py: 1, borderRadius: '12px', textAlign: 'center',
          bgcolor: tx.status === 'completed' ? '#ECFDF5' : tx.status === 'pending' ? '#FFFBEB' : '#FEF2F2',
          color: tx.status === 'completed' ? '#059669' : tx.status === 'pending' ? '#D97706' : '#DC2626',
          fontWeight: 700, fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
        }}>
          {tx.status === 'completed' ? <CheckIcon sx={{ fontSize: '1rem' }} />
            : tx.status === 'pending' ? <PendingIcon sx={{ fontSize: '1rem' }} />
            : <CloseIcon sx={{ fontSize: '1rem' }} />}
          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: TxStatus }) {
  const map = {
    completed: { bg: '#ECFDF5', color: '#059669', label: 'Completed' },
    pending:   { bg: '#FFFBEB', color: '#D97706', label: 'Pending' },
    failed:    { bg: '#FEF2F2', color: '#DC2626', label: 'Failed' },
  };
  const s = map[status];
  return (
    <Box sx={{ px: 1.2, py: 0.4, borderRadius: '8px', bgcolor: s.bg, color: s.color,
      fontSize: '0.68rem', fontWeight: 700, display: 'inline-block', whiteSpace: 'nowrap' }}>
      {s.label}
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Transactions() {
  const [search, setSearch]       = useState('');
  // const [statusFilter, setStatus] = useState('all');
  const [typeFilter, setType]     = useState('all');
  const [selectedTx, setSelected] = useState<TransactionDisplay | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch investment and savings transactions
  const { data: investmentData, isLoading: investmentLoading } = useInvestmentTransactions();
  const { data: savingsData, isLoading: savingsLoading } = useSavingsTransactions();

  // Transform API data to display format
  const ALL_TRANSACTIONS = useMemo(() => {
    const transactions: TransactionDisplay[] = [];

    // Add investment transactions
    if (investmentData?.transactions) {
      investmentData.transactions.forEach((tx) => {
        const typeMap: Record<string, { Icon: React.ElementType; color: string; bg: string; displayType: TxType }> = {
          buy: { Icon: WalletIcon, color: '#0EA5E9', bg: '#F0F9FF', displayType: 'investment' },
          sell: { Icon: ExpenseIcon, color: '#FA510F', bg: '#FFF4F0', displayType: 'investment' },
          dividend: { Icon: GainIcon, color: '#059669', bg: '#ECFDF5', displayType: 'investment' },
          gain_update: { Icon: GainIcon, color: '#7C3AED', bg: '#EDE9FE', displayType: 'investment' },
        };
        
        const typeInfo = typeMap[tx.type] || typeMap.buy;
        
        transactions.push({
          id: tx._id,
          name: tx.description,
          category: 'Investment',
          amount: tx.type === 'buy' || tx.type === 'dividend' ? tx.amount : -tx.amount,
          date: new Date(tx.timestamp).toISOString().split('T')[0],
          status: 'completed',
          type: typeInfo.displayType,
          card: 'Investment Account',
          Icon: typeInfo.Icon,
          iconColor: typeInfo.color,
          iconBg: typeInfo.bg,
        });
      });
    }

    // Add savings transactions
    if (savingsData?.transactions) {
      savingsData.transactions.forEach((tx) => {
        const typeMap: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
          deposit: { Icon: SavingsIcon, color: '#059669', bg: '#ECFDF5' },
          withdrawal: { Icon: ExpenseIcon, color: '#FA510F', bg: '#FFF4F0' },
          interest: { Icon: GainIcon, color: '#7C3AED', bg: '#EDE9FE' },
        };
        
        const typeInfo = typeMap[tx.type] || typeMap.deposit;
        
        transactions.push({
          id: tx._id,
          name: tx.description,
          category: 'Savings',
          amount: tx.type === 'withdrawal' ? -tx.amount : tx.amount,
          date: new Date(tx.timestamp).toISOString().split('T')[0],
          status: 'completed',
          type: 'savings',
          card: 'Savings Account',
          Icon: typeInfo.Icon,
          iconColor: typeInfo.color,
          iconBg: typeInfo.bg,
        });
      });
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [investmentData, savingsData]);

  const filtered = useMemo(() => ALL_TRANSACTIONS.filter(tx => {
    if (search && !tx.name.toLowerCase().includes(search.toLowerCase()) &&
        !tx.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    return true;
  }), [search, typeFilter, ALL_TRANSACTIONS]);

  const isLoading = investmentLoading || savingsLoading;
  const totalInvestment = ALL_TRANSACTIONS.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0);
  const totalSavings    = ALL_TRANSACTIONS.filter(t => t.type === 'savings').reduce((s, t) => s + t.amount, 0);
  const totalAll        = totalInvestment + totalSavings;

  // const handleExport = () => {
  //   const rows = ['Name,Category,Amount,Date,Status',
  //     ...filtered.map(t => `${t.name},${t.category},${t.amount},${t.date},${t.status}`)];
  //   const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  //   const url  = URL.createObjectURL(blob);
  //   const a    = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click();
  //   URL.revokeObjectURL(url);
  // };

  return (
    <Box>
      {/* ── Summary cards ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3,1fr)' }, gap: { xs: 1.5, sm: 2 }, mb: 3.5 }}>
        {[
          { label: 'Total Investments', value: totalInvestment, Icon: GainIcon, color: '#0EA5E9', bg: '#F0F9FF', prefix: '$' },
          { label: 'Total Savings',     value: totalSavings,    Icon: SavingsIcon, color: '#059669', bg: '#ECFDF5', prefix: '$' },
          { label: 'Combined Total',    value: totalAll,        Icon: CardIcon, color: '#6C63FF', bg: '#F3F2FF', prefix: '$' },
        ].map(s => (
          <Box key={s.label} sx={{
            p: { xs: 1.5, sm: 2.5 }, borderRadius: '16px', bgcolor: s.bg,
            position: 'relative', overflow: 'hidden', minWidth: 0,
            transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' },
          }}>
            <Box sx={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60,
              borderRadius: '50%', bgcolor: s.color + '1a' }} />
            <Box sx={{ width: { xs: 28, sm: 36 }, height: { xs: 28, sm: 36 }, borderRadius: '10px', bgcolor: s.color + '20',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <s.Icon sx={{ color: s.color, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
            </Box>
            <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.68rem' }, color: '#9CA3AF', fontWeight: 600, mb: 0.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</Typography>
            <Typography sx={{ fontSize: { xs: '0.88rem', sm: '1.15rem' }, fontWeight: 800, color: '#0F172A', lineHeight: 1.1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <AnimatedNumber value={s.value as number} prefix={s.prefix} />
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Filter bar ── */}
      <Box sx={{ p: 2.5, borderRadius: '18px', bgcolor: '#fff',
        border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', mb: 2.5 }}>
        {/* Top row: search + actions */}
        <Box sx={{ display: 'flex', gap: 1, mb: showFilters ? 2 : 0, flexWrap: 'nowrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search…"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF', fontSize: '1rem' }} /></InputAdornment>,
                sx: { borderRadius: '12px', fontSize: '0.85rem', bgcolor: '#F8F9FA' },
              },
            }}
            sx={{ flex: 1, minWidth: 0, '& fieldset': { border: 'none' } }}
          />
          <IconButton
            onClick={() => setShowFilters(v => !v)}
            sx={{
              borderRadius: '12px', flexShrink: 0,
              bgcolor: showFilters ? '#FA510F' : '#F8F9FA',
              color: showFilters ? '#fff' : '#374151',
              '&:hover': { bgcolor: showFilters ? '#D94309' : '#EDEFF5' },
            }}
          >
            <FilterIcon fontSize="small" />
          </IconButton>
          {/* <Button
            variant="contained" onClick={handleExport}
            startIcon={<DownloadIcon sx={{ fontSize: '1rem !important' }} />}
            sx={{
              background: 'linear-gradient(135deg,#FA510F,#D94309)',
              borderRadius: '12px', textTransform: 'none', fontWeight: 700,
              fontSize: '0.78rem', px: { xs: 1.2, sm: 2 },
              minWidth: 0, flexShrink: 0,
              boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
              '&:hover': { background: 'linear-gradient(135deg,#D94309,#B33000)' },
              '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.5 } },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Export CSV</Box>
          </Button> */}
        </Box>

        {/* Expandable filter chips */}
        {showFilters && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Type */}
            <Box>
              <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 700, mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['all','investment','savings'].map(t => (
                  <Box key={t} onClick={() => setType(t)} sx={{
                    px: 1.5, py: 0.5, borderRadius: '8px', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize',
                    bgcolor: typeFilter === t ? '#FA510F' : '#F8F9FA',
                    color:  typeFilter === t ? '#fff' : '#6B7280',
                    transition: 'all 0.15s',
                  }}>{t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}</Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Transaction list ── */}
      <Box sx={{ borderRadius: '20px', bgcolor: '#fff',
        border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* List header */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
            All Transactions
          </Typography>
          <Box sx={{ px: 1.2, py: 0.3, borderRadius: '8px', bgcolor: '#F1F5F9',
            fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
            {filtered.length} results
          </Box>
        </Box>

        {/* ── Desktop table header (hidden on mobile) ── */}
        <Box sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '2fr 1fr 1fr 1fr 100px 32px',
          px: 3, py: 1.5,
          bgcolor: '#FAFBFC',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}>
          {['Description','Category','Date','Card','Status',''].map(h => (
            <Typography key={h} sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#9CA3AF',
              textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</Typography>
          ))}
        </Box>

        {/* Rows */}
        {isLoading ? (
          <Box sx={{ py: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ mb: 2, color: '#FA510F' }} />
            <Typography sx={{ fontWeight: 700, color: '#9CA3AF' }}>Loading transactions...</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <ReceiptIcon sx={{ fontSize: '2.5rem', color: '#E5E7EB', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, color: '#9CA3AF' }}>No transactions found</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#C4C9D4', mt: 0.5 }}>Try adjusting your filters</Typography>
          </Box>
        ) : (
          filtered.map((tx, idx) => (
            <Box
              key={tx.id}
              onClick={() => { setSelected(tx); setDetailOpen(true); }}
              sx={{
                cursor: 'pointer',
                borderBottom: idx < filtered.length - 1 ? '1px solid rgba(0,0,0,0.045)' : 'none',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: '#FAFBFC' },
                // Desktop: grid layout
                display: { xs: 'flex', md: 'grid' },
                gridTemplateColumns: { md: '2fr 1fr 1fr 1fr 100px 32px' },
                // Mobile: flex row
                flexDirection: { xs: 'row' },
                alignItems: 'center',
                px: 3, py: { xs: 1.8, md: 1.5 },
                gap: { xs: 1.5, md: 0 },
              }}
            >
              {/* Description */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Box sx={{
                  width: { xs: 38, md: 40 }, height: { xs: 38, md: 40 },
                  borderRadius: '12px', bgcolor: tx.iconBg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <tx.Icon sx={{ color: tx.iconColor, fontSize: '1.1rem' }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.name}
                  </Typography>
                  {/* On mobile: show category + date below name */}
                  <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF',
                    display: { xs: 'block', md: 'none' } }}>
                    {tx.category} · {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Typography>
                </Box>
              </Box>

              {/* Category — desktop only */}
              <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', display: { xs: 'none', md: 'block' } }}>
                {tx.category}
              </Typography>

              {/* Date — desktop only */}
              <Typography sx={{ fontSize: '0.82rem', color: '#6B7280', display: { xs: 'none', md: 'block' } }}>
                {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>

              {/* Card — desktop only */}
              <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', display: { xs: 'none', md: 'block' } }}>
                {tx.card}
              </Typography>

              {/* Status — desktop only */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <StatusPill status={tx.status} />
              </Box>

              {/* Amount — always shown, pushed to right on mobile */}
              <Box sx={{ ml: { xs: 'auto', md: 0 }, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.4, flexShrink: 0 }}>
                <Typography sx={{
                  fontWeight: 800, fontSize: '0.9rem',
                  color: tx.type === 'income' ? '#059669' : '#0F172A',
                  whiteSpace: 'nowrap',
                }}>
                  {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
                {/* On mobile: show status pill here */}
                <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                  <StatusPill status={tx.status} />
                </Box>
              </Box>

              {/* Chevron — desktop only */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
                <ChevronIcon sx={{ fontSize: '0.75rem', color: '#C4C9D4' }} />
              </Box>
            </Box>
          ))
        )}

        {/* Footer total */}
        {filtered.length > 0 && (
          <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.06)',
            bgcolor: '#FAFBFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
              Showing {filtered.length} of {ALL_TRANSACTIONS.length} transactions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                +${filtered.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0).toLocaleString('en-US',{minimumFractionDigits:2})}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#FA510F', fontWeight: 700 }}>
                -${Math.abs(filtered.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)).toLocaleString('en-US',{minimumFractionDigits:2})}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Detail dialog */}
      <TxDetail tx={selectedTx} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </Box>
  );
}