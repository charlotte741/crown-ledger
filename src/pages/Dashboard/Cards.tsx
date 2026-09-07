/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  useGetUserSavingsPlans, 
  useGetSavingsPlanById, 
  useCurrentUser,
  useDefaultSavingsPlans,
  useGetPlanTransactions,
  usePauseSavingsPlan,
  useResumeSavingsPlan,
  useCancelSavingsPlan,
  useCreateSavingsPlan,
  useGetSavingsPlanSummary,
  useInitializeSavingsPayment,
  useVerifyBitcoinPayments,
  useCompleteBitcoinSavings
} from '../../hooks/useAuth';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  IconButton,
  CircularProgress,
  Alert,
  Switch,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  AccountBalanceWallet as SavingsIcon,
  TrendingUp as TrendIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  History as HistoryIcon,
  PersonOutlined as PersonIcon,
  SavingsOutlined as AccountTypeIcon,
  PercentOutlined as ApyIcon,
  VerifiedOutlined as StatusIcon,
  Receipt as ReceiptIcon,
  ArrowUpward as WithdrawIcon,
  ArrowBackIosNew as BackIcon,
  BusinessCenterOutlined as BusinessIcon,
  HomeOutlined as RentIcon,
  SchoolOutlined as SchoolIcon,
  CakeOutlined as BirthdayIcon,
  HealthAndSafetyOutlined as EmergencyIcon,
  DevicesOtherOutlined as GadgetIcon,
  StarOutlined as EidIcon,
  ApartmentOutlined as RealEstateIcon,
  BeachAccessOutlined as SummerIcon,
  FlightTakeoffOutlined as TravelIcon,
  DirectionsCarOutlined as AutomobileIcon,
  AcUnitOutlined as ChristmasIcon,
  CelebrationOutlined as DettyIcon,
  EventOutlined as NewYearIcon,
  CategoryOutlined as OtherIcon,
  PauseCircleOutlined as PauseIcon,
  PlayCircleOutlined as ResumeIcon,
  CancelOutlined as CancelPlanIcon,
  ArrowForward as ArrowForwardIcon,
  FlagOutlined as TargetIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import type { JSX } from '@emotion/react/jsx-runtime';

// ─── Design tokens ──────────────────────────────────────────────────────────
const brand = '#FA510F';
const brandDark = '#D94309';
const ink = '#0F172A';
const grey = '#6B7280';
const faint = '#9CA3AF';
const border = 'rgba(0,0,0,0.06)';
const rowBorder = 'rgba(0,0,0,0.045)';
const shadow = '0 2px 12px rgba(0,0,0,0.05)';
const green = '#059669';
const greenBg = '#ECFDF5';
const orangeBg = '#FFF4F0';
const redBg = '#FEF2F2';
const red = '#DC2626';

const currency = (value: number) =>
  (Number.isFinite(value) ? value : 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// ─── Domain types ───────────────────────────────────────────────────────────
type Category =
  | 'business'
  | 'personal'
  | 'rent'
  | 'school_fees'
  | 'birthday'
  | 'emergency'
  | 'gadget'
  | 'eid'
  | 'real_estate'
  | 'summer_holiday'
  | 'travel'
  | 'automobile'
  | 'christmas'
  | 'detty_december'
  | 'new_year'
  | 'other';

type Duration = 3 | 6 | 9 | 12;
type Frequency = 'daily' | 'weekly' | 'monthly';
type PlanStatus = 'active' | 'paused' | 'cancelled' | 'completed';

interface PlanTransaction {
  id: string;
  type: 'deposit' | 'interest' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
}

interface SavingsPlan {
  planId: string;
  planName: string;
  description: string;
  category: Category;
  earnsInterest: boolean;
  apy: number;
  targetAmount: number;
  currentAmount: number;
  duration: Duration;
  frequency: Frequency;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  nextDepositDue: string;
  transactions: PlanTransaction[];
}

interface PlanTemplate {
  planName: string;
  category: Category;
  description: string;
}

// ─── Static reference data ──────────────────────────────────────────────────
const DEFAULT_APY = 12;

// const PLAN_TEMPLATES: PlanTemplate[] = [
//   { planName: 'Save for Rainy Days', category: 'emergency', description: 'Emergency fund for unexpected expenses' },
//   { planName: 'Detty December Funds', category: 'detty_december', description: 'Save for December celebrations and festivities' },
//   { planName: 'Mark the Big Milestone', category: 'personal', description: 'Save for important life milestones' },
//   { planName: 'Travel More Stress Less', category: 'travel', description: 'Save for your dream vacation' },
// ];

const CATEGORY_OPTIONS: Category[] = [
  'business',
  'personal',
  'rent',
  'school_fees',
  'birthday',
  'emergency',
  'gadget',
  'eid',
  'real_estate',
  'summer_holiday',
  'travel',
  'automobile',
  'christmas',
  'detty_december',
  'new_year',
  'other',
];

const CATEGORY_META: Record<Category, { label: string; icon: JSX.Element }> = {
  business: { label: 'Business', icon: <BusinessIcon sx={{ fontSize: '1.1rem' }} /> },
  personal: { label: 'Personal', icon: <PersonIcon sx={{ fontSize: '1.1rem' }} /> },
  rent: { label: 'Rent', icon: <RentIcon sx={{ fontSize: '1.1rem' }} /> },
  school_fees: { label: 'School Fees', icon: <SchoolIcon sx={{ fontSize: '1.1rem' }} /> },
  birthday: { label: 'Birthday', icon: <BirthdayIcon sx={{ fontSize: '1.1rem' }} /> },
  emergency: { label: 'Emergency', icon: <EmergencyIcon sx={{ fontSize: '1.1rem' }} /> },
  gadget: { label: 'Gadget', icon: <GadgetIcon sx={{ fontSize: '1.1rem' }} /> },
  eid: { label: 'Eid', icon: <EidIcon sx={{ fontSize: '1.1rem' }} /> },
  real_estate: { label: 'Real Estate', icon: <RealEstateIcon sx={{ fontSize: '1.1rem' }} /> },
  summer_holiday: { label: 'Summer Holiday', icon: <SummerIcon sx={{ fontSize: '1.1rem' }} /> },
  travel: { label: 'Travel', icon: <TravelIcon sx={{ fontSize: '1.1rem' }} /> },
  automobile: { label: 'Automobile', icon: <AutomobileIcon sx={{ fontSize: '1.1rem' }} /> },
  christmas: { label: 'Christmas', icon: <ChristmasIcon sx={{ fontSize: '1.1rem' }} /> },
  detty_december: { label: 'Detty December', icon: <DettyIcon sx={{ fontSize: '1.1rem' }} /> },
  new_year: { label: 'New Year', icon: <NewYearIcon sx={{ fontSize: '1.1rem' }} /> },
  other: { label: 'Other', icon: <OtherIcon sx={{ fontSize: '1.1rem' }} /> },
};

const DURATION_OPTIONS: Duration[] = [3, 6, 9, 12];
const FREQUENCY_OPTIONS: { value: Frequency; label: string; helper: string }[] = [
  { value: 'daily', label: 'Daily', helper: 'Small deposits every day' },
  { value: 'weekly', label: 'Weekly', helper: 'A deposit once a week' },
  { value: 'monthly', label: 'Monthly', helper: 'One deposit a month' },
];

const STATUS_META: Record<PlanStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: green, bg: greenBg },
  paused: { label: 'Paused', color: '#B45309', bg: '#FFFBEB' },
  cancelled: { label: 'Cancelled', color: red, bg: redBg },
  completed: { label: 'Completed', color: brand, bg: orangeBg },
};

// ─── Date + math helpers ──────────────────────��─────────────────────────────
// const addMonths = (iso: string, months: number) => {
//   const d = new Date(iso);
//   d.setMonth(d.getMonth() + months);
//   return d.toISOString();
// };

