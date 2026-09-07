/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../utils/apiClientBackend';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  username: string;
  phoneNumber: string;
  country: string;
  currency: string;
  accountType: string;
  pin: string;
  agreedToTerms: boolean | string;
}

interface VerifyEmailData {
  token: string;
  email: string;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface ResetPasswordData {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      username: string;
      accountType: string;
      isAdmin: boolean;
    };
  };
}

// ─── Dashboard Overview Types ─────────────────────────────────────────────────
interface DashboardOverviewResponse {
  success: boolean;
  data: {
    user: any;
    balances: {
      totalBalance: number;
      investmentsBalance: number;
      savingsBalance: number;
    };
    investments: {
      totalInvested: number;
      currentValue: number;
      totalGain: number;
      gainPercentage: number;
      count: number;
    };
    savings: {
      balance: number;
      monthlyInterest: number;
      apy: number;
      totalInterestEarned: number;
    };
    dailyGrowth: {
      totalDailyGain: number;
      dailyGrowthPercentage: number;
    };
    portfolioSummary: {
      totalInvested: number;
      activePlans: number;
      portfolioValue: number;
      totalGains: number;
      avgReturn: number;
      lastUpdated: string;
    };
    performance: Array<{
      month: number;
      year: number;
      value: number;
    }>;
    allocation: {
      equities: number;
      realEstate: number;
      agriculture: number;
      bonds: number;
    };
    investmentsList: Array<{
      _id: string;
      userId: string;
      planId: string;
      planName: string;
      amountInvested: number;
      currentValue: number;
      totalGain: number;
      gainPercentage: number;
      monthlyPerformance: Array<{
        month: number;
        year: number;
        value: number;
        return: number;
        _id: string;
      }>;
      investmentDate: string;
      maturityDate: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    }>;
  };
}

// ─── Investment Plans Types ────────────────────────────────────────────────────
interface InvestmentPlan {
  _id: string;
  name: string;
  description: string;
  minInvestment: number;
  duration: number;
  riskLevel: string;
  expectedReturn: number;
  status: string;
  assetAllocation: {
    equities: number;
    realEstate: number;
    agriculture: number;
    bonds: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface InvestmentPlansResponse {
  success: boolean;
  data: InvestmentPlan[];
}

export interface WalletLookupResult {
  accountNumber: string;
  balance: number;
  currency: string;
  status: string;
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    username: string;
    email: string;
  };
}

interface WalletLookupResponse {
  success: boolean;
  message?: string;
  data: WalletLookupResult;
}

export interface CreditWalletRequest {
  accountNumber: string;
  amount: number;
  reason?: string;
}

export interface CreditWalletData {
  accountNumber: string;
  amountChanged: number;
  balanceBefore: number;
  balanceAfter: number;
}

interface CreditWalletResponse {
  success: boolean;
  message: string;
  data: CreditWalletData;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface AdminWithdrawalRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  walletId: {
    _id: string;
    accountNumber: string;
    balance: number;
    currency: string;
  };
  amount: number;
  bitcoinAddress: string;
  status: WithdrawalStatus;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminWithdrawalsResponse {
  success: boolean;
  message?: string;
  data: AdminWithdrawalRequest[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const useAdminWithdrawals = (
  status: WithdrawalStatus | '' = '',
  page = 1,
  limit = 20
) => {
  return useQuery({
    queryKey: ['admin-withdrawals', status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      params.set('limit', String(limit));

      let response: AdminWithdrawalsResponse;
      try {
        response = (await apiClient(`admin/withdrawals?${params.toString()}`, {
          method: 'GET',
        })) as AdminWithdrawalsResponse;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to fetch withdrawal requests');
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch withdrawal requests');
      }

      return response;
    },
  });
};

// ─── Review Withdrawal Hook (Admin) ────────────────────────────────────────────
export interface ReviewWithdrawalRequest {
  withdrawalId: string;
  decision: 'approve' | 'reject';
  note?: string;
}

interface ReviewWithdrawalResponse {
  success: boolean;
  message: string;
  data: AdminWithdrawalRequest;
}

export const useReviewWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ withdrawalId, ...payload }: ReviewWithdrawalRequest) => {
      const response = (await apiClient(`admin/withdrawals/${withdrawalId}/review`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })) as ReviewWithdrawalResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to review withdrawal request');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-balances'] });
    },
  });
};

export const useWalletLookup = (accountNumber: string) => {
  return useQuery({
    queryKey: ['wallet-lookup', accountNumber],
    queryFn: async () => {
      let response: WalletLookupResponse;
      try {
        response = (await apiClient(`admin/wallet/lookup/${accountNumber}`, {
          method: 'GET',
        })) as WalletLookupResponse;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Account not found');
      }

      if (!response.success) {
        throw new Error(response.message || 'Account not found');
      }

      return response.data;
    },
    enabled: accountNumber.trim().length >= 10,
    retry: false,
    staleTime: 30_000,
  });
};

