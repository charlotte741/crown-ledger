import React from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useInvestmentDetails } from '../../hooks/useAuth';

interface InvestmentDetailsModalProps {
  open: boolean;
  investmentId?: string;
  onClose: () => void;
  onWithdraw?: (investmentId: string) => void;
}

const InvestmentDetailsModal: React.FC<InvestmentDetailsModalProps> = ({
  open,
  investmentId,
  onClose,
  onWithdraw,
}) => {
  const { data: investmentData, isLoading } = useInvestmentDetails(investmentId);

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
        backgroundImage: 'none',
      },
    },
  }}
>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
          Investment Details
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#9CA3AF',
            '&:hover': { bgcolor: '#F8F9FA' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#FA510F' }} />
          </Box>
        ) : investmentData ? (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Plan Name */}
            <Box sx={{
              p: 2.5,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FA510F 0%, #D94309 100%)',
              color: '#fff',
            }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                Plan Name
              </Typography>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800 }}>
                {investmentData.planName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>
                <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                Status: <strong>{investmentData.status.charAt(0).toUpperCase() + investmentData.status.slice(1)}</strong>
              </Box>
            </Box>

            {/* Key Metrics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {[
                { label: 'Amount Invested', value: `$${investmentData.amountInvested.toFixed(2)}`, icon: WalletIcon },
                { label: 'Current Value', value: `$${investmentData.currentValue.toFixed(2)}`, icon: TrendingUpIcon },
                { label: 'Total Gain', value: `$${investmentData.totalGain.toFixed(2)}`, icon: TrendingUpIcon, color: '#059669' },
                { label: 'Return %', value: `${investmentData.gainPercentage.toFixed(2)}%`, icon: TrendingUpIcon, color: '#059669' },
              ].map((metric) => (
                <Box
                  key={metric.label}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#F8F9FA',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                    <metric.icon sx={{ fontSize: '1rem', color: metric.color || '#FA510F' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600 }}>
                      {metric.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                    {metric.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Dates */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              {[
                { label: 'Investment Date', date: new Date(investmentData.investmentDate).toLocaleDateString() },
                { label: 'Maturity Date', date: new Date(investmentData.maturityDate).toLocaleDateString() },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#F8F9FA',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                    <CalendarIcon sx={{ fontSize: '1rem', color: '#0EA5E9' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    {item.date}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button fullWidth variant="outlined" onClick={() => investmentId && onWithdraw?.(investmentId)} startIcon={<WalletIcon />} sx={{ borderColor: '#FA510F', color: '#FA510F', borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { borderColor: '#D94309', bgcolor: '#FFF4F0' } }}>Withdraw Funds</Button>

            {/* Monthly Performance Table */}
            {investmentData.monthlyPerformance && investmentData.monthlyPerformance.length > 0 && (
              <Box sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.06)',
                bgcolor: '#FAFBFC',
                maxHeight: 300,
                overflowY: 'auto',
              }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
                  Monthly Performance Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  {investmentData.monthlyPerformance.map((perf, idx) => (
                    <Box
                      key={perf._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.2,
                        borderRadius: '10px',
                        bgcolor: idx % 2 === 0 ? 'rgba(250,81,15,0.05)' : 'transparent',
                        transition: 'bgcolor 0.15s',
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                          {perf.month}/{perf.year}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#9CA3AF' }}>
                          ${perf.value.toFixed(2)}
                        </Typography>
                        <Typography sx={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: perf.return >= 0 ? '#059669' : '#DC2626',
                          minWidth: 60,
                          textAlign: 'right',
                        }}>
                          {perf.return >= 0 ? '+' : ''}{perf.return.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ color: '#9CA3AF' }}>Unable to load investment details</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentDetailsModal;
