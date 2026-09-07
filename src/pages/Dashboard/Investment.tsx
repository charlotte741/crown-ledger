/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useInvestmentPlans, useInitializePayment, useVerifyBitcoinPayment, useCompletePayment, useCurrentUser } from '../../hooks/useAuth';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpIcon,
  AccountBalance as BankIcon,
  Agriculture as AgricIcon,
  Apartment as RealEstateIcon,
  Diamond as PremiumIcon,
  WorkspacePremium as ExclusiveIcon,
  Stars as SupremeIcon,
  EmojiEvents as TrophyIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { Chart, registerables } from 'chart.js';
import agric from "../../assets/agric.jpg"
import real from "../../assets/real.jpg"
import supreme from "../../assets/supreme.jpg"
import investment from "../../assets/investment.jpg"
import premium from "../../assets/premium.jpg"
import InputAdornment from '@mui/material/InputAdornment';

Chart.register(...registerables);

// ─── Icon and color mappings ────────────────────────────────────────────────

const iconMap: Record<string, any> = {
  'Premium Plan': PremiumIcon,
  'Exclusive Plan': ExclusiveIcon,
  'Supreme Plan': SupremeIcon,
  'Real Estate Plan': RealEstateIcon,
  'Agricultural Plan': AgricIcon,
};

const imageMap: Record<string, string> = {
  'Premium Plan': premium,
  'Exclusive Plan': investment,
  'Supreme Plan': supreme,
  'Real Estate Plan': real,
  'Agricultural Plan': agric,
};

const colorMap: Record<string, string> = {
  'Premium Plan': '#FA510F',
  'Exclusive Plan': '#6C63FF',
  'Supreme Plan': '#D97706',
  'Real Estate Plan': '#0EA5E9',
  'Agricultural Plan': '#10B981',
};

const gradientMap: Record<string, string> = {
  'Premium Plan': 'linear-gradient(135deg, #FA510F 0%, #FF8C66 100%)',
  'Exclusive Plan': 'linear-gradient(135deg, #6C63FF 0%, #A89CFF 100%)',
  'Supreme Plan': 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
  'Real Estate Plan': 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
  'Agricultural Plan': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
};

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
    const duration = 1200;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