export const useCreditWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreditWalletRequest) => {
      const response = (await apiClient('admin/wallet/credit', {
        method: 'PUT',
        body: JSON.stringify(payload),
      })) as CreditWalletResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to credit wallet');
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-lookup', data.accountNumber] });
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
  });
};

// ─── Signup Hook ──────────────────────────────────────────────────────────────
export const useSignup = () => {
  return useMutation({
    mutationFn: async (signupData: SignupData) => {
      const response = await apiClient('auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      });
      return response;
    },
  });
};

// ─── Verify Email Hook ────────────────────────────────────────────────────────
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (verifyData: VerifyEmailData) => {
      const response = await apiClient('auth/verify-email', {
        method: 'POST',
        body: JSON.stringify(verifyData),
      });
      return response;
    },
  });
};

// ─── Login Hook ───────────────────────────────────────────────────────────────
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loginData: LoginData) => {
      const { rememberMe, ...loginPayload } = loginData;
      
      const response = await apiClient('auth/login', {
        method: 'POST',
        body: JSON.stringify(loginPayload),
      }) as LoginResponse;

      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // If remember me is checked, set a flag to persist session for 30 days
        if (rememberMe) {
          const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
          localStorage.setItem('rememberMeExpiry', expiryTime.toString());
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberMeExpiry');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      return response;
    },
  });
};

// ─── Forgot Password Hook ─────────────────────────────────────────────────────
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient('auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    },
  });
};

// ─── Reset Password Hook ──────────────────────────────────────────────────────
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (resetData: ResetPasswordData) => {
      const response = await apiClient('auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(resetData),
      });
      return response;
    },
  });
};

// ─── Change Password Hook ─────────────────────────────────────────────────────
interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (changeData: ChangePasswordData) => {
      const response = await apiClient('auth/change-password', {
        method: 'POST',
        body: JSON.stringify(changeData),
      }) as ChangePasswordResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }

      return response;
    },
  });
};

// ─── Refresh Token Hook ───────────────────────────────────────────────────────
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await apiClient('auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }) as RefreshTokenResponse;

      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      return response;
    },
    onError: () => {
      // If refresh fails, force logout (tokens are invalid)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      queryClient.clear();
      window.location.href = '/login';
    },
  });
};

// ─── Logout Hook ───────────────────────────────────────────────────────────────
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      queryClient.clear();
    },
  });
};

// ─── Get Current User Hook ────────────────────────────────────────────────────
export const useCurrentUser = () => {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  return userStr ? JSON.parse(userStr) : null;
};

// ─── Dashboard Overview Hook ──────────────────────────────────────────────────
export const useDashboardOverview = (userId?: string) => {
  // Get userId from localStorage if not provided
  const currentUser = useCurrentUser();
  const finalUserId = userId || currentUser?.userId;

  return useQuery({
    queryKey: ['dashboard-overview', finalUserId],
    queryFn: async () => {
      const response = await apiClient(`dashboard/${finalUserId}/overview`, {
        method: 'GET',
      }) as DashboardOverviewResponse;
      
      if (!response.success) {
        throw new Error('Failed to fetch dashboard overview');
      }
      
      return response.data;
    },
    enabled: !!finalUserId, // Only run query if userId is available
  });
};

// ─── Investment Plans Hook ────────────────────────────────────────────────────
export const useInvestmentPlans = () => {
  return useQuery({
    queryKey: ['investment-plans'],
    queryFn: async () => {
      const response = await apiClient('investments/plans', {
        method: 'GET',
      }) as InvestmentPlansResponse;
      
      if (!response.success) {
        throw new Error('Failed to fetch investment plans');
      }
      
      return response.data;
    },
  });
};

// ─── Monthly Performance Hook ──────────────────────────────────────────────────
interface MonthlyTrend {
  month: number;
  year: number;
  monthName: string;
  value: number;
  date: string;
  monthOverMonthGrowth: number;
}

interface MonthlyPerformanceSummary {
  totalMonths: number;
  currentValue: number;
  startingValue: number;
  totalReturnPercentage: number;
  compoundMonthlyGrowthRate: number;
  highestMonth: MonthlyTrend;
  lowestMonth: MonthlyTrend;
}

interface MonthlyPerformanceResponse {
  success: boolean;
  message: string;
  data: {
    monthlyTrends: MonthlyTrend[];
    summary: MonthlyPerformanceSummary;
    lastUpdated: string;
  };
}

