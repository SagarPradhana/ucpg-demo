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