// Common type definitions for the application

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  timezone: number;
  exp: number;
  data?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data?: T;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  admin?: boolean;
  superadmin?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

export interface SignUpData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface PaymentData {
  amount: string;
  currency: string;
  method: 'crypto' | 'fiat';
  destination: string;
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  fiat: string;
  status: 'completed' | 'pending' | 'failed';
  time: string;
  sender: string;
  recipient: string;
  transactionHash: string;
  network: string;
  fee: string;
}

export interface PaymentRequest {
  receiveAmount: string;
  receiveCurrency: string;
  receiveMethod: 'crypto' | 'fiat';
  walletAddress?: string;
  bankCardNumber?: string;
}

export interface PaymentResponse {
  receiveLink: string;
  receiveQRCode: string;
  transactionId: string;
}

export interface ExchangeRates {
  [localCurrency: string]: {
    [cryptoCurrency: string]: number;
  };
}

export interface UserState {
  userDetails: User | null;
  isAuthenticated: boolean;
}

export interface SingleUserDetailsState {
  userDetails: User | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: UserState;
  singleUserDetails: SingleUserDetailsState;
}

export interface ServiceAccess {
  serviceId: string;
  paymentData: PaymentData;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type Currency = 'USDT' | 'BTC' | 'ETH' | 'USD' | 'EUR' | 'GBP' | 'UZS' | 'KZT';

export type PaymentStatus = 'idle' | 'processing' | 'completed' | 'failed' | 'waiting' | 'expired';

export type Theme = 'light' | 'dark' | 'system';

export type Language = 'en' | 'ru' | 'tr';

// ChangeNOW API Types
export interface ChangeNowFiatCurrency {
  ticker: string;
  name: string;
  image: string;
  hasExternalId: boolean;
  isStable: boolean;
  supportsFixedRate: boolean;
}

export interface ChangeNowCryptoCurrency {
  ticker: string;
  name: string;
  image: string;
  hasExternalId: boolean;
  isFiat: boolean;
  featured: boolean;
  isStable: boolean;
  supportsFixedRate: boolean;
  network: string;
  tokenContract?: string;
  buy: boolean;
  sell: boolean;
}

export interface ChangeNowEstimate {
  fromCurrency: string;
  fromNetwork: string;
  toCurrency: string;
  toNetwork: string;
  fromAmount: number;
  toAmount: number;
  type: string;
  validUntil: string;
  transactionSpeedForecast: string;
  warningMessage?: string;
}

export interface ChangeNowMarketInfo {
  fromCurrency: string;
  fromNetwork: string;
  toCurrency: string;
  toNetwork: string;
  depositType: string;
  payoutType: string;
  fromAmount: number;
  toAmount: number;
  min: number;
  max: number;
}

export interface ChangeNowFiatTransaction {
  id: string;
  depositType: string;
  payoutType: string;
  fromCurrency: string;
  toCurrency: string;
  fromNetwork?: string;
  toNetwork: string;
  fromAmount: number;
  toAmount: number;
  payoutAddress: string;
  payoutExtraId?: string;
  status: string;
  payinAddress?: string;
  payinExtraId?: string;
  fromLegacyTicker?: string;
  toLegacyTicker?: string;
  updatedAt: string;
  depositReceivedAt?: string;
  purchaseId?: string;
  userId?: string;
  payoutHashLink?: string;
  payinHashLink?: string;
  depositReceivedAmount?: number;
  purchaseAmount?: number;
  amountSentToUser?: number;
  refundAddress?: string;
  refundExtraId?: string;
  externalPartnerLinkId?: string;
  userId2?: string;
  depositFee?: number;
  withdrawalFee?: number;
  networkFee?: number;
  serviceFee?: number;
  payoutCurrency?: string;
  isPartner?: boolean;
}

export interface ChangeNowExchangeTransaction {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromNetwork: string;
  toNetwork: string;
  fromAmount: number;
  toAmount: number;
  address: string;
  extraId?: string;
  refundAddress?: string;
  refundExtraId?: string;
  payinAddress?: string;
  payoutAddress?: string;
  payinExtraId?: string;
  payoutExtraId?: string;
  status: string;
  updatedAt: string;
  depositReceivedAt?: string;
  payinHash?: string;
  payoutHash?: string;
  amountSent?: number;
  amountReceived?: number;
  networkFee?: number;
  serviceFee?: number;
  flow: string;
  type: string;
  validUntil?: string;
}

export interface ChangeNowValidateAddress {
  result: boolean;
  message?: string;
}

export interface ChangeNowNetworkFee {
  networkFee: number;
  serviceFee: number;
  totalFee: number;
  fromCurrency: string;
  toCurrency: string;
  fromNetwork: string;
  toNetwork: string;
  fromAmount: number;
}

export interface ChangeNowCreateFiatTransactionRequest {
  from_amount: number;
  from_currency: string;
  to_currency: string;
  from_network?: string;
  to_network: string;
  payout_address: string;
  payout_extra_id?: string;
  deposit_type: string;
  payout_type: string;
  external_partner_link_id?: string;
  customer: {
    contact_info: {
      email: string;
      phone_number?: string;
    };
  };
}

export interface ChangeNowCreateExchangeRequest {
  fromCurrency: string;
  toCurrency: string;
  fromNetwork: string;
  toNetwork: string;
  fromAmount: string;
  toAmount?: string;
  address: string;
  extraId?: string;
  refundAddress?: string;
  refundExtraId?: string;
  userId?: string;
  payload?: string;
  contactEmail?: string;
  source?: string;
  flow: 'standard' | 'fixed-rate';
  type: 'direct' | 'reverse';
  rateId?: string;
}

// Commission Configuration
export interface CommissionConfig {
  globalRate: number; // Default commission rate (e.g., 5%)
  currencyRates?: {
    [currency: string]: number; // Currency-specific rates
  };
}

// Payment Flow Types
export interface PaymentFlowData {
  fiatAmount: number;
  fiatCurrency: string;
  cryptoCurrency: string;
  cryptoNetwork: string;
  paymentMethod: string;
  commission: number;
  estimatedCryptoAmount: number;
  exchangeRate: number;
  userWalletAddress?: string;
  networkFee?: number;
  serviceFee?: number;
  totalFee?: number;
  originalAmount?: number;
  netAmount?: number;
  commissionRate?: number;
}

export interface PaymentStep {
  step: 'amount_selection' | 'fiat_payment' | 'payment_confirmation' | 'wallet_input' | 'crypto_conversion' | 'completed';
  data: PaymentFlowData;
  transactionId?: string;
  qrCodeData?: string;
  paymentLink?: string;
  status: PaymentStatus;
}