export const useMonthlyPerformance = (userId?: string) => {
  // Get userId from localStorage if not provided
  const currentUser = useCurrentUser();
  const finalUserId = userId || currentUser?.userId;

  return useQuery({
    queryKey: ['monthly-performance', finalUserId],
    queryFn: async () => {
      const response = await apiClient(`dashboard/${finalUserId}/monthly-performance`, {
        method: 'GET',
      }) as MonthlyPerformanceResponse;
      
      if (!response.success) {
        throw new Error('Failed to fetch monthly performance data');
      }
      
      return response.data;
    },
    enabled: !!finalUserId, // Only run query if userId is available
  });
};

// ─── Payment Initialization Hook ───────────────────────────────
interface PaymentInitializeRequest {
  userId: string;
  planId: string;
  amount: number;
  paymentMethod: 'bitcoin' | 'cashapp';
}

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

interface PaymentInitializeResponse {
  success: boolean;
  message?: string;
  data: PaymentData;
}

export const useInitializePayment = () => {
  return useMutation({
    mutationFn: async (paymentData: PaymentInitializeRequest) => {
      const response = (await apiClient('investments/payment/initialize', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      })) as PaymentInitializeResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to initialize payment');
      }

      return response.data;
    },
  });
};

// ─── Payment Verification Hook ────────────────────────────────
interface VerifyBitcoinPaymentRequest {
  paymentReference: string;
  bitcoinTransactionHash: string;
  transactionAmountBTC: number;
}

interface VerifiedPaymentData {
  paymentId: string;
  paymentReference: string;
  status: string;
  amount: number;
  currency: string;
  transactionHash: string;
  confirmations: number;
  verifiedAt: string;
}

interface VerifyBitcoinPaymentResponse {
  success: boolean;
  message: string;
  data: VerifiedPaymentData;
}

export const useVerifyBitcoinPayment = () => {
  return useMutation({
    mutationFn: async (verifyData: VerifyBitcoinPaymentRequest) => {
      const response = (await apiClient('payments/verify-bitcoin-reference', {
        method: 'POST',
        body: JSON.stringify(verifyData),
      })) as VerifyBitcoinPaymentResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to verify payment');
      }

      return response.data;
    },
  });
};

// ─── Complete Bitcoin Payment Hook ────────────────────────────
interface CompletePaymentRequest {
  paymentReference: string;
}

interface CompletePaymentData {
  investmentId: string;
  planName: string;
  amountInvested: number;
  status: string;
  maturityDate: string;
}

interface CompletePaymentResponse {
  success: boolean;
  message: string;
  data: CompletePaymentData;
}

export const useCompletePayment = () => {
  return useMutation({
    mutationFn: async (completeData: CompletePaymentRequest) => {
      const response = (await apiClient('payments/complete-bitcoin-payment', {
        method: 'POST',
        body: JSON.stringify(completeData),
      })) as CompletePaymentResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to complete payment');
      }

      return {
        message: response.message,
        data: response.data,
      };
    },
  });
};

// ─── Investment Details Hook ──────────────────────────────────────────────────
interface MonthlyPerformanceDetail {
  month: number;
  year: number;
  value: number;
  return: number;
  _id: string;
}

interface InvestmentDetails {
  _id: string;
  userId: string;
  planId: string;
  planName: string;
  amountInvested: number;
  currentValue: number;
  totalGain: number;
  gainPercentage: number;
  monthlyPerformance: MonthlyPerformanceDetail[];
  investmentDate: string;
  maturityDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface InvestmentDetailsResponse {
  success: boolean;
  data: InvestmentDetails;
}

export const useInvestmentDetails = (investmentId?: string) => {
  return useQuery({
    queryKey: ['investment-details', investmentId],
    queryFn: async () => {
      const response = await apiClient(`investments/investment/${investmentId}`, {
        method: 'GET',
      }) as InvestmentDetailsResponse;
      
      if (!response.success) {
        throw new Error('Failed to fetch investment details');
      }
      
      return response.data;
    },
    enabled: !!investmentId, // Only run query if investmentId is available
  });
};

// ─── Get User Balance Details Hook ────────────────────────────────────────────
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

interface UserBalanceDetails {
  user: BalanceDetailsUser;
  investments: {
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
  };
  savings: {
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
  };
}

interface UserBalanceDetailsResponse {
  success: boolean;
  data: UserBalanceDetails;
}

export const useGetUserBalanceDetails = (userId?: string) => {
  const currentUser = useCurrentUser();
  const finalUserId = userId || currentUser?.userId;

  return useQuery({
    queryKey: ['user-balance-details', finalUserId],
    queryFn: async () => {
      const response = await apiClient(`admin/user/${finalUserId}/balance-details`, {
        method: 'GET',
      }) as UserBalanceDetailsResponse;

      if (!response.success) {
        throw new Error('Failed to fetch user balance details');
      }

      return response.data;
    },
    enabled: !!finalUserId,
  });
};

// ─── Update Investment Balance Hook ───────────────────────────────────────────
interface UpdateInvestmentBalanceRequest {
  userId: string;
  amount: number;
  reason?: string;
  action?: 'add' | 'subtract' | 'set';
  investmentId?: string;
}

interface UpdateInvestmentBalanceResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    investmentId?: string;
    previousBalance: number;
    newBalance: number;
    amountChanged: number;
    timestamp: string;
  };
}

export const useUpdateUserInvestmentBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, ...updateData }: UpdateInvestmentBalanceRequest) => {
      const response = await apiClient(
        `admin/user/${userId}/update-investment-balance`,
        { method: 'PUT', body: JSON.stringify(updateData) }
      ) as UpdateInvestmentBalanceResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to update investment balance');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-balance-details'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['investment-details'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-balances'] }); // adjust to your actual key for useAdminUsersBalances
    },
  });
};

// ─── Compare Investments Hook ────────────────────────────────────────────────
interface CompareInvestment {
  id: string;
  planName: string;
  amountInvested: number;
  currentValue: number;
  totalGain: number;
  gainPercentage: number;
  investmentDate: string;
  maturityDate: string;
  daysRemaining: number;
}

interface CompareInvestmentsResponse {
  success: boolean;
  data: CompareInvestment[];
}

export const useCompareInvestments = (userId?: string) => {
  // Get userId from localStorage if not provided
  const currentUser = useCurrentUser();
  const finalUserId = userId || currentUser?.userId;

  return useQuery({
    queryKey: ['compare-investments', finalUserId],
    queryFn: async () => {
      const response = await apiClient(`dashboard/${finalUserId}/compare`, {
        method: 'GET',
      }) as CompareInvestmentsResponse;
      
      if (!response.success) {
        throw new Error('Failed to fetch compare investments data');
      }
      
      return response.data;
    },
    enabled: !!finalUserId, // Only run query if userId is available
  });
};

interface GrowthTrend {
  month: number;
  year: number;
  monthName: string;
  value: number;
  gain: number;
  gainPercentage: number;
}

interface GrowthTrendSummary {
  startingValue: number;
  currentValue: number;
  totalGain: number;
  totalGainPercentage: number;
  averageMonthlyGrowth: number;
  months: number;
  highestValue: number;
  lowestValue: number;
}

interface GrowthTrendResponse {
  success: boolean;
  data: {
    trendData: GrowthTrend[];
    summary: GrowthTrendSummary;
    lastUpdated: string;
  };
}

// ─── Portfolio Growth Trend Hook ───────────────────────────────────────────────

export const usePortfolioGrowthTrend = (userId?: string) => {
  const currentUser = useCurrentUser();
  const finalUserId = userId || currentUser?.userId;

  return useQuery({
    queryKey: ['portfolio-growth-trend', finalUserId],
    queryFn: async () => {
      const response = await apiClient(
        `investments/${finalUserId}/portfolio/growth-trend`,
        {
          method: 'GET',
        }
      ) as GrowthTrendResponse;

      if (!response.success) {
        throw new Error('Failed to fetch portfolio growth trend');
      }

      return response.data;
    },
    enabled: !!finalUserId,
  });
};

// ─── Investment Transactions Hook ────────────────────────────────────────────
interface InvestmentTransaction {
  _id: string;
  type: 'buy' | 'sell' | 'dividend' | 'gain_update';
  amount: number;
  valueBefore: number;
  valueAfter: number;
  description: string;
  timestamp: string;
}

interface InvestmentTransactionsResponse {
  success: boolean;
  data: {
    investmentId: string;
    totalTransactions: number;
    transactions: InvestmentTransaction[];
  };
}

export const useInvestmentTransactions = (userId?: string) => {
  const currentUser = useCurrentUser();
  const finalUserId = userId || currentUser?.userId;

  return useQuery({
    queryKey: ['investment-transactions', finalUserId],
    queryFn: async () => {
      const response = (await apiClient(
        `investments/${finalUserId}/investment-transactions`,
        { method: 'GET' }
      )) as InvestmentTransactionsResponse;

      if (!response.success) {
        throw new Error('Failed to fetch investment transactions');
      }

      return response.data;
    },
    enabled: !!finalUserId,
  });
};

// ─── Savings Transactions Hook ────────────────────────────────────────────────
interface SavingsTransaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'interest';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

interface SavingsTransactionsResponse {
  success: boolean;
  data: {
    transactions: SavingsTransaction[];
    count: number;
  };
}