// ─── Risk Badge ────────────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: string }) {
  const riskColors: Record<string, { bg: string; color: string }> = {
    Low: { bg: '#ECFDF5', color: '#059669' },
    Medium: { bg: '#FEF3C7', color: '#D97706' },
    High: { bg: '#FEE2E2', color: '#DC2626' },
    'Very High': { bg: '#F3E8FF', color: '#9333EA' },
  };

  const style = riskColors[risk] || riskColors.Medium;

  return (
    <Box
      sx={{
        px: 1,
        py: 0.4,
        borderRadius: '8px',
        bgcolor: style.bg,
        color: style.color,
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      {risk} Risk
    </Box>
  );
}

// ─── Allocation Chart ──────────────────────────────────────────────────────────

function AllocationChart({ allocation }: { allocation?: any }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const allocationData = allocation
    ? [
        { name: 'Equities', value: allocation.equities, color: '#FA510F' },
        { name: 'Real Estate', value: allocation.realEstate, color: '#6C63FF' },
        { name: 'Agriculture', value: allocation.agriculture, color: '#10B981' },
        { name: 'Bonds', value: allocation.bonds, color: '#3B82F6' },
      ]
    : [
        { name: 'Equities', value: 0, color: '#FA510F' },
        { name: 'Real Estate', value: 0, color: '#6C63FF' },
        { name: 'Agriculture', value: 0, color: '#10B981' },
        { name: 'Bonds', value: 0, color: '#3B82F6' },
      ];

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: allocationData.map((d) => d.name),
        datasets: [
          {
            data: allocationData.map((d) => d.value),
            backgroundColor: allocationData.map((d) => d.color),
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleColor: 'rgba(255,255,255,0.55)',
            bodyColor: '#fff',
            bodyFont: { weight: 'bold' },
            padding: 10,
            cornerRadius: 10,
            callbacks: { label: (ctx) => ` ${ctx.parsed}%` },
          },
        },
      },
    });
    const ro = new ResizeObserver(() => {
      chartRef.current?.resize();
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => {
      ro.disconnect();
      chartRef.current?.destroy();
    };
  }, [allocationData]);

  return (
    <Box ref={wrapperRef} sx={{ position: 'relative', width: '100%', height: 170 }}>
      <canvas ref={canvasRef} />
    </Box>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onViewDetails,
}: {
  plan: any;
  onViewDetails: (p: any) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const planColor = colorMap[plan.name] || '#FA510F';
  const planGradient = gradientMap[plan.name] || 'linear-gradient(135deg, #FA510F 0%, #FF8C66 100%)';
  const PlanIcon = iconMap[plan.name] || PremiumIcon;
  const planImage = imageMap[plan.name] || imageMap['Premium Plan'];

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onViewDetails(plan)}
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: hovered ? planColor + '40' : 'rgba(0,0,0,0.07)',
        boxShadow: hovered ? `0 16px 48px ${planColor}20` : '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cover */}
      <Box
        sx={{
          height: 140,
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `url('${planImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${planColor}99 0%, ${planColor}55 100%)`,
            opacity: hovered ? 0.6 : 0.7,
            transition: 'opacity 0.4s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlanIcon sx={{ color: '#fff', fontSize: '3.5rem', opacity: 0.3 }} />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with icon and title */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: planGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${planColor}35`,
              flexShrink: 0,
            }}
          >
            <PlanIcon sx={{ color: '#fff', fontSize: '1.1rem' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
              {plan.name}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', mt: 0.2 }}>
              {plan.description}
            </Typography>
          </Box>
        </Box>

        {/* Expected Return Progress */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Expected Return</Typography>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: planColor }}>
              {plan.expectedReturn}%
            </Typography>
          </Box>
          <Box sx={{ height: 6, borderRadius: '99px', bgcolor: '#F1F3F9', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${Math.min(plan.expectedReturn, 100)}%`,
                background: planGradient,
                borderRadius: '99px',
                transition: 'width 1s ease',
              }}
            />
          </Box>
        </Box>

        {/* Info Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
          <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.3 }}>
              Min Investment
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
              $50
            </Typography>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: '#FFF7ED' }}>
            <Typography sx={{ fontSize: '0.65rem', color: planColor, mb: 0.3, fontWeight: 600 }}>
              Duration
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
              {plan.duration} months
            </Typography>
          </Box>
        </Box>

        {/* Footer with risk and status */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <RiskBadge risk={plan.riskLevel} />
          <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'capitalize' }}>
            {plan.status}
          </Typography>
        </Box>
      </Box>

      {/* CTA strip */}
      <Box
        sx={{
          mx: 2.5,
          mb: 2.5,
          py: 1.2,
          borderRadius: '12px',
          background: hovered ? planGradient : '#F8F9FA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.6,
          transition: 'all 0.3s ease',
        }}
      >
        <AddIcon sx={{ fontSize: '1rem', color: hovered ? '#fff' : planColor }} />
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: hovered ? '#fff' : planColor,
          }}
        >
          Invest Now
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Plan Details Dialog ────────────────────────────────────────────────────────

function PlanDialog({
  open,
  plan,
  onClose,
  onInvest,
}: {
  open: boolean;
  plan: any | null;
  onClose: () => void;
  onInvest: (plan: any, amount: number) => void;
}) {
  const minimumInvestment = 50;
  const [amount, setAmount] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (plan) {
      setAmount('');
      setSubmitAttempted(false);
    }
  }, [plan]);

  if (!plan) return null;

  const planColor = colorMap[plan.name] || '#FA510F';
  const numericAmount = Number(amount);
  const amountIsValid = amount.trim() !== '' && Number.isFinite(numericAmount) && numericAmount >= minimumInvestment;
  const amountError = amount.trim() === ''
    ? 'Please enter an amount to invest.'
    : `Enter an amount of at least $${minimumInvestment}`;


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
            {plan.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        {/* Description */}
        <Typography sx={{ fontSize: '0.85rem', color: '#6B7280', mb: 2.5, lineHeight: 1.5 }}>
          {plan.description}
        </Typography>

        {/* Allocation Chart */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', mb: 1 }}>
            Asset Allocation
          </Typography>
          <AllocationChart allocation={plan.assetAllocation} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 1.5 }}>
            {Object.entries(plan.assetAllocation || {}).map(([key, value]: [string, any]) => {
              const colorMap: Record<string, string> = {
                equities: '#FA510F',
                realEstate: '#6C63FF',
                agriculture: '#10B981',
                bonds: '#3B82F6',
              };
              const labelMap: Record<string, string> = {
                equities: 'Equities',
                realEstate: 'Real Estate',
                agriculture: 'Agriculture',
                bonds: 'Bonds',
              };
              return (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '2px',
                        bgcolor: colorMap[key],
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      {labelMap[key]}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                    {String(value)}%
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Investment Amount */}
        <Box sx={{ mb: 2.5 }}>
          <TextField
  fullWidth
  label="Amount to invest"
  type="number"
  value={amount}
  onChange={(event) => setAmount(event.target.value)}
  slotProps={{
    htmlInput: {
      min: minimumInvestment,
      step: '0.01',
    },
    input: {
      startAdornment: (
        <InputAdornment position="start">
          $
        </InputAdornment>
      ),
    },
  }}
  error={submitAttempted && !amountIsValid}
  helperText={
    submitAttempted && !amountIsValid
      ? amountError
      : `Minimum investment is $${minimumInvestment}.`
  }
/>
        </Box>

        {/* Details Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
          {[
            { label: 'Min Investment', value: '$50', color: '#FA510F' },
            { label: 'Duration', value: `${plan.duration} months`, color: '#6C63FF' },
            { label: 'Expected Return', value: `${plan.expectedReturn}%`, color: '#10B981' },
            { label: 'Risk Level', value: plan.riskLevel, color: '#D97706' },
          ].map((item, idx) => (
            <Box key={idx} sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: item.color }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* CTA Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            setSubmitAttempted(true);
            if (amountIsValid) onInvest(plan, numericAmount);
          }}
          sx={{
            bgcolor: planColor,
            color: '#fff',
            py: 1.5,
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': {
              bgcolor: planColor,
              opacity: 0.9,
            },
          }}
        >
          Invest in {plan.name}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────

interface PaymentData {
  paymentId: string;
  paymentReference: string;
  paymentMethod: string;
  paymentType: string;
  bitcoinAddress?: string;
  amountUSD: number;
  amountBTC?: string;
  exchangeRate?: number;
  planName: string;
  instructions: string;
  message: string;
}

function PaymentModal({
  open,
  paymentData,
  onClose,
  isLoading,
  onVerifyClick,
}: {
  open: boolean;
  paymentData: PaymentData | null;
  onClose: () => void;
  isLoading?: boolean;
  onVerifyClick?: () => void;
}) {
  if (!paymentData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
            Payment Details
          </Typography>
          <IconButton onClick={onClose} size="small" disabled={isLoading}>
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        {/* Payment Info */}
        <Box sx={{ mb: 3 }}>
          {/* Plan Name */}
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
              Plan Name
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
              {paymentData.planName}
            </Typography>
          </Box>

          {/* Payment Reference */}
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
              Payment Reference
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all' }}>
              {paymentData.paymentReference}
            </Typography>
          </Box>

          {/* Payment Method */}
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
              Payment Method
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
              {paymentData.paymentMethod}
            </Typography>
          </Box>

          {/* USD Amount */}
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
              Amount (USD)
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#FA510F' }}>
              ${paymentData.amountUSD}
            </Typography>
          </Box>

          {/* BTC Amount if available */}
          {paymentData.amountBTC && (
            <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
                Amount (BTC)
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                {paymentData.amountBTC}
              </Typography>
            </Box>
          )}

          {/* Bitcoin Address */}
          {paymentData.paymentMethod?.toLowerCase() === 'bitcoin' && (
            <Box sx={{ mb: 2, p: 1.75, borderRadius: '12px', bgcolor: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#9A3412', mb: 0.6, fontWeight: 800 }}>
                Send Bitcoin to this address
              </Typography>
              {paymentData.bitcoinAddress ? (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.5 }}>
                    {paymentData.bitcoinAddress}
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label="Copy Bitcoin address"
                    onClick={() => navigator.clipboard?.writeText(paymentData.bitcoinAddress || '')}
                    sx={{ color: '#EA580C' }}
                  >
                    <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
              ) : (
                <Typography sx={{ fontSize: '0.8rem', color: '#9A3412' }}>
                  Bitcoin address unavailable. Please contact support before sending funds.
                </Typography>
              )}
            </Box>
          )}

          {/* Instructions */}
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#FEF3C7' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#92400E', fontWeight: 600, mb: 0.5 }}>
              Instructions
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#78350F', lineHeight: 1.5 }}>
              {paymentData.instructions}
            </Typography>
          </Box>

          {/* Message */}
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#ECFDF5' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#065F46', lineHeight: 1.5 }}>
              {paymentData.message}
            </Typography>
          </Box>
        </Box>

        {/* Verify Payment Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={onVerifyClick}
          disabled={isLoading}
          sx={{
            bgcolor: '#FA510F',
            color: '#fff',
            py: 1.5,
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': {
              bgcolor: '#FA510F',
              opacity: 0.9,
            },
            '&:disabled': {
              opacity: 0.6,
            },
          }}
        >
          {isLoading ? 'Processing...' : 'Verify Payment'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Verify Payment Modal ───────────────────────────────────────────────────────

interface VerifyPaymentModalProps {
  open: boolean;
  paymentReference: string;
  amountBTC: string;
  onClose: () => void;
  onVerify: (hash: string) => void;
  isLoading?: boolean;
}

function VerifyPaymentModal({
  open,
  paymentReference,
  amountBTC,
  onClose,
  onVerify,
  isLoading,
}: VerifyPaymentModalProps) {
  const [transactionHash, setTransactionHash] = useState('');

  const handleVerify = () => {
    if (!transactionHash.trim()) {
      alert('Please enter the Bitcoin transaction hash');
      return;
    }
    onVerify(transactionHash);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
            Verify Bitcoin Payment
          </Typography>
          <IconButton onClick={onClose} size="small" disabled={isLoading}>
            <CloseIcon sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </Box>

        {/* Payment Reference */}
        <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
            Payment Reference
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all' }}>
            {paymentReference}
          </Typography>
        </Box>

        {/* Amount BTC */}
        <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
            Amount (BTC)
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#FA510F' }}>
            {amountBTC}
          </Typography>
        </Box>

        {/* Bitcoin Transaction Hash Input */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.8, fontWeight: 600 }}>
            Bitcoin Transaction Hash
          </Typography>
          <input
            type="text"
            value={transactionHash}
            onChange={(e) => setTransactionHash(e.target.value)}
            placeholder="Enter your transaction hash (e.g., 4d9315506e2b4a8f...)"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#FA510F';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          />
          <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', mt: 0.8 }}>
            Enter the transaction hash from your Bitcoin wallet to confirm payment
          </Typography>
        </Box>

        {/* Verify Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleVerify}
          disabled={isLoading || !transactionHash.trim()}
          sx={{
            bgcolor: '#FA510F',
            color: '#fff',
            py: 1.5,
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': {
              bgcolor: '#FA510F',
              opacity: 0.9,
            },
            '&:disabled': {
              opacity: 0.6,
              cursor: 'not-allowed',
            },
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify Payment'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Success Modal ──────────────────────────────────────────────────────────────

interface SuccessData {
  message: string;
  data: {
    planName: string;
    amountInvested: number;
    status: string;
    maturityDate: string;
  };
}

function SuccessModal({
  open,
  successData,
  onClose,
}: {
  open: boolean;
  successData: SuccessData | null;
  onClose: () => void;
}) {
  if (!successData) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        {/* Success Icon */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              bgcolor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
            }}
          >
            <Typography sx={{ fontSize: '2rem' }}>✓</Typography>
          </Box>
        </Box>

        {/* Success Message */}
        <Typography
          sx={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#0F172A',
            mb: 1,
          }}
        >
          Investment Created Successfully!
        </Typography>

        <Typography
          sx={{
            fontSize: '0.9rem',
            color: '#6B7280',
            mb: 3,
          }}
        >
          {successData.message}
        </Typography>

        {/* Investment Details */}
        <Box sx={{ mb: 3, textAlign: 'left' }}>
          {/* Plan Name */}
          <Box sx={{ mb: 1.5, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
              Plan Name
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
              {successData.data.planName}
            </Typography>
          </Box>

          {/* Amount Invested */}
          <Box sx={{ mb: 1.5, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
              Amount Invested
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#FA510F' }}>
              ${successData.data.amountInvested}
            </Typography>
          </Box>

          {/* Status */}
          <Box sx={{ mb: 1.5, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
              Status
            </Typography>
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#10B981',
                textTransform: 'capitalize',
              }}
            >
              {successData.data.status}
            </Typography>
          </Box>

          {/* Maturity Date */}
          <Box sx={{ mb: 0, p: 1.5, borderRadius: '12px', bgcolor: '#F8F9FA' }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', mb: 0.5 }}>
              Maturity Date
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
              {formatDate(successData.data.maturityDate)}
            </Typography>
          </Box>
        </Box>

        {/* Close Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{
            bgcolor: '#FA510F',
            color: '#fff',
            py: 1.5,
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': {
              bgcolor: '#FA510F',
              opacity: 0.9,
            },
          }}
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Investments() {
  const { data: plans, isLoading } = useInvestmentPlans();
  const { mutate: initializePayment, isPending: isPaymentLoading } = useInitializePayment();
  const { mutate: verifyPayment, isPending: isVerifyLoading } = useVerifyBitcoinPayment();
  const { mutate: completePayment, isPending: isCompleteLoading } = useCompletePayment();
  const currentUser = useCurrentUser();
  
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No investment plans available</Typography>
      </Box>
    );
  }

  // Calculate statistics from plans
  const avgReturn = plans.reduce((sum: number, p: any) => sum + (p.expectedReturn || 0), 0) / plans.length;
  const minInvestment = 50;
  const maxReturn = Math.max(...plans.map((p: any) => p.expectedReturn));

  // Handle invest click
  const handleInvest = (plan: any, amount: number) => {
    if (!currentUser) {
      // console.error('User not found');
      return;
    }

    // Initialize payment with the amount entered by the user.
    initializePayment(
      {
        userId: currentUser.userId,
        planId: plan._id,
          amount, // User-selected amount; minimum is enforced in the dialog and backend
        paymentMethod: 'bitcoin', // Default payment method
      },
      {
        onSuccess: (data: any) => {
          // Support both direct API responses and responses wrapped in { data }.
          const payment = data?.data?.data ?? data?.data ?? data;
          setPaymentData({
            ...payment,
            bitcoinAddress: payment?.bitcoinAddress ?? payment?.bitcoin_address,
          } as PaymentData);
          setPaymentModalOpen(true);
          setDialogOpen(false); // Close plan details modal
        },
        onError: () => {
          // console.error('Payment initialization failed:', error);
          alert('Failed to initialize payment. Please try again.');
        },
      }
    );
  };

  // Handle verify payment click
  const handleVerifyPayment = (transactionHash: string) => {
    if (!paymentData) return;

    verifyPayment(
      {
        paymentReference: paymentData.paymentReference,
        bitcoinTransactionHash: transactionHash,
        transactionAmountBTC: parseFloat(paymentData.amountBTC || '0'),
      },
      {
        onSuccess: () => {
          // console.log('[v0] Payment verified successfully, completing payment');
          // Call complete payment API
          completePayment(
            {
              paymentReference: paymentData.paymentReference,
            },
            {
              onSuccess: (completionData) => {
                // console.log('[v0] Payment completed successfully:', completionData);
                setSuccessData({
                  message: completionData.message,
                  data: completionData.data,
                });
                setSuccessModalOpen(true);
                setVerifyModalOpen(false);
                setPaymentModalOpen(false);
              },
              onError: () => {
                // console.error('[v0] Payment completion failed:', error);
                alert('Payment completion failed. Please try again.');
              },
            }
          );
        },
        onError: () => {
          // console.error('[v0] Payment verification failed:', error);
          alert('Payment verification failed. Please check your transaction hash and try again.');
        },
      }
    );
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', mb: 0.5 }}>
          Investment Plans
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', color: '#6B7280' }}>
          Choose from our curated portfolio of investment opportunities
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2, mb: 4 }}>
        {[
          {
            label: 'Active Plans',
            value: plans?.length || 0,
            prefix: '',
            suffix: '',
            color: '#FA510F',
            bg: '#FFF4F0',
            icon: BankIcon,
            sub: 'Available plans',
          },
          {
            label: 'Min Investment',
            value: minInvestment,
            prefix: '$',
            suffix: '',
            color: '#6C63FF',
            bg: '#F3F2FF',
            icon: TrendingUpIcon,
            sub: 'Starting amount',
          },
          {
            label: 'Max Return',
            value: maxReturn,
            prefix: '',
            suffix: '%',
            color: '#059669',
            bg: '#ECFDF5',
            icon: ArrowUpIcon,
            sub: 'Highest expected',
          },
          {
            label: 'Avg. Return',
            value: avgReturn,
            prefix: '',
            suffix: '%',
            color: '#D97706',
            bg: '#FFFBEB',
            icon: TrophyIcon,
            sub: 'Across all plans',
          },
        ].map((stat, idx) => (
          <Box
            key={idx}
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: stat.bg,
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 600 }}>
                {stat.label}
              </Typography>
              <stat.icon sx={{ fontSize: '1.2rem', color: stat.color, opacity: 0.6 }} />
            </Box>
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color, mb: 0.5 }}>
              <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={0} />
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{stat.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* Allocation Chart */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Allocation
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#9CA3AF', mt: 0.3 }}>
                Current portfolio
              </Typography>
            </Box>
          </Box>
          <AllocationChart allocation={plans?.[0]?.assetAllocation} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
            {plans?.[0]?.assetAllocation &&
              Object.entries(plans[0].assetAllocation).map(([key, value]: any) => {
                const colorMap: Record<string, string> = {
                  equities: '#FA510F',
                  realEstate: '#6C63FF',
                  agriculture: '#10B981',
                  bonds: '#3B82F6',
                };
                const labelMap: Record<string, string> = {
                  equities: 'Equities',
                  realEstate: 'Real Estate',
                  agriculture: 'Agriculture',
                  bonds: 'Bonds',
                };
                return (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '2px',
                          bgcolor: colorMap[key],
                          flexShrink: 0,
                        }}
                      />
                      <Typography sx={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        {labelMap[key]}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      {value}%
                    </Typography>
                  </Box>
                );
              })}
          </Box>
        </Box>
      </Box>

      {/* Plans Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2.5 }}>
        {plans.map((plan: any) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            onViewDetails={(p) => {
              setSelectedPlan(p);
              setDialogOpen(true);
            }}
          />
        ))}
      </Box>

      {/* Plan Details Dialog */}
      <PlanDialog 
        open={dialogOpen} 
        plan={selectedPlan} 
        onClose={() => setDialogOpen(false)} 
        onInvest={handleInvest}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        paymentData={paymentData}
        onClose={() => setPaymentModalOpen(false)}
        isLoading={isPaymentLoading}
        onVerifyClick={() => setVerifyModalOpen(true)}
      />

      {/* Verify Payment Modal */}
      <VerifyPaymentModal
        open={verifyModalOpen}
        paymentReference={paymentData?.paymentReference || ''}
        amountBTC={paymentData?.amountBTC || ''}
        onClose={() => setVerifyModalOpen(false)}
        onVerify={handleVerifyPayment}
        isLoading={isVerifyLoading || isCompleteLoading}
      />

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        successData={successData}
        onClose={() => {
          setSuccessModalOpen(false);
          // Reset all payment states
          setPaymentData(null);
          setSuccessData(null);
        }}
      />
    </Box>
  );
}