const nextDepositFrom = (iso: string, frequency: Frequency) => {
  const d = new Date(iso);
  if (frequency === 'daily') d.setDate(d.getDate() + 1);
  else if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
};

const expectedInterestFor = (targetAmount: number, apy: number, duration: Duration, earnsInterest: boolean) => {
  if (!earnsInterest) return 0;
  // Simple projected-yield estimate on the target balance over the plan's term.
  return Math.round(targetAmount * (apy / 100) * (duration / 12) * 2 * 100) / 100;
};

const installmentAmount = (targetAmount: number, duration: Duration, frequency: Frequency) => {
  const periodsPerMonth = frequency === 'daily' ? 30 : frequency === 'weekly' ? 4.33 : 1;
  const totalPeriods = Math.max(1, Math.round(duration * periodsPerMonth));
  return Math.round((targetAmount / totalPeriods) * 100) / 100;
};

// ─── Animated number ────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    ref.current = null;
    const step = (ts: number) => {
      if (!ref.current) ref.current = ts;
      const p = Math.min((ts - ref.current) / 1100, 1);
      setDisplay((1 - Math.pow(1 - p, 3)) * value);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return (
    <>
      {prefix}
      {display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </>
  );
}

// ─── Draft used while walking through the creation wizard ──────────────────
interface PlanDraft {
  planName: string;
  description: string;
  earnsInterest: boolean;
  apy: number;
  category: Category | '';
  targetAmount: string;
  duration: Duration | null;
  frequency: Frequency | '';
}

const emptyDraft = (): PlanDraft => ({
  planName: '',
  description: '',
  earnsInterest: true,
  apy: DEFAULT_APY,
  category: '',
  targetAmount: '',
  duration: null,
  frequency: '',
});

// ─── Shared bitcoin funding flow state (used for new-plan funding + top-ups) ─
type FundingMode = 'create' | 'topup';
type FundingStep = 'amount' | 'details' | 'verify' | 'confirm' | 'success';

interface FundingState {
  open: boolean;
  mode: FundingMode;
  step: FundingStep;
  amount: string;
  amountError: string;
  paymentReference: string;
  amountBTC: string;
  exchangeRate: number;
  transactionId: string;
  verifyError: string;
  loading: boolean;
  bitcoinAddress?: string;
  message?: string;
  instructions?: string;
  planName?: string;
  amountUSD?: number;
  // context for what we're funding
  draft: PlanDraft | null; // when mode === 'create'
  planId: string | null; // when mode === 'topup'
}

const emptyFunding = (): FundingState => ({
  open: false,
  mode: 'topup',
  step: 'amount',
  amount: '',
  amountError: '',
  paymentReference: '',
  amountBTC: '',
  exchangeRate: 0,
  transactionId: '',
  verifyError: '',
  loading: false,
  draft: null,
  planId: null,
});

// mock BTC/USD rate so the simulated payment details look plausible
const MOCK_BTC_RATE = 64230.5;

interface WithdrawalState {
  open: boolean;
  planId: string | null;
  amount: string;
  error: string;
  success: boolean;
}

const emptyWithdrawal = (): WithdrawalState => ({
  open: false,
  planId: null,
  amount: '',
  error: '',
  success: false,
});

// ─── Main component ─────────────────────────────────────────────────────────
export default function Cards() {
  // Get current user
  const currentUser = useCurrentUser();
  
  // Fetch user savings plans from API
  const { data: apiPlans, isLoading: plansLoading, error: plansError } = useGetUserSavingsPlans(currentUser?.userId || '');
  
  // Fetch default savings plan templates
  const { data: defaultPlans, isLoading: defaultPlansLoading } = useDefaultSavingsPlans();
  
  // Fetch selected plan details
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { data: selectedPlanDetail } = useGetSavingsPlanById(selectedPlanId || '');
  
  // Fetch transactions for selected plan
  const { data: planTransactionsData } = useGetPlanTransactions(selectedPlanId || '');
  
  // Plan action mutations
  const pauseMutation = usePauseSavingsPlan();
  const resumeMutation = useResumeSavingsPlan();
  const cancelMutation = useCancelSavingsPlan();
  
  // Plan creation and update mutations
  const createPlanMutation = useCreateSavingsPlan();
  
  // Payment mutations
  const initializePaymentMutation = useInitializeSavingsPayment();
  const verifyPaymentMutation = useVerifyBitcoinPayments();
  const completePaymentMutation = useCompleteBitcoinSavings();
  
  // Get plan summary query
  useGetSavingsPlanSummary(selectedPlanId || '');
  
  const [plans, setPlans] = useState<SavingsPlan[]>([]);
  const [view, setView] = useState<'dashboard' | 'wizard' | 'detail'>('dashboard');

  // wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft());
  const [wizardError, setWizardError] = useState('');

  // funding flow (shared between "fund a brand new plan" and "add funds to an existing plan")
  const [funding, setFunding] = useState<FundingState>(emptyFunding());
  const [withdrawal, setWithdrawal] = useState<WithdrawalState>(emptyWithdrawal());


  // plan action confirmation (pause / resume / cancel)
  const [actionConfirm, setActionConfirm] = useState<{ open: boolean; kind: 'pause' | 'resume' | 'cancel' | null; planId: string | null }>({
    open: false,
    kind: null,
    planId: null,
  });

  // Sync API plans to local state
  useEffect(() => {
    if (apiPlans && apiPlans.length > 0) {
      const mappedPlans: SavingsPlan[] = apiPlans.map((plan: any) => ({
        planId: plan._id,
        planName: plan.planName,
        description: plan.description || '',
        category: (plan.category || 'personal') as Category,
        earnsInterest: plan.earnInterest || false,
        apy: plan.interestRate || 0,
        targetAmount: plan.targetAmount || 0,
        currentAmount: plan.currentAmount || 0,
        duration: (parseInt(plan.duration) || 12) as Duration,
        frequency: (plan.frequency || 'monthly') as Frequency,
        status: (plan.status || 'active') as PlanStatus,
        startDate: plan.startDate || new Date().toISOString(),
        endDate: plan.endDate || new Date().toISOString(),
        nextDepositDue: plan.nextDepositDueDate || new Date().toISOString(),
        transactions: Array.isArray(plan.transactions) ? plan.transactions.map((t: any) => ({
          id: t._id || uid(),
          type: t.type as 'deposit' | 'interest' | 'withdrawal',
          amount: t.amount || 0,
          date: t.timestamp || new Date().toISOString(),
          description: t.description || '',
        })) : [],
      }));
      setPlans(mappedPlans);
    }
  }, [apiPlans]);

  // Update selected plan with detailed data from API
  useEffect(() => {
    if (selectedPlanDetail && selectedPlanId) {
      const updatedPlan: SavingsPlan = {
        planId: selectedPlanDetail._id || selectedPlanId,
        planName: selectedPlanDetail.planName || '',
        description: selectedPlanDetail.description || '',
        category: (selectedPlanDetail.category || 'personal') as Category,
        earnsInterest: selectedPlanDetail.earnInterest || selectedPlanDetail.earnsInterest || false,
        apy: selectedPlanDetail.interestRate || selectedPlanDetail.apy || 0,
        targetAmount: selectedPlanDetail.targetAmount || 0,
        currentAmount: selectedPlanDetail.currentAmount || 0,
        duration: (parseInt(selectedPlanDetail.duration || '12') || 12) as Duration,
        frequency: (selectedPlanDetail.frequency || 'monthly') as Frequency,
        status: (selectedPlanDetail.status || 'active') as PlanStatus,
        startDate: selectedPlanDetail.startDate || new Date().toISOString(),
        endDate: selectedPlanDetail.endDate || new Date().toISOString(),
        nextDepositDue: selectedPlanDetail.nextDepositDueDate || selectedPlanDetail.nextDepositDue || new Date().toISOString(),
        transactions: [], // Keep existing transactions from state
      };

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.planId === selectedPlanId
            ? { ...plan, ...updatedPlan, transactions: plan.transactions }
            : plan
        )
      );
    }
  }, [selectedPlanDetail, selectedPlanId]);

  // Update selected plan with transaction data from API
  useEffect(() => {
    if (planTransactionsData && selectedPlanId) {
      const mappedTransactions = planTransactionsData.transactions?.map((t: any) => ({
        id: t._id || uid(),
        type: t.type as 'deposit' | 'interest' | 'withdrawal',
        amount: t.amount || 0,
        date: t.timestamp || t.createdAt || new Date().toISOString(),
        description: t.description || '',
      })) || [];

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.planId === selectedPlanId
            ? { ...plan, transactions: mappedTransactions }
            : plan
        )
      );
    }
  }, [planTransactionsData, selectedPlanId]);

  const selectedPlan = useMemo(() => plans.find((p) => p.planId === selectedPlanId) || null, [plans, selectedPlanId]);

  const totalSavings = useMemo(() => plans.reduce((sum, p) => sum + p.currentAmount, 0), [plans]);
  const totalInterest = useMemo(() => plans.reduce((sum, p) => sum + p.transactions.filter((t) => t.type === 'interest').reduce((s, t) => s + t.amount, 0), 0), [plans]);

  // ── Wizard flow ──
  const startWizard = (template?: PlanTemplate) => {
    setDraft(
      template
        ? { ...emptyDraft(), planName: template.planName, description: template.description, category: template.category }
        : emptyDraft()
    );
    setWizardStep(1);
    setWizardError('');
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardStep(1);
    setDraft(emptyDraft());
    setWizardError('');
  };

  const validateStep = (step: number): string => {
    if (step === 1) {
      if (!draft.planName.trim()) return 'Give your plan a name.';
    }
    if (step === 3) {
      if (!draft.category) return 'Select a savings category.';
    }
    if (step === 4) {
      const amt = parseFloat(draft.targetAmount);
      if (!draft.targetAmount || isNaN(amt) || amt <= 0) return 'Enter a valid target amount.';
      if (amt > 10000000) return 'Target amount is too large.';
    }
    if (step === 5) {
      if (!draft.duration) return 'Select a duration.';
    }
    if (step === 6) {
      if (!draft.frequency) return 'Select how often you want to save.';
    }
    return '';
  };

  const goNext = () => {
    const err = validateStep(wizardStep);
    if (err) {
      setWizardError(err);
      return;
    }
    setWizardError('');
    setWizardStep((s) => Math.min(7, s + 1));
  };

  const goBack = () => {
    setWizardError('');
    setWizardStep((s) => Math.max(1, s - 1));
  };

  const targetAmountNumber = parseFloat(draft.targetAmount || '0') || 0;
  const expectedInterestPreview = draft.duration ? expectedInterestFor(targetAmountNumber, draft.apy, draft.duration, draft.earnsInterest) : 0;
  const suggestedInstallment = draft.duration && draft.frequency ? installmentAmount(targetAmountNumber, draft.duration, draft.frequency) : 0;

  // Move from the wizard's review step into the shared funding flow to make the first deposit.
  const proceedToFunding = () => {
    setWizardOpen(false);
    setFunding({
      ...emptyFunding(),
      open: true,
      mode: 'create',
      step: 'amount',
      amount: suggestedInstallment ? String(suggestedInstallment) : '',
      draft,
    });
  };

  // ── Funding flow (initialize → details → verify → confirm → success) ──
  const closeFunding = () => setFunding(emptyFunding());

  const submitFundingAmount = async () => {
    const amt = parseFloat(funding.amount);
    if (!funding.amount || isNaN(amt) || amt <= 0) {
      setFunding((f) => ({ ...f, amountError: 'Enter a valid amount.' }));
      return;
    }
    if (amt > 100000) {
      setFunding((f) => ({ ...f, amountError: 'Single deposits are limited to $100,000.' }));
      return;
    }
    
    setFunding((f) => ({ ...f, amountError: '', loading: true }));
    
    try {
      let planId = funding.planId || '';

      // If creating a new plan, create it first
      if (funding.mode === 'create' && funding.draft) {
        const d = funding.draft;
        const createResponse = await createPlanMutation.mutateAsync({
          userId: currentUser?.userId || '',
          planName: d.planName.trim(),
          description: d.description.trim(),
        });
        planId = createResponse._id;
      }

      const planName = funding.mode === 'create' && funding.draft ? funding.draft.planName : 'Savings Plan';
      
      const paymentData = await initializePaymentMutation.mutateAsync({
        userId: currentUser?.userId || '',
        savingsPlanId: planId,
        amount: amt,
        planName,
      });
      
      setFunding((f) => ({
        ...f,
        loading: false,
        step: 'details',
        paymentReference: paymentData.paymentReference,
        amountBTC: paymentData.amountBTC || (amt / MOCK_BTC_RATE).toFixed(8),
        exchangeRate: paymentData.exchangeRate || MOCK_BTC_RATE,
        bitcoinAddress: paymentData.bitcoinAddress,
        message: paymentData.message,
        instructions: paymentData.instructions,
        planName: paymentData.planName,
        amountUSD: paymentData.amountUSD,
      }));
    } catch (error) {
      // console.log('[v0] Payment initialization error:', error);
      setFunding((f) => ({ 
        ...f, 
        loading: false, 
        amountError: 'Failed to initialize payment. Please try again.' 
      }));
    }
  };

  const submitVerify = async () => {
    if (!funding.transactionId.trim()) {
      setFunding((f) => ({ ...f, verifyError: 'Please enter a transaction ID.' }));
      return;
    }
    
    setFunding((f) => ({ ...f, verifyError: '', loading: true }));
    
    try {
      await verifyPaymentMutation.mutateAsync({
        paymentReference: funding.paymentReference,
        bitcoinTransactionHash: funding.transactionId,
        transactionAmountBTC: 0
      });
      
      setFunding((f) => ({ ...f, loading: false, step: 'confirm' }));
    } catch (error) {
      // console.log('[v0] Payment verification error:', error);
      setFunding((f) => ({ 
        ...f, 
        loading: false, 
        verifyError: 'Failed to verify payment. Please check your transaction ID and try again.' 
      }));
    }
  };

  const submitConfirm = async () => {
    setFunding((f) => ({ ...f, loading: true }));
    
    try {
      const amt = parseFloat(funding.amount) || 0;
      const nowIso = new Date().toISOString();

      // Complete the payment
      await completePaymentMutation.mutateAsync({
        paymentReference: funding.paymentReference,
      });

      // Update the plans list with the new transaction
      if (funding.mode === 'topup' && funding.planId) {
        setPlans((prev) =>
          prev.map((p) =>
            p.planId === funding.planId
              ? {
                  ...p,
                  currentAmount: p.currentAmount + amt,
                  nextDepositDue: nextDepositFrom(nowIso, p.frequency),
                  status: p.status === 'completed' ? p.status : p.currentAmount + amt >= p.targetAmount ? 'completed' : p.status,
                  transactions: [{ id: uid(), type: 'deposit', amount: amt, date: nowIso, description: 'Deposit' }, ...p.transactions],
                }
              : p
          )
        );
      }

      setFunding((f) => ({ ...f, loading: false, step: 'success' }));
    } catch (error) {
      // console.log('[v0] Payment completion error:', error);
      setFunding((f) => ({ 
        ...f, 
        loading: false, 
        verifyError: 'Failed to complete payment. Please try again.' 
      }));
    }
  };

  const finishFunding = () => {
    closeFunding();
    setDraft(emptyDraft());
    setWizardStep(1);
    setView('detail');
  };

  const openTopUp = (planId: string) => {
    setFunding({ ...emptyFunding(), open: true, mode: 'topup', step: 'amount', planId });
  };

  const openWithdrawal = (planId: string) => {
    setWithdrawal({ ...emptyWithdrawal(), open: true, planId });
  };

  const submitWithdrawal = () => {
    const amount = Number.parseFloat(withdrawal.amount);
    const plan = plans.find((item) => item.planId === withdrawal.planId);

    if (!plan) return;
    if (!Number.isFinite(amount) || amount <= 0) {
      setWithdrawal((state) => ({ ...state, error: 'Enter a valid withdrawal amount.' }));
      return;
    }
    if (amount > plan.currentAmount) {
      setWithdrawal((state) => ({ ...state, error: `You can withdraw up to ${currency(plan.currentAmount)}.` }));
      return;
    }

    const nowIso = new Date().toISOString();
    setPlans((previous) => previous.map((item) => item.planId === plan.planId ? {
      ...item,
      currentAmount: item.currentAmount - amount,
      transactions: [{ id: uid(), type: 'withdrawal', amount, date: nowIso, description: 'Local demo withdrawal' }, ...item.transactions],
    } : item));
    setWithdrawal((state) => ({ ...state, success: true, error: '' }));
  };

  const closeWithdrawal = () => setWithdrawal(emptyWithdrawal());

  // ── Plan lifecycle actions ──
  const requestAction = (kind: 'pause' | 'resume' | 'cancel', planId: string) => setActionConfirm({ open: true, kind, planId });
  const closeActionConfirm = () => setActionConfirm({ open: false, kind: null, planId: null });

  const applyAction = async () => {
    if (!actionConfirm.planId || !actionConfirm.kind) return;

    try {
      if (actionConfirm.kind === 'pause') {
        await pauseMutation.mutateAsync(actionConfirm.planId);
      } else if (actionConfirm.kind === 'resume') {
        await resumeMutation.mutateAsync(actionConfirm.planId);
      } else if (actionConfirm.kind === 'cancel') {
        await cancelMutation.mutateAsync(actionConfirm.planId);
      }
      closeActionConfirm();
    } catch (error) {
      // console.log('[v0] Action error:', error);
    }
  };

  // ── Navigation helpers ──
  const openPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setView('detail');
  };
  const backToDashboard = () => {
    setSelectedPlanId(null);
    setView('dashboard');
  };

  // Show loading state
  if (plansLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (plansError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to load savings plans. {(plansError as Error)?.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {view === 'dashboard' && (
        <DashboardView
          plans={plans}
          totalSavings={totalSavings}
          totalInterest={totalInterest}
          onStartWizard={startWizard}
          onOpenPlan={openPlan}
          defaultPlans={defaultPlans}
          defaultPlansLoading={defaultPlansLoading}
          onWithdraw={openWithdrawal}
        />
      )}

      {view === 'detail' && selectedPlan && (
        <PlanDetailView
          plan={selectedPlan}
          onBack={backToDashboard}
          onAddFunds={() => openTopUp(selectedPlan.planId)}
          onWithdraw={() => openWithdrawal(selectedPlan.planId)}
          onPause={() => requestAction('pause', selectedPlan.planId)}
          onResume={() => requestAction('resume', selectedPlan.planId)}
          onCancel={() => requestAction('cancel', selectedPlan.planId)}
        />
      )}

      {/* ── Creation wizard ── */}
      <PlanWizardDialog
        open={wizardOpen}
        step={wizardStep}
        draft={draft}
        error={wizardError}
        expectedInterestPreview={expectedInterestPreview}
        suggestedInstallment={suggestedInstallment}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onNext={goNext}
        onBack={goBack}
        onClose={closeWizard}
        onFund={proceedToFunding}
      />

      {/* ── Shared funding flow (new plan + top-ups) ── */}
      <FundingFlow
        state={funding}
        onChangeAmount={(amount) => setFunding((f) => ({ ...f, amount }))}
        onSubmitAmount={submitFundingAmount}
        onProceedToVerify={() => setFunding((f) => ({ ...f, step: 'verify', transactionId: '', verifyError: '' }))}
        onChangeTransactionId={(transactionId) => setFunding((f) => ({ ...f, transactionId }))}
        onSubmitVerify={submitVerify}
        onSubmitConfirm={submitConfirm}
        onClose={closeFunding}
        onFinish={finishFunding}
      />

      {/* ── Pause / Resume / Cancel confirmation ─�� */}
      <PlanActionDialog state={actionConfirm} onClose={closeActionConfirm} onConfirm={applyAction} />
      <WithdrawalDialog
        state={withdrawal}
        plan={plans.find((plan) => plan.planId === withdrawal.planId) || null}
        onChangeAmount={(amount) => setWithdrawal((state) => ({ ...state, amount, error: '' }))}
        onSubmit={submitWithdrawal}
        onClose={closeWithdrawal}
      />
    </Box>
  );
}

// ─── Dashboard (templates + plan list) ─────────────────────────────────────
function DashboardView({
  plans,
  totalSavings,
  totalInterest,
  onStartWizard,
  onOpenPlan,
  defaultPlans,
  defaultPlansLoading,
  onWithdraw,
}: {
  plans: SavingsPlan[];
  totalSavings: number;
  totalInterest: number;
  onStartWizard: (template?: PlanTemplate) => void;
  onOpenPlan: (planId: string) => void;
  defaultPlans?: any[];
  defaultPlansLoading?: boolean;
  onWithdraw: (planId: string) => void;
}) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: ink }}>Savings</Typography>
        <Typography sx={{ fontSize: '0.78rem', color: faint, mt: 0.3 }}>
          Track balances, goals, and account activity
        </Typography>
      </Box>

      {/* ── Hero balance card ── */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 28px rgba(250,81,15,0.28)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600, mb: 0.5 }}>Total Savings</Typography>
              <Typography sx={{ fontSize: { xs: '1.7rem', sm: '2.1rem' }, fontWeight: 900, lineHeight: 1 }}>
                <AnimatedNumber value={totalSavings} />
              </Typography>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SavingsIcon sx={{ fontSize: '1.35rem' }} />
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            {[
              { label: 'Active Plans', value: String(plans.filter((p) => p.status === 'active').length) },
              { label: 'Interest Earned', value: currency(totalInterest) },
              { label: 'Total Plans', value: String(plans.length) },
            ].map((item) => (
              <Box key={item.label}>
                <Typography sx={{ fontSize: '0.62rem', opacity: 0.75, mb: 0.3, fontWeight: 600 }}>{item.label}</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Quick start templates ── */}
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: ink }}>Start a New Plan</Typography>
          <Button
            onClick={() => onStartWizard()}
            startIcon={<AddIcon sx={{ fontSize: '1rem !important' }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: brand,
              '&:hover': { bgcolor: orangeBg },
            }}
          >
            Custom Plan
          </Button>
        </Box>
        {defaultPlansLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: { xs: 1.5, sm: 2 } }}>
            {defaultPlans && defaultPlans.length > 0 ? (
              defaultPlans.map((t: any) => (
                <Box
                  key={t.planName}
                  onClick={() => onStartWizard(t)}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: '#fff',
                    border: `1px solid ${border}`,
                    boxShadow: shadow,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' },
                  }}
                >
                  <Box sx={{ mb: 1 }}>
                    <Chip label={t.category || 'Personal'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: orangeBg, color: brand }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ink, mb: 0.5 }}>{t.planName}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: faint, lineHeight: 1.3 }}>
                    {t.description || 'Start a new savings plan with this template'}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: '0.8rem', color: faint, gridColumn: '1 / -1' }}>No templates available</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* ── Plans list ── */}
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: ink, mb: 1.5 }}>Your Savings Plans</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {plans.length === 0 ? (
            <Box sx={{ p: 3, borderRadius: '16px', bgcolor: '#fff', border: `1px solid ${border}`, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.85rem', color: faint }}>No savings plans yet. Create one to get started!</Typography>
            </Box>
          ) : (
            plans.map((plan) => {
              const progress = Math.min(100, (plan.currentAmount / plan.targetAmount) * 100 || 0);
              const meta = STATUS_META[plan.status] || STATUS_META['active'];
              const categoryMeta = CATEGORY_META[plan.category] || CATEGORY_META['personal'];
              return (
                <Box
                  key={plan.planId}
                  onClick={() => onOpenPlan(plan.planId)}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: '#fff',
                    border: `1px solid ${border}`,
                    boxShadow: shadow,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#FAFBFC' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: `${brand}12`, color: brand, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {categoryMeta.icon}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {plan.planName}
                        </Typography>
                        <Chip label={meta.label} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: meta.bg, color: meta.color }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: faint, mt: 0.2 }}>
                        {currency(plan.currentAmount)} of {currency(plan.targetAmount)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ mt: 0.7, height: 5, borderRadius: 3, bgcolor: '#F1F5F9', maxWidth: 220, '& .MuiLinearProgress-bar': { bgcolor: brand, borderRadius: 3 } }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.7, flexShrink: 0, ml: 2 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: ink, whiteSpace: 'nowrap' }}>
                      {progress.toFixed(0)}%
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<WithdrawIcon sx={{ fontSize: '0.9rem !important' }} />}
                      disabled={plan.currentAmount <= 0 || plan.status === 'cancelled'}
                      onClick={(event: React.MouseEvent) => { event.stopPropagation(); onWithdraw(plan.planId); }}
                      sx={{ color: brand, bgcolor: orangeBg, borderRadius: '9px', textTransform: 'none', fontWeight: 700, fontSize: '0.68rem', minWidth: 0, px: 1, py: 0.35, '&:hover': { bgcolor: '#FFE5DA' } }}
                    >
                      Withdraw
                    </Button>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Plan detail view ────────────────────────────────────────────────────────
function PlanDetailView({
  plan,
  onBack,
  onAddFunds,
  onWithdraw,
  onPause,
  onResume,
  onCancel,
}: {
  plan: SavingsPlan;
  onBack: () => void;
  onAddFunds: () => void;
  onWithdraw: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}) {
  const progress = Math.min(100, (plan.currentAmount / plan.targetAmount) * 100 || 0);
  const remaining = Math.max(0, plan.targetAmount - plan.currentAmount);
  const interestEarned = plan.transactions.filter((t) => t.type === 'interest').reduce((s, t) => s + t.amount, 0);
  const expectedInterest = expectedInterestFor(plan.targetAmount, plan.apy, plan.duration, plan.earnsInterest);
  const meta = STATUS_META[plan.status] || STATUS_META['active'];
  const categoryMeta = CATEGORY_META[plan.category] || CATEGORY_META['personal'];
  const isLocked = plan.status === 'cancelled' || plan.status === 'completed';

  const detailRows = [
    { label: 'Savings Category', value: categoryMeta.label, icon: <AccountTypeIcon sx={{ fontSize: '1.1rem' }} /> },
    { label: 'Frequency', value: plan.frequency.charAt(0).toUpperCase() + plan.frequency.slice(1), icon: <HistoryIcon sx={{ fontSize: '1.1rem' }} /> },
    { label: 'Duration', value: `${plan.duration} months`, icon: <TargetIcon sx={{ fontSize: '1.1rem' }} /> },
    { label: 'Annual Percentage Yield', value: plan.earnsInterest ? `${plan.apy}%` : 'Not earning interest', icon: <ApyIcon sx={{ fontSize: '1.1rem' }} /> },
    { label: 'Start Date', value: formatDate(plan.startDate), icon: <StatusIcon sx={{ fontSize: '1.1rem' }} /> },
    { label: plan.status === 'active' ? 'Next Deposit Due' : 'End Date', value: formatDate(plan.status === 'active' ? plan.nextDepositDue : plan.endDate), icon: <StatusIcon sx={{ fontSize: '1.1rem' }} /> },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton size="small" onClick={onBack} sx={{ bgcolor: '#F5F6FA' }} aria-label="Back to plans">
          <BackIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: ink }}>{plan.planName}</Typography>
          <Typography sx={{ fontSize: '0.76rem', color: faint }}>{plan.description || 'Savings plan'}</Typography>
        </Box>
        <Chip label={meta.label} size="small" sx={{ ml: 'auto', fontWeight: 700, fontSize: '0.7rem', bgcolor: meta.bg, color: meta.color }} />
      </Box>

      {/* Hero */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 3 },
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 28px rgba(250,81,15,0.28)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600, mb: 0.5 }}>Current Balance</Typography>
          <Typography sx={{ fontSize: { xs: '1.7rem', sm: '2.1rem' }, fontWeight: 900, lineHeight: 1, mb: 2 }}>
            <AnimatedNumber value={plan.currentAmount} />
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.25)', mb: 1.2, '& .MuiLinearProgress-bar': { bgcolor: '#fff', borderRadius: 4 } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.72rem', opacity: 0.85 }}>{progress.toFixed(1)}% of {currency(plan.targetAmount)}</Typography>
            <Typography sx={{ fontSize: '0.72rem', opacity: 0.85 }}>{currency(remaining)} remaining</Typography>
          </Box>
        </Box>
      </Box>

      {/* Stat cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3,1fr)' }, gap: { xs: 1.5, sm: 2 }, mb: 3.5 }}>
        <Box sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: '16px', bgcolor: greenBg, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          <Box sx={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60, borderRadius: '50%', bgcolor: `${green}1a` }} />
          <Box sx={{ width: { xs: 28, sm: 36 }, height: { xs: 28, sm: 36 }, borderRadius: '10px', bgcolor: `${green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <TrendIcon sx={{ color: green, fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
          </Box>
          <Typography sx={{ fontSize: { xs: '0.6rem', sm: '0.68rem' }, color: faint, fontWeight: 600, mb: 0.3 }}>Interest Earned</Typography>
          <Typography sx={{ fontSize: { xs: '0.88rem', sm: '1.15rem' }, fontWeight: 800, color: ink, lineHeight: 1.1 }}>
            <AnimatedNumber value={interestEarned} />
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', color: faint, mt: 0.5 }}>
            {plan.earnsInterest ? `Projected ${currency(expectedInterest)} at maturity` : 'This plan does not earn interest'}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '16px', bgcolor: '#fff', border: `1px solid ${border}`, boxShadow: shadow, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
          {!isLocked && (
            <Button
              variant="outlined"
              onClick={onWithdraw}
              disabled={plan.currentAmount <= 0}
              startIcon={<WithdrawIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{ borderColor: brand, color: brand, borderRadius: '12px', textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', py: 1, '&:hover': { borderColor: brandDark, bgcolor: orangeBg } }}
            >
              Withdraw Funds
            </Button>
          )}
          {!isLocked && (
            <Button
              variant="contained"
              onClick={onAddFunds}
              startIcon={<AddIcon sx={{ fontSize: '1rem !important' }} />}
              sx={{
                background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                py: 1,
                boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
                '&:hover': { background: `linear-gradient(135deg, ${brandDark}, #B33000)` },
              }}
            >
              Add Funds
            </Button>
          )}
          {plan.status === 'active' && (
            <Button onClick={onPause} startIcon={<PauseIcon sx={{ fontSize: '1rem !important' }} />} sx={{ color: '#B45309', fontWeight: 700, textTransform: 'none', fontSize: '0.78rem', bgcolor: '#FFFBEB', borderRadius: '12px', py: 1, '&:hover': { bgcolor: '#FEF3C7' } }}>
              Pause Plan
            </Button>
          )}
          {plan.status === 'paused' && (
            <Button onClick={onResume} startIcon={<ResumeIcon sx={{ fontSize: '1rem !important' }} />} sx={{ color: green, fontWeight: 700, textTransform: 'none', fontSize: '0.78rem', bgcolor: greenBg, borderRadius: '12px', py: 1, '&:hover': { bgcolor: '#D1FAE5' } }}>
              Resume Plan
            </Button>
          )}
          {!isLocked && (
            <Button onClick={onCancel} startIcon={<CancelPlanIcon sx={{ fontSize: '1rem !important' }} />} sx={{ color: red, fontWeight: 700, textTransform: 'none', fontSize: '0.78rem', bgcolor: redBg, borderRadius: '12px', py: 1, '&:hover': { bgcolor: '#FEE2E2' } }}>
              Cancel Plan
            </Button>
          )}
          {isLocked && (
            <Typography sx={{ fontSize: '0.78rem', color: faint, textAlign: 'center', fontWeight: 600 }}>
              This plan is {plan.status} and can no longer be edited.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Details */}
      <Box sx={{ p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#fff', border: `1px solid ${border}`, boxShadow: shadow, mb: 3.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: ink, mb: 2 }}>Plan Details</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {detailRows.map((detail) => (
            <Box key={detail.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: '12px', bgcolor: '#FAFBFC', border: `1px solid ${border}` }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: `${brand}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: brand, flexShrink: 0 }}>
                {detail.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.68rem', color: faint, fontWeight: 600, mb: 0.2 }}>{detail.label}</Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: ink }}>{detail.value}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Transaction history */}
      <Box sx={{ borderRadius: '20px', bgcolor: '#fff', border: `1px solid ${border}`, boxShadow: shadow, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon sx={{ color: faint, fontSize: '1.1rem' }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: ink }}>Transaction History</Typography>
          </Box>
          <Box sx={{ px: 1.2, py: 0.3, borderRadius: '8px', bgcolor: '#F1F5F9', fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
            {plan.transactions.length} results
          </Box>
        </Box>

        {plan.transactions.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <ReceiptIcon sx={{ fontSize: '2.5rem', color: '#E5E7EB', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, color: faint }}>No transactions yet</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#C4C9D4', mt: 0.5 }}>Deposits and interest credits will appear here</Typography>
          </Box>
        ) : (
          plan.transactions.map((tx, idx) => {
            const isWithdrawal = tx.type === 'withdrawal';
            const Icon = isWithdrawal ? WithdrawIcon : tx.type === 'interest' ? TrendIcon : SavingsIcon;
            const iconColor = isWithdrawal ? brand : green;
            const iconBg = isWithdrawal ? orangeBg : greenBg;
            return (
              <Box
                key={tx.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 1.75,
                  borderBottom: idx < plan.transactions.length - 1 ? `1px solid ${rowBorder}` : 'none',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: '#FAFBFC' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: iconBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ color: iconColor, fontSize: '1.1rem' }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.description}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: faint, mt: 0.2 }}>{formatDate(tx.date)}</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: isWithdrawal ? brand : green, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {isWithdrawal ? '-' : '+'}
                  {currency(Math.abs(tx.amount))}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

// ─── Plan creation wizard (7 steps + funding hand-off) ──────────────────────
const WIZARD_STEP_LABELS = ['Name', 'Interest', 'Category', 'Target', 'Duration', 'Frequency', 'Review'];

function PlanWizardDialog({
  open,
  step,
  draft,
  error,
  expectedInterestPreview,
  suggestedInstallment,
  onChange,
  onNext,
  onBack,
  onClose,
  onFund,
}: {
  open: boolean;
  step: number;
  draft: PlanDraft;
  error: string;
  expectedInterestPreview: number;
  suggestedInstallment: number;
  onChange: (patch: Partial<PlanDraft>) => void;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  onFund: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 } } } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: ink }}>New Savings Plan</Typography>
          <IconButton size="small" onClick={onClose} sx={{ bgcolor: '#F5F6FA' }} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Step indicator */}
        <Box sx={{ display: 'flex', gap: 0.6, mb: 2.5 }}>
          {WIZARD_STEP_LABELS.map((label, i) => (
            <Box key={label} sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: i + 1 <= step ? brand : '#EEF0F3' }} />
          ))}
        </Box>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: faint, mb: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Step {step} of 7 · {WIZARD_STEP_LABELS[step - 1]}
        </Typography>

        <Box sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {step === 1 && (
            <>
              <TextField
                label="Plan name"
                placeholder="My Dream Vacation"
                value={draft.planName}
                onChange={(e) => onChange({ planName: e.target.value })}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Description (optional)"
                placeholder="Saving for a trip to Bali"
                value={draft.description}
                onChange={(e) => onChange({ description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </>
          )}

          {step === 2 && (
            <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#FAFBFC', border: `1px solid ${border}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: ink }}>Earn interest on this plan</Typography>
                  <Typography sx={{ fontSize: '0.76rem', color: faint, mt: 0.3 }}>Grow your savings automatically while you save</Typography>
                </Box>
                <Switch
                  checked={draft.earnsInterest}
                  onChange={(e) => onChange({ earnsInterest: e.target.checked })}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: brand }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: brand } }}
                />
              </Box>
              {draft.earnsInterest && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: '10px', bgcolor: orangeBg }}>
                  <ApyIcon sx={{ color: brand, fontSize: '1.1rem' }} />
                  <Typography sx={{ fontSize: '0.82rem', color: ink }}>
                    This plan earns <strong>{draft.apy}% APY</strong>, our standard rate for savings plans.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {step === 3 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, maxHeight: 300, overflowY: 'auto', pr: 0.5 }}>
              {CATEGORY_OPTIONS.map((cat) => {
                const selected = draft.category === cat;
                const catMeta = CATEGORY_META[cat] || CATEGORY_META['personal'];
                return (
                  <Box
                    key={cat}
                    onClick={() => onChange({ category: cat })}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.3,
                      borderRadius: '12px',
                      border: `1.5px solid ${selected ? brand : border}`,
                      bgcolor: selected ? orangeBg : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Box sx={{ color: selected ? brand : faint, display: 'flex' }}>{catMeta.icon}</Box>
                    <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: selected ? brand : ink }}>{catMeta.label}</Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {step === 4 && (
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: faint, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Target Amount
              </Typography>
              <TextField
                fullWidth
                placeholder="0.00"
                value={draft.targetAmount}
                onChange={(e) => onChange({ targetAmount: e.target.value })}
                type="number"
                slotProps={{
                  htmlInput: { 'aria-label': 'Target amount in dollars', step: 0.01, min: 0 },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: ink }}>$</Typography>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px', bgcolor: '#F8F9FA' },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: ink,
                    borderRadius: '12px',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: `2px solid ${brand}` },
                  },
                }}
              />
            </Box>
          )}

          {step === 5 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
              {DURATION_OPTIONS.map((d) => {
                const selected = draft.duration === d;
                return (
                  <Box
                    key={d}
                    onClick={() => onChange({ duration: d })}
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      borderRadius: '14px',
                      border: `1.5px solid ${selected ? brand : border}`,
                      bgcolor: selected ? orangeBg : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: selected ? brand : ink }}>{d}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: faint, fontWeight: 600 }}>months</Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {step === 6 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {FREQUENCY_OPTIONS.map((f) => {
                const selected = draft.frequency === f.value;
                return (
                  <Box
                    key={f.value}
                    onClick={() => onChange({ frequency: f.value })}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.75,
                      borderRadius: '14px',
                      border: `1.5px solid ${selected ? brand : border}`,
                      bgcolor: selected ? orangeBg : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: selected ? brand : ink }}>{f.label}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: faint }}>{f.helper}</Typography>
                    </Box>
                    {selected && <SuccessIcon sx={{ color: brand, fontSize: '1.2rem' }} />}
                  </Box>
                );
              })}
            </Box>
          )}

          {step === 7 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ bgcolor: orangeBg, p: 2.5, borderRadius: '14px' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: ink, mb: 0.3 }}>{draft.planName}</Typography>
                <Typography sx={{ fontSize: '0.76rem', color: grey, mb: 1.5 }}>{draft.description || 'No description added'}</Typography>
                {[
                  { label: 'Category', value: draft.category ? (CATEGORY_META[draft.category as Category] || CATEGORY_META['personal']).label : '—' },
                  { label: 'Target amount', value: currency(parseFloat(draft.targetAmount) || 0) },
                  { label: 'Duration', value: `${draft.duration} months` },
                  { label: 'Frequency', value: draft.frequency ? draft.frequency.charAt(0).toUpperCase() + draft.frequency.slice(1) : '—' },
                  { label: 'Interest', value: draft.earnsInterest ? `${draft.apy}% APY` : 'Not earning interest' },
                  { label: 'Expected interest', value: draft.earnsInterest ? currency(expectedInterestPreview) : '—' },
                  { label: 'Suggested deposit', value: `${currency(suggestedInstallment)} / ${draft.frequency || 'period'}` },
                ].map((row) => (
                  <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.6 }}>
                    <Typography sx={{ fontSize: '0.78rem', color: grey }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: ink }}>{row.value}</Typography>
                  </Box>
                ))}
              </Box>
              <Typography sx={{ fontSize: '0.74rem', color: faint, textAlign: 'center' }}>
                Next, you&apos;ll fund your plan&apos;s first deposit with Bitcoin.
              </Typography>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: '12px', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
          {step > 1 && (
            <Button
              onClick={onBack}
              fullWidth
              sx={{ color: grey, fontWeight: 700, textTransform: 'none', fontSize: '0.85rem', borderRadius: '12px', py: 1.2, bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}
            >
              Back
            </Button>
          )}
          <Button
            onClick={step === 7 ? onFund : onNext}
            fullWidth
            variant="contained"
            endIcon={step === 7 ? undefined : <ArrowForwardIcon sx={{ fontSize: '1rem !important' }} />}
            sx={{
              background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
              color: '#fff',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.85rem',
              borderRadius: '12px',
              py: 1.2,
              boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
              '&:hover': { background: `linear-gradient(135deg, ${brandDark}, #B33000)` },
            }}
          >
            {step === 7 ? 'Create Plan and Fund' : 'Continue'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Shared bitcoin funding flow (new plan first deposit + top-ups) ─────────
function FundingFlow({
  state,
  onChangeAmount,
  onSubmitAmount,
  onProceedToVerify,
  onChangeTransactionId,
  onSubmitVerify,
  onSubmitConfirm,
  onClose,
  onFinish,
}: {
  state: FundingState;
  onChangeAmount: (amount: string) => void;
  onSubmitAmount: () => void;
  onProceedToVerify: () => void;
  onChangeTransactionId: (id: string) => void;
  onSubmitVerify: () => void;
  onSubmitConfirm: () => void;
  onClose: () => void;
  onFinish: () => void;
}) {
  const title = state.mode === 'create' ? (state.draft?.planName || 'Fund Plan') : 'Add Funds';
  const parsedAmount = parseFloat(state.amount || '0') || 0;

  return (
    <Dialog open={state.open} onClose={state.loading ? undefined : onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 } } } }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: ink }}>
            {state.step === 'amount' && title}
            {state.step === 'details' && 'Payment Initiated'}
            {state.step === 'verify' && 'Verify Payment'}
            {state.step === 'confirm' && 'Confirm Payment'}
            {state.step === 'success' && 'Payment Successful!'}
          </Typography>
          {state.step !== 'success' && (
            <IconButton size="small" onClick={onClose} disabled={state.loading} sx={{ bgcolor: '#F5F6FA' }} aria-label="Close">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Step 1: amount */}
        {state.step === 'amount' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: faint, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {state.mode === 'create' ? 'First Deposit Amount' : 'Deposit Amount'}
              </Typography>
              <TextField
                fullWidth
                placeholder="0.00"
                value={state.amount}
                onChange={(e) => onChangeAmount(e.target.value)}
                disabled={state.loading}
                error={!!state.amountError}
                type="number"
                slotProps={{
                  htmlInput: { 'aria-label': 'Deposit amount in dollars', step: 0.01, min: 0, max: 100000 },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: ink }}>$</Typography>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px', bgcolor: '#F8F9FA' },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: ink,
                    borderRadius: '12px',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: `2px solid ${brand}` },
                  },
                }}
              />
            </Box>

            {state.amountError && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {state.amountError}
              </Alert>
            )}

            <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#FAFBFC', border: `1px solid ${border}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', color: grey }}>Amount</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: ink }}>{currency(parsedAmount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: `1px solid ${border}` }}>
                <Typography sx={{ fontSize: '0.8rem', color: grey, fontWeight: 700 }}>Total</Typography>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: ink }}>{currency(parsedAmount)}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button onClick={onClose} disabled={state.loading} fullWidth sx={{ color: grey, fontWeight: 700, textTransform: 'none', fontSize: '0.85rem', borderRadius: '12px', py: 1.2, bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
                Cancel
              </Button>
              <Button
                onClick={onSubmitAmount}
                disabled={state.loading || !state.amount}
                fullWidth
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                  py: 1.2,
                  boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
                  '&:hover': { background: `linear-gradient(135deg, ${brandDark}, #B33000)` },
                  '&:disabled': { background: '#E5E7EB', color: faint, boxShadow: 'none' },
                }}
              >
                {state.loading ? <CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} /> : null}
                {state.loading ? 'Processing…' : 'Continue'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: bitcoin payment details */}
        {state.step === 'details' && (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '18px', bgcolor: greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: `0 8px 24px ${green}25` }}>
              <SuccessIcon sx={{ fontSize: '1.8rem', color: green }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: ink, mb: 0.5 }}>Payment Initiated</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: grey, mb: 1.5 }}>{currency(parsedAmount)} deposit initiated</Typography>
            
            {/* Bitcoin Address and Instructions */}
            {state.bitcoinAddress && (
              <Box sx={{ bgcolor: orangeBg, p: 2.5, borderRadius: '12px', textAlign: 'left', mb: 2 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: brand, mb: 1.5, textTransform: 'uppercase' }}>Bitcoin Address</Typography>
                <Box sx={{ bgcolor: '#fff', p: 1.5, borderRadius: '8px', mb: 1.5, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: ink, wordBreak: 'break-all', flex: 1, fontFamily: 'monospace' }}>{state.bitcoinAddress}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(state.bitcoinAddress || '');
                    }}
                    sx={{ flexShrink: 0, color: brand }}
                    aria-label="Copy bitcoin address"
                  >
                    <CopyIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
                
                {state.instructions && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: grey, mb: 0.5 }}>Instructions:</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: ink, lineHeight: 1.5 }}>{state.instructions}</Typography>
                  </Box>
                )}
                
                {state.message && (
                  <Box sx={{ mb: 1 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: grey, mb: 0.5 }}>Message:</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: ink, lineHeight: 1.5 }}>{state.message}</Typography>
                  </Box>
                )}
              </Box>
            )}
            
            <Box sx={{ bgcolor: orangeBg, p: 2, borderRadius: '12px', textAlign: 'left', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: brand, mb: 1, textTransform: 'uppercase' }}>Payment Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: grey }}>Reference:</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink }}>{state.paymentReference}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: grey }}>Amount BTC:</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink }}>{state.amountBTC}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.72rem', color: grey }}>Exchange Rate:</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: ink }}>${state.exchangeRate.toLocaleString('en-US')}</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
              <Button onClick={onClose} fullWidth sx={{ color: grey, fontWeight: 700, textTransform: 'none', fontSize: '0.85rem', borderRadius: '12px', py: 1.2, bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
                Cancel
              </Button>
              <Button
                onClick={onProceedToVerify}
                fullWidth
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                  py: 1.2,
                  boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
                  '&:hover': { background: `linear-gradient(135deg, ${brandDark}, #B33000)` },
                }}
              >
                Verify
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: verify */}
        {state.step === 'verify' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ bgcolor: greenBg, p: 2, borderRadius: '12px', mb: 1 }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: grey, mb: 0.5, textTransform: 'uppercase' }}>Payment Reference</Typography>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: ink }}>{state.paymentReference}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: faint, mb: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Transaction ID / Hash
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter your Bitcoin transaction hash"
                value={state.transactionId}
                onChange={(e) => onChangeTransactionId(e.target.value)}
                error={!!state.verifyError}
                multiline
                rows={3}
                slotProps={{ input: { sx: { borderRadius: '12px', bgcolor: '#F8F9FA' } } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    borderRadius: '12px',
                    '& fieldset': { border: 'none' },
                    '&.Mui-focused fieldset': { border: `2px solid ${brand}` },
                  },
                }}
              />
            </Box>
            {state.verifyError && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                {state.verifyError}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button onClick={onClose} fullWidth sx={{ color: grey, fontWeight: 700, textTransform: 'none', fontSize: '0.85rem', borderRadius: '12px', py: 1.2, bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
                Cancel
              </Button>
              <Button
                onClick={onSubmitVerify}
                disabled={!state.transactionId.trim() || state.loading}
                fullWidth
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                  py: 1.2,
                  boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
                  '&:hover': { background: `linear-gradient(135deg, ${brandDark}, #B33000)` },
                  '&:disabled': { background: '#E5E7EB', color: faint, boxShadow: 'none' },
                }}
              >
                {state.loading ? <CircularProgress size={20} sx={{ color: faint }} /> : 'Verify Payment'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 4: confirm */}
        {state.step === 'confirm' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ bgcolor: greenBg, p: 2.5, borderRadius: '12px' }}>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: faint, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Payment Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.85rem', color: grey }}>Amount</Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: ink }}>{currency(parsedAmount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${border}` }}>
                  <Typography sx={{ fontSize: '0.85rem', color: grey }}>Payment Reference</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: brand, fontFamily: 'monospace' }}>{state.paymentReference}</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ bgcolor: orangeBg, p: 2, borderRadius: '12px', border: `1px solid ${border}` }}>
              <Typography sx={{ fontSize: '0.8rem', color: ink, lineHeight: 1.5 }}>
                Please confirm that you have sent the Bitcoin payment and the transaction ID has been verified. This action will
                {state.mode === 'create' ? ' create your savings plan.' : ' complete your deposit.'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
              <Button onClick={onClose} disabled={state.loading} fullWidth sx={{ color: grey, fontWeight: 700, textTransform: 'none', fontSize: '0.85rem', borderRadius: '12px', py: 1.2, bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' }, '&:disabled': { bgcolor: '#E5E7EB', color: faint } }}>
                Cancel
              </Button>
              <Button
                onClick={onSubmitConfirm}
                disabled={state.loading}
                fullWidth
                variant="contained"
                sx={{
                  background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                  color: '#fff',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                  py: 1.2,
                  boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
                  '&:hover': { background: `linear-gradient(135deg, ${brandDark}, #B33000)` },
                  '&:disabled': { background: '#E5E7EB', color: faint, boxShadow: 'none' },
                }}
              >
                {state.loading ? <CircularProgress size={20} sx={{ color: faint }} /> : 'Confirm Payment'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 5: success */}
        {state.step === 'success' && (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                bgcolor: greenBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: `0 12px 32px ${green}20`,
              }}
            >
              <SuccessIcon sx={{ fontSize: '2.2rem', color: green }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: ink, mb: 1 }}>
              {state.mode === 'create' ? 'Plan Created!' : 'Payment Successful!'}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: grey, mb: 3, lineHeight: 1.6 }}>
              {state.mode === 'create'
                ? 'Your Bitcoin payment has been verified and your new savings plan is now active.'
                : 'Your Bitcoin payment has been verified and your savings plan has been credited.'}
            </Typography>
            <Button
              onClick={onFinish}
              fullWidth
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${brand}, ${brandDark})`,
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.85rem',
                borderRadius: '12px',
                py: 1.2,
                boxShadow: '0 4px 14px rgba(250,81,15,0.3)',
                '&:hover': { background: `linear-gradient(135deg, ${brandDark}, #B33000)` },
              }}
            >
              Done
            </Button>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