export const useSavingsTransactions = (userId?: string) => {
  const currentUser = useCurrentUser();
  const finalUserId = userId || currentUser?.userId;

  return useQuery({
    queryKey: ['savings-transactions', finalUserId],
    queryFn: async () => {
      const response = (await apiClient(`savings/${finalUserId}/transactions`, {
        method: 'GET',
      })) as SavingsTransactionsResponse;

      if (!response.success) {
        throw new Error('Failed to fetch savings transactions');
      }

      return response.data;
    },
    enabled: !!finalUserId,
  });
};

interface InitializeSavingsPaymentRequest {
  userId: string;
  savingsPlanId: string;
  amount: number;
  planName: string;
}

interface InitializeSavingsPaymentResponse {
  success: boolean;
  data: {
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
  };
}

export const useInitializeSavingsPayment = () => {
  return useMutation({
    mutationFn: async (payload: InitializeSavingsPaymentRequest) => {
      const response = (await apiClient(
        'savings-plans/payment/initialize',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )) as InitializeSavingsPaymentResponse;

      if (!response.success) {
        throw new Error('Failed to initialize savings payment');
      }

      return response.data;
    },
  });
};

// ─── Verify Bitcoin Payment Hook ──────────────────────────────────────────────
interface VerifyBitcoinPaymentRequest {
  paymentReference: string;
  bitcoinTransactionHash: string;
}

interface VerifyBitcoinPaymentResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    paymentReference: string;
    status: string;
    amount: number;
    currency: string;
    transactionHash: string;
    confirmations: number;
    verifiedAt: string;
  };
}

export const useVerifyBitcoinPayments = () => {
  return useMutation({
    mutationFn: async (payload: VerifyBitcoinPaymentRequest) => {
      const response = await apiClient(
        'savings-plans/payment/verify',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ) as VerifyBitcoinPaymentResponse;

      if (!response.success) {
        throw new Error('Failed to verify bitcoin payment');
      }

      return response.data;
    },
  });
};

// ─── Complete Bitcoin Savings Payment Hook ─────────────────────────────────────
interface CompleteBitcoinSavingsRequest {
  paymentReference: string;
}

interface CompleteBitcoinSavingsResponse {
  paymentReference: string;
}

export const useCompleteBitcoinSavings = () => {
  return useMutation({
    mutationFn: async (payload: CompleteBitcoinSavingsRequest) => {
      const response = await apiClient(
        'savings-plans/payment/confirm',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      ) as CompleteBitcoinSavingsResponse;

      return response;
    },
  });
};

// ─── Get Savings Balance Hook ──────────────────────────────────────────────────
interface SavingsBalanceResponse {
  success: boolean;
  data: {
    balance: number;
    apy: number;
    monthlyInterest: number;
    totalInterestEarned: number;
    insured: boolean;
  };
}

export const useSavingsBalance = (userId?: string) => {
  const currentUser = useCurrentUser();
  const finalUserId = userId || currentUser?.userId;

  return useQuery({
    queryKey: ['savings-balance', finalUserId],
    queryFn: async () => {
      const response = await apiClient(
        `savings/${finalUserId}/balance`,
        {
          method: 'GET',
        }
      ) as SavingsBalanceResponse;

      if (!response.success) {
        throw new Error('Failed to fetch savings balance');
      }

      return response.data;
    },
    enabled: !!finalUserId, // Only run query if userId is available
  });
};

// ─── Default Savings Plans Hook ────────────────────────────────────────────────
interface DefaultSavingsPlan {
  planName: string;
  category: string;
  description: string;
}

interface DefaultSavingsPlansResponse {
  success: boolean;
  data: DefaultSavingsPlan[];
}

export const useDefaultSavingsPlans = () => {
  return useQuery({
    queryKey: ['default-savings-plans'],
    queryFn: async () => {
      const response = await apiClient('savings-plans/defaults', {
        method: 'GET',
      }) as DefaultSavingsPlansResponse;

      if (!response.success) {
        throw new Error('Failed to fetch default savings plans');
      }

      return response.data;
    },
  });
};

// ─── Create Savings Plan Hook ──────────────────────────────────────────────────
interface CreateSavingsPlanRequest {
  userId: string;
  planName: string;
  description: string;
}

interface SavingsPlanData {
  description: string;
  earnsInterest: boolean;
  apy: number;
  nextDepositDue: string;
  userId: string;
  planName: string;
  category: string | null;
  targetAmount: number;
  currentAmount: number;
  earnInterest: boolean;
  interestRate: number;
  duration: string | null;
  frequency: string | null;
  startDate: string;
  endDate: string | null;
  nextDepositDueDate: string | null;
  status: string;
  totalInterestEarned: number;
  progressPercentage: number;
  expectedInterest: number;
  isDefault: boolean;
  transactions: unknown[];
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CreateSavingsPlanResponse {
  success: boolean;
  message: string;
  data: SavingsPlanData;
}

export const useCreateSavingsPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSavingsPlanRequest) => {
      const response = await apiClient('savings-plans/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      }) as CreateSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to create savings plan');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate savings-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions'] });
    },
  });
};

// ─── Update Savings Plan Interest Hook ─────────────────────────────────────────
interface UpdateInterestRequest {
  earnsInterest: boolean;
  apy: number;
}

interface UpdateSavingsPlanResponse {
  success: boolean;
  message: string;
  data: SavingsPlanData;
}

export const useUpdateSavingsPlanInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      payload,
    }: {
      planId: string;
      payload: UpdateInterestRequest;
    }) => {
      const response = await apiClient(`savings-plans/plan/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }) as UpdateSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to update savings plan interest');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate savings-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions'] });
    },
  });
};

// ─── Update Savings Plan Category Hook ─────────────────────────────────────────
interface UpdateCategoryRequest {
  category: string;
}

export const useUpdateSavingsPlanCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      payload,
    }: {
      planId: string;
      payload: UpdateCategoryRequest;
    }) => {
      const response = await apiClient(`savings-plans/plan/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }) as UpdateSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to update savings plan category');
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate savings-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions'] });
    },
  });
};

// ─── Update Savings Plan Target Amount Hook ────────────────────────────────────
interface UpdateTargetAmountRequest {
  targetAmount: number;
}

export const useUpdateSavingsPlanTargetAmount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      payload,
    }: {
      planId: string;
      payload: UpdateTargetAmountRequest;
    }) => {
      const response = await apiClient(`savings-plans/plan/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }) as UpdateSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to update target amount');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions'] });
    },
  });
};

// ─── Update Savings Plan Duration Hook ─────────────────────────────────────────
interface UpdateDurationRequest {
  duration: number;
}

export const useUpdateSavingsPlanDuration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      payload,
    }: {
      planId: string;
      payload: UpdateDurationRequest;
    }) => {
      const response = await apiClient(`savings-plans/plan/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }) as UpdateSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to update duration');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions'] });
    },
  });
};

// ─── Update Savings Plan Frequency Hook ────────────────────────────────────────
interface UpdateFrequencyRequest {
  saveFrequency: string;
}