function WithdrawalDialog({
  state,
  plan,
  onChangeAmount,
  onSubmit,
  onClose,
}: {
  state: WithdrawalState;
  plan: SavingsPlan | null;
  onChangeAmount: (amount: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 } } } }}>
      <Box sx={{ p: 3 }}>
        {state.success ? (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 72, height: 72, borderRadius: '20px', bgcolor: greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <SuccessIcon sx={{ color: green, fontSize: '2.2rem' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: ink, mb: 1 }}>Withdrawal successful</Typography>Your withdrawal request is submitted to the administrator successfully.
            <Typography sx={{ color: grey, fontSize: '0.85rem', lineHeight: 1.6, mb: 3 }}></Typography>
            <Button onClick={onClose} fullWidth variant="contained" sx={{ bgcolor: brand, borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: brandDark } }}>Done</Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: ink }}>Withdraw funds</Typography>
                <Typography sx={{ color: faint, fontSize: '0.75rem', mt: 0.3 }}>{plan?.planName || 'Savings plan'}</Typography>
              </Box>
              <IconButton size="small" onClick={onClose} sx={{ bgcolor: '#F5F6FA' }} aria-label="Close withdrawal dialog"><CloseIcon fontSize="small" /></IconButton>
            </Box>
            <Typography sx={{ color: grey, fontSize: '0.82rem', mb: 1 }}>Available balance: <strong>{currency(plan?.currentAmount || 0)}</strong></Typography>
            <TextField
              autoFocus fullWidth type="number" label="Withdrawal amount" value={state.amount} onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChangeAmount(event.target.value)} error={!!state.error} helperText={state.error || ''}
              slotProps={{ htmlInput: { min: 0.01, max: plan?.currentAmount || 0, step: 0.01 }, input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
              <Button onClick={onClose} fullWidth sx={{ color: grey, bgcolor: '#F5F6FA', borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>Cancel</Button>
              <Button onClick={onSubmit} fullWidth variant="contained" startIcon={<WithdrawIcon />} sx={{ bgcolor: brand, borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: brandDark } }}>Withdraw</Button>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
}

// ─── Pause / Resume / Cancel confirmation dialog ────────────────────────────
function PlanActionDialog({
  state,
  onClose,
  onConfirm,
}: {
  state: { open: boolean; kind: 'pause' | 'resume' | 'cancel' | null; planId: string | null };
  onClose: () => void;
  onConfirm: () => void;
}) {
  const copy = {
    pause: { title: 'Pause this plan?', body: 'You can resume this plan at any time. Scheduled deposits will stop until you resume.', confirmLabel: 'Pause Plan', color: '#B45309', bg: '#FFFBEB' },
    resume: { title: 'Resume this plan?', body: 'Your plan will become active again and scheduled deposits will continue.', confirmLabel: 'Resume Plan', color: green, bg: greenBg },
    cancel: { title: 'Cancel this plan?', body: 'This cannot be undone. Your saved balance stays in your account, but this plan will be closed.', confirmLabel: 'Cancel Plan', color: red, bg: redBg },
  } as const;

  const active = state.kind ? copy[state.kind] : null;

  return (
    <Dialog open={state.open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '24px', m: { xs: 1.5, sm: 3 } } } }}>
      {active && (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: ink, mb: 1 }}>{active.title}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: grey, mb: 3, lineHeight: 1.6 }}>{active.body}</Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button onClick={onClose} fullWidth sx={{ color: grey, fontWeight: 700, textTransform: 'none', fontSize: '0.85rem', borderRadius: '12px', py: 1.2, bgcolor: '#F5F6FA', '&:hover': { bgcolor: '#EDEFF5' } }}>
              Go Back
            </Button>
            <Button
              onClick={onConfirm}
              fullWidth
              variant="contained"
              sx={{ bgcolor: active.color, color: '#fff', fontWeight: 700, textTransform: 'none', fontSize: '0.85rem', borderRadius: '12px', py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: active.color, opacity: 0.9 } }}
            >
              {active.confirmLabel}
            </Button>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