export const useUpdateSavingsPlanFrequency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      payload,
    }: {
      planId: string;
      payload: UpdateFrequencyRequest;
    }) => {
      const response = await apiClient(`savings-plans/plan/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }) as UpdateSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to update save frequency');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions'] });
    },
  });
};

// ─── Get Savings Plan Summary Hook ─────────────────────────────────────────────
interface SavingsPlanSummary {
  planId: string;
  savingName: string;
  savingTowards: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  interestEarned: number;
  expectedInterest: number;
  duration: string;
  frequency: string;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  nextDepositDue: string;
  status: string;
}

interface GetSavingsPlanSummaryResponse {
  success: boolean;
  data: SavingsPlanSummary;
}

export const useGetSavingsPlanSummary = (planId: string) => {
  return useQuery({
    queryKey: ['savings-plan-summary', planId],
    queryFn: async () => {
      const response = await apiClient(`savings-plans/plan/${planId}/summary`, {
        method: 'GET',
      }) as GetSavingsPlanSummaryResponse;

      if (!response.success) {
        throw new Error('Failed to fetch savings plan summary');
      }

      return response.data;
    },
    enabled: !!planId,
  });
};

// ─── Get All User Savings Plans Hook ───────────────────────────────────────────
interface GetUserSavingsPlansResponse {
  success: boolean;
  data: SavingsPlanData[];
}

export const useGetUserSavingsPlans = (userId: string) => {
  return useQuery({
    queryKey: ['user-savings-plans', userId],
    queryFn: async () => {
      const response = await apiClient(`savings-plans/user/${userId}`, {
        method: 'GET',
      }) as GetUserSavingsPlansResponse;

      if (!response.success) {
        throw new Error('Failed to fetch user savings plans');
      }

      return response.data;
    },
    enabled: !!userId,
  });
};

// ─── Get Savings Plan by ID Hook ──────────────────────────────────────────────
interface GetSavingsPlanByIdResponse {
  success: boolean;
  data: SavingsPlanData;
}

export const useGetSavingsPlanById = (planId: string) => {
  return useQuery({
    queryKey: ['savings-plan', planId],
    queryFn: async () => {
      const response = await apiClient(`savings-plans/plan/${planId}`, {
        method: 'GET',
      }) as GetSavingsPlanByIdResponse;

      if (!response.success) {
        throw new Error('Failed to fetch savings plan');
      }

      return response.data;
    },
    enabled: !!planId,
  });
};

// ─── Get Plan Transactions Hook ────────────────────────────────────────────────
interface Transaction {
  _id: string;
  savingsPlanId: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  paymentId: string;
  paymentReference: string;
  bitcoinTransactionHash: string;
  status: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GetPlanTransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    count: number;
  };
}

export const useGetPlanTransactions = (planId: string) => {
  return useQuery({
    queryKey: ['plan-transactions', planId],
    queryFn: async () => {
      const response = await apiClient(`savings-plans/plan/${planId}/transactions`, {
        method: 'GET',
      }) as GetPlanTransactionsResponse;

      if (!response.success) {
        throw new Error('Failed to fetch plan transactions');
      }

      return response.data;
    },
    enabled: !!planId,
  });
};

// ─── Pause Savings Plan Hook ───────────────────────────────────────────────────
interface PauseSavingsPlanResponse {
  success: boolean;
  message: string;
  data: SavingsPlanData;
}

export const usePauseSavingsPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiClient(`savings-plans/plan/${planId}/pause`, {
        method: 'POST',
      }) as PauseSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to pause savings plan');
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['savings-plan', data._id] });
      queryClient.invalidateQueries({ queryKey: ['user-savings-plans'] });
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
    },
  });
};

// ─── Resume Savings Plan Hook ──────────────────────────────────────────────────
interface ResumeSavingsPlanResponse {
  success: boolean;
  message: string;
  data: SavingsPlanData;
}

export const useResumeSavingsPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiClient(`savings-plans/plan/${planId}/resume`, {
        method: 'POST',
      }) as ResumeSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to resume savings plan');
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['savings-plan', data._id] });
      queryClient.invalidateQueries({ queryKey: ['user-savings-plans'] });
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
    },
  });
};

// ─── Cancel Savings Plan Hook ──────────────────────────────────────────────────
interface CancelSavingsPlanResponse {
  success: boolean;
  message: string;
  data: SavingsPlanData;
}

export const useCancelSavingsPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiClient(`savings-plans/plan/${planId}/cancel`, {
        method: 'POST',
      }) as CancelSavingsPlanResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel savings plan');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-savings-plans'] });
      queryClient.invalidateQueries({ queryKey: ['savings-balance'] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions'] });
    },
  });
};

// ─── Create Support Ticket Hook ───────────────────────────────────────────────
interface CreateTicketData {
  topic: string;
  subject: string;
  message: string;
}

interface SupportTicket {
  userId: string;
  userEmail: string;
  userName: string;
  topic: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CreateTicketResponse {
  success: boolean;
  message: string;
  data: SupportTicket;
}

export const useCreateSupportTicket = () => {
  return useMutation({
    mutationFn: async (ticketData: CreateTicketData) => {
      const response = (await apiClient('support/create-ticket', {
        method: 'POST',
        body: JSON.stringify(ticketData),
      })) as CreateTicketResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to create support ticket');
      }

      return response.data;
    },
  });
};

// ─── Auto-refresh utility ─────────────────────────────────────────────────────
// Call this once at app startup (e.g. in App.tsx or a top-level component).
// It silently refreshes the access token every 14 minutes so sessions stay alive.
//
// Usage:
//   import { startTokenRefreshInterval } from '../hooks/useAuth';
//   useEffect(() => {
//     const stop = startTokenRefreshInterval();
//     return stop;
//   }, []);
//
export function startTokenRefreshInterval(intervalMs = 14 * 60 * 1000): () => void {
  const id = setInterval(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    try {
      const response = await apiClient('auth/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }) as RefreshTokenResponse;

      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    } catch {
      // Token is invalid — clear session and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, intervalMs);

  return () => clearInterval(id);
}

// ─── Admin User Balances Hook ───────────────────────────────────────────────────
export interface AdminUserBalance {
  userId: string;
  [key: string]: unknown;
}

interface AdminUsersBalancesResponse {
  success: boolean;
  message?: string;
  data: AdminUserBalance[];
}

export interface UpdateSavingsBalanceRequest {
  action: 'add' | 'subtract';
  amount: number;
  reason: string;
}

export interface UpdateSavingsBalanceData {
  userId: string;
  planId: string;
  planName: string;
  amountChanged: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  progressPercentage: number;
  reason: string;
}

interface UpdateSavingsBalanceResponse {
  success: boolean;
  message: string;
  data: UpdateSavingsBalanceData;
}

// Small helper so every admin log line is easy to spot and grep for in the
// console, and so we log the same shape whether the failure came from
// apiClient throwing (network error / non-2xx / route not found) or from
// a 200 response with `success: false`.
function logApiError() {
  // const status = (err as any)?.status ?? (err as any)?.response?.status;
  // const body = (err as any)?.body ?? (err as any)?.response?.data;
  // console.error(`[${label}] request failed`, {
  //   method,
  //   endpoint,
  //   status,
  //   message: err instanceof Error ? err.message : err,
  //   body,
  //   raw: err,
  // });
}

export const useAdminUsersBalances = () => {
  return useQuery({
    queryKey: ['admin-users-balances'],
    queryFn: async () => {
      const endpoint = 'admin/users-balances';
      // console.log('[AdminUsersBalances] GET', endpoint);

      let response: AdminUsersBalancesResponse;
      try {
        response = (await apiClient(endpoint, {
          method: 'GET',
        })) as AdminUsersBalancesResponse;
      } catch (err) {
        // This is where a "route not found" / 404 typically surfaces —
        // apiClient throws before we ever get a `.success` field to check.
        logApiError();
        throw err;
      }

      // console.log('[AdminUsersBalances] response', response);

      if (!response.success) {
        // console.error('[AdminUsersBalances] API returned success: false', response);
        throw new Error(response.message || 'Failed to fetch user balances');
      }

      return response.data;
    },
  });
};

export const useUpdateSavingsBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      ...payload
    }: UpdateSavingsBalanceRequest & { userId: string }) => {
      const endpoint = `admin/user/${userId}/update-savings-balance`;
      // console.log('[UpdateSavingsBalance] PUT', endpoint, payload);

      let response: UpdateSavingsBalanceResponse;
      try {
        response = (await apiClient(endpoint, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })) as UpdateSavingsBalanceResponse;
      } catch (err) {
        logApiError();
        throw err;
      }

      // console.log('[UpdateSavingsBalance] response', response);

      if (!response.success) {
        // console.error('[UpdateSavingsBalance] API returned success: false', response);
        throw new Error(response.message || 'Failed to update savings balance');
      }

      return response.data;
    },
    onSuccess: (data) => {
      // console.log('[UpdateSavingsBalance] success, invalidating queries for', data.userId);
      queryClient.invalidateQueries({ queryKey: ['admin-users-balances'] });
      queryClient.invalidateQueries({ queryKey: ['savings-balance', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview', data.userId] });
      queryClient.invalidateQueries({ queryKey: ['savings-transactions', data.userId] });
    },
    // onError: (err) => {
    //   console.error('[UpdateSavingsBalance] mutation error', err);
    // },
  });
};


// ─── My Wallet Hook (User) ─────────────────────────────────────────────────────
export interface MyWallet {
  walletId: string;
  accountNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: 'active' | 'frozen';
}

interface MyWalletResponse {
  success: boolean;
  message?: string;
  data: MyWallet;
}

export const useMyWallet = () => {
  return useQuery({
    queryKey: ['my-wallet'],
    queryFn: async () => {
      const response = (await apiClient('wallet/me', { method: 'GET' })) as MyWalletResponse;
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch wallet');
      }
      return response.data;
    },
  });
};

// ─── Request Withdrawal Hook (User) ────────────────────────────────────────────
export interface RequestWithdrawalPayload {
  amount: number;
  bitcoinAddress: string;
}

export interface WithdrawalRequestData {
  _id: string;
  userId: string;
  walletId: string;
  amount: number;
  bitcoinAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface RequestWithdrawalResponse {
  success: boolean;
  message: string;
  data: WithdrawalRequestData;
}

export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RequestWithdrawalPayload) => {
      const response = (await apiClient('wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(payload),
      })) as RequestWithdrawalResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit withdrawal request');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-wallet'] });
      queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
    },
  });
};

// ─── My Withdrawal History Hook (User) ─────────────────────────────────────────
interface MyWithdrawalsResponse {
  success: boolean;
  message?: string;
  data: WithdrawalRequestData[];
}

export const useMyWithdrawals = () => {
  return useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: async () => {
      const response = (await apiClient('wallet/withdrawals', { method: 'GET' })) as MyWithdrawalsResponse;
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch withdrawal history');
      }
      return response.data;
    },
  });
};

// ─── Send Custom Email Hook (Admin) ────────────────────────────────────────────
export interface SendCustomEmailPayload {
  userId: string;
  subject: string;
  message: string;
}

interface SendCustomEmailResponse {
  success: boolean;
  message: string;
  data: { userId: string; email: string; subject: string; ticketId: string };
}

export const useSendCustomEmail = () => {
  return useMutation({
    mutationFn: async ({ userId, ...payload }: SendCustomEmailPayload) => {
      const response = (await apiClient(`admin/user/${userId}/send-email`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })) as SendCustomEmailResponse;

      if (!response.success) {
        throw new Error(response.message || 'Failed to send email');
      }
      return response.data;
    },
  });
};