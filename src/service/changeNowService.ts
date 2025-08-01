import httpClient, { HttpMethods } from './HttpClients';
import {
  ChangeNowFiatCurrency,
  ChangeNowCryptoCurrency,
  ChangeNowEstimate,
  ChangeNowMarketInfo,
  ChangeNowFiatTransaction,
  ChangeNowExchangeTransaction,
  ChangeNowValidateAddress,
  ChangeNowNetworkFee,
  ChangeNowCreateFiatTransactionRequest,
  ChangeNowCreateExchangeRequest,
  CommissionConfig
} from '../types';

const CHANGENOW_API_URL = import.meta.env.VITE_CHANGENOW_API_URL;
const CHANGENOW_API_KEY = import.meta.env.VITE_CHANGENOW_API_KEY;

// Commission configuration (can be fetched from backend later)
const COMMISSION_CONFIG: CommissionConfig = {
  globalRate: 5, // 5% default
  currencyRates: {
    USD: 4,
    EUR: 5,
    UZS: 2,
    BTC: 1,
    USDT: 3,
  }
};

export class ChangeNowService {
  private static instance: ChangeNowService;
  private apiKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = CHANGENOW_API_KEY;
    this.baseUrl = CHANGENOW_API_URL;
  }

  public static getInstance(): ChangeNowService {
    if (!ChangeNowService.instance) {
      ChangeNowService.instance = new ChangeNowService();
    }
    return ChangeNowService.instance;
  }

  private getHeaders(): Record<string, string> {
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    };
    
    // Log API key for debugging (first 10 chars only)
    if (this.apiKey) {
      console.log('Using ChangeNOW API key (first 10 chars):', this.apiKey.substring(0, 10) + '...');
    } else {
      console.error('❌ ChangeNOW API key is missing!');
    }
    
    return headers;
  }

  // Get commission rate for a specific currency
  public getCommissionRate(currency: string): number {
    return COMMISSION_CONFIG.currencyRates?.[currency] || COMMISSION_CONFIG.globalRate;
  }

  // Calculate commission amount
  public calculateCommission(amount: number, currency: string): number {
    const rate = this.getCommissionRate(currency);
    return (amount * rate) / 100;
  }

  // Calculate amount after commission deduction
  public calculateAmountAfterCommission(amount: number, currency: string): number {
    const commission = this.calculateCommission(amount, currency);
    return amount - commission;
  }

  // 1. GET Fiat currencies
  public async getFiatCurrencies(): Promise<ChangeNowFiatCurrency[]> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/fiat-currencies/fiat`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: this.getHeaders(),
        }
      );
      return response as ChangeNowFiatCurrency[];
    } catch (error) {
      console.error('Error fetching fiat currencies:', error);
      throw error;
    }
  }

  // 2. GET Crypto currencies
  public async getCryptoCurrencies(): Promise<ChangeNowCryptoCurrency[]> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/fiat-currencies/crypto`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: this.getHeaders(),
        }
      );
      return response as ChangeNowCryptoCurrency[];
    } catch (error) {
      console.error('Error fetching crypto currencies:', error);
      throw error;
    }
  }

  // 3. POST Create exchange transaction with fiat
  public async createFiatTransaction(
    data: ChangeNowCreateFiatTransactionRequest
  ): Promise<ChangeNowFiatTransaction> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/fiat-transaction`,
        {
          method: HttpMethods.POST,
          data,
          withAuth: false,
          headers: this.getHeaders(),
        }
      );
      return response as ChangeNowFiatTransaction;
    } catch (error) {
      console.error('Error creating fiat transaction:', error);
      throw error;
    }
  }

  // 4. GET Transaction status (fiat)
  public async getFiatTransactionStatus(id: string): Promise<ChangeNowFiatTransaction> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/fiat-status`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: this.getHeaders(),
          queryParams: { id },
        }
      );
      return response as ChangeNowFiatTransaction;
    } catch (error) {
      console.error('Error fetching fiat transaction status:', error);
      throw error;
    }
  }

  // 5. GET Market info
  // Format: {from_currency}_{to_currency}-{to_network} for fiat to crypto
  // Example: eur_usdt-eth (EUR to USDT on ETH network)
  public async getMarketInfo(
    fromCurrency: string,
    toCurrency: string,
    fromNetwork?: string,
    toNetwork?: string
  ): Promise<ChangeNowMarketInfo> {
    try {
      // For fiat to crypto: {fiat_currency}_{crypto_currency}-{crypto_network}
      // For crypto to crypto: {from_currency}_{from_network}-{to_currency}_{to_network}
      let pair: string;
      
      if (!fromNetwork && toNetwork) {
        // Fiat to crypto: EUR_USDT-ETH
        pair = `${fromCurrency.toLowerCase()}_${toCurrency.toLowerCase()}-${toNetwork.toLowerCase()}`;
      } else if (fromNetwork && toNetwork) {
        // Crypto to crypto: ETH_ETH-USDT_ETH
        pair = `${fromCurrency.toLowerCase()}_${fromNetwork.toLowerCase()}-${toCurrency.toLowerCase()}_${toNetwork.toLowerCase()}`;
      } else {
        // Fallback format
        pair = `${fromCurrency.toLowerCase()}-${toCurrency.toLowerCase()}`;
      }
      
      const response = await httpClient(
        `${this.baseUrl}/fiat-market-info/min-max-range/${pair}`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: this.getHeaders(),
        }
      );
      return response as ChangeNowMarketInfo;
    } catch (error) {
      console.error('Error fetching market info:', error);
      throw error;
    }
  }

  // 6. GET Estimate
  public async getFiatEstimate(params: {
    from_currency: string;
    from_network?: string;
    from_amount: number;
    to_currency: string;
    to_network?: string;
    deposit_type?: string;
    payout_type?: string;
  }): Promise<ChangeNowEstimate> {
    try {
      // Validate required parameters
      if (!params.from_currency || !params.to_currency || !params.from_amount) {
        throw new Error('Missing required parameters for fiat estimate');
      }

      // For cryptocurrencies, to_network is usually required
      const cryptoRequiringNetworks = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];
      if (cryptoRequiringNetworks.includes(params.to_currency.toUpperCase()) && !params.to_network) {
        console.warn(`Warning: ${params.to_currency} usually requires to_network parameter`);
      }

      // Clean up parameters - remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      console.log('Fiat estimate request params:', cleanParams);

      const response = await httpClient(
        `${this.baseUrl}/fiat-estimate`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: this.getHeaders(),
          queryParams: cleanParams as Record<string, string | number>,
        }
      );
      
      console.log('Fiat estimate response:', response);
      return response as ChangeNowEstimate;
    } catch (error) {
      console.error('Error fetching fiat estimate:', error);
      console.error('Request params were:', params);
      throw error;
    }
  }

  // 7. GET Exchange range
  public async getExchangeRange(params: {
    fromCurrency: string;
    toCurrency: string;
    fromNetwork?: string;
    toNetwork?: string;
    flow?: string;
  }): Promise<{ minAmount: number; maxAmount: number }> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/exchange/range`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: { 'x-changenow-api-key': this.apiKey },
          queryParams: { ...params, flow: params.flow || 'standard' },
        }
      );
      return response as { minAmount: number; maxAmount: number };
    } catch (error) {
      console.error('Error fetching exchange range:', error);
      throw error;
    }
  }

  // 8. GET Network fee
  public async getNetworkFee(params: {
    fromCurrency: string;
    toCurrency: string;
    fromNetwork: string;
    toNetwork: string;
    fromAmount: number;
    convertedCurrency?: string;
    convertedNetwork?: string;
  }): Promise<ChangeNowNetworkFee> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/exchange/network-fee`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: { 'x-changenow-api-key': this.apiKey },
          queryParams: params as Record<string, string | number>,
        }
      );
      return response as ChangeNowNetworkFee;
    } catch (error) {
      console.error('Error fetching network fee:', error);
      throw error;
    }
  }

  // 9. GET Market estimate
  public async getMarketEstimate(params: {
    fromCurrency: string;
    toCurrency: string;
    fromAmount?: number;
    toAmount?: number;
    type: 'direct' | 'reverse';
  }): Promise<ChangeNowEstimate> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/markets/estimate`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: { 'x-changenow-api-key': this.apiKey },
          queryParams: params as Record<string, string | number>,
        }
      );
      return response as ChangeNowEstimate;
    } catch (error) {
      console.error('Error fetching market estimate:', error);
      throw error;
    }
  }

  // 10. POST Create exchange transaction (crypto-to-crypto)
  public async createExchangeTransaction(
    data: ChangeNowCreateExchangeRequest
  ): Promise<ChangeNowExchangeTransaction> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/exchange`,
        {
          method: HttpMethods.POST,
          data,
          withAuth: false,
          headers: { 'x-changenow-api-key': this.apiKey },
        }
      );
      return response as ChangeNowExchangeTransaction;
    } catch (error) {
      console.error('Error creating exchange transaction:', error);
      throw error;
    }
  }

  // 11. GET Address validation
  public async validateAddress(currency: string, address: string): Promise<ChangeNowValidateAddress> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/validate/address`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          queryParams: { currency, address },
        }
      );
      return response as ChangeNowValidateAddress;
    } catch (error) {
      console.error('Error validating address:', error);
      throw error;
    }
  }

  // 12. GET Exchange transaction status
  public async getExchangeTransactionStatus(id: string): Promise<ChangeNowExchangeTransaction> {
    try {
      const response = await httpClient(
        `${this.baseUrl}/exchange/by-id`,
        {
          method: HttpMethods.GET,
          withAuth: false,
          headers: { 'x-changenow-api-key': this.apiKey },
          queryParams: { id },
        }
      );
      return response as ChangeNowExchangeTransaction;
    } catch (error) {
      console.error('Error fetching exchange transaction status:', error);
      throw error;
    }
  }

  // Utility methods for the payment flow
  public async getOptimalExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    fromNetwork?: string,
    toNetwork?: string
  ): Promise<{
    rate: number;
    estimatedAmount: number;
    networkFee: number;
    serviceFee: number;
    totalFee: number;
  }> {
    try {
      // Get market estimate
      const estimate = await this.getMarketEstimate({
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        type: 'direct',
      });

      // Get network fee if networks are specified
      let networkFeeData = { networkFee: 0, serviceFee: 0, totalFee: 0 };
      if (fromNetwork && toNetwork) {
        try {
          networkFeeData = await this.getNetworkFee({
            fromCurrency,
            toCurrency,
            fromNetwork,
            toNetwork,
            fromAmount: amount,
          });
        } catch (feeError) {
          console.warn('Could not fetch network fee:', feeError);
        }
      }

      return {
        rate: estimate.toAmount / estimate.fromAmount,
        estimatedAmount: estimate.toAmount,
        networkFee: networkFeeData.networkFee,
        serviceFee: networkFeeData.serviceFee,
        totalFee: networkFeeData.totalFee,
      };
    } catch (error) {
      console.error('Error getting optimal exchange rate:', error);
      throw error;
    }
  }

  // Generate QR code data for payment
  public generateQRCodeData(transactionId: string, amount: number, currency: string): string {
    const qrData = {
      transactionId,
      amount,
      currency,
      timestamp: Date.now(),
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      type: 'payment_request',
    };
    return JSON.stringify(qrData);
  }

  // Generate payment link
  public generatePaymentLink(transactionId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment/${transactionId}`;
  }

  // Test API connectivity
  public async testApiConnectivity(): Promise<boolean> {
    try {
      // Test by fetching fiat currencies - this is a simple GET request
      const currencies = await this.getFiatCurrencies();
      console.log('ChangeNOW API connectivity test passed:', currencies.length, 'fiat currencies available');
      return currencies && currencies.length > 0;
    } catch (error) {
      console.error('ChangeNOW API connectivity test failed:', error);
      return false;
    }
  }

  // Test fiat estimate with sample data (matches your curl request format)
  public async testFiatEstimate(params?: {
    from_currency?: string;
    from_amount?: number;
    to_currency?: string;
    to_network?: string;
    deposit_type?: string;
    payout_type?: string;
  }): Promise<any> {
    try {
      const testParams = {
        from_currency: params?.from_currency || 'INR',
        from_amount: params?.from_amount || 1900,
        to_currency: params?.to_currency || 'USDT',
        to_network: params?.to_network || 'ETH',
        deposit_type: params?.deposit_type || 'SEPA_1',
        payout_type: params?.payout_type || 'SEPA_1'
      };

      console.log('Testing fiat estimate with params:', testParams);
      
      const estimate = await this.getFiatEstimate(testParams);
      console.log('Test fiat estimate successful:', estimate);
      return estimate;
    } catch (error) {
      console.error('Test fiat estimate failed:', error);
      throw error;
    }
  }

  // Enhanced commission management methods
  public calculateFinalAmounts(
    originalAmount: number,
    currency: string
  ): {
    originalAmount: number;
    commission: number;
    netAmount: number;
    commissionRate: number;
  } {
    const commissionRate = this.getCommissionRate(currency);
    const commission = this.calculateCommission(originalAmount, currency);
    const netAmount = originalAmount - commission;

    return {
      originalAmount,
      commission,
      netAmount,
      commissionRate,
    };
  }

  // Basic transaction monitoring
  public async monitorTransaction(transactionId: string, type: 'fiat' | 'exchange' = 'fiat'): Promise<any> {
    if (type === 'fiat') {
      return await this.getFiatTransactionStatus(transactionId);
    } else {
      return await this.getExchangeTransactionStatus(transactionId);
    }
  }

  // Transaction monitoring with polling
  public async monitorTransactionWithPolling(
    transactionId: string,
    type: 'fiat' | 'exchange' = 'fiat',
    onStatusChange?: (status: string, data: any) => void,
    maxAttempts: number = 60,
    interval: number = 5000
  ): Promise<any> {
    let attempts = 0;
    
    const poll = async (): Promise<any> => {
      try {
        attempts++;
        const status = await this.monitorTransaction(transactionId, type);
        
        if (onStatusChange) {
          onStatusChange(status.status || status.state, status);
        }

        // Check if transaction is in final state
        const finalStates = ['finished', 'failed', 'expired', 'completed', 'refunded'];
        if (finalStates.includes(status.status || status.state)) {
          return status;
        }

        // Continue polling if not in final state and within attempts limit
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
          return poll();
        } else {
          throw new Error('Transaction monitoring timeout');
        }
      } catch (error) {
        console.error('Error monitoring transaction:', error);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
          return poll();
        }
        throw error;
      }
    };

    return poll();
  }

  // Get supported payment methods for fiat
  public getSupportedPaymentMethods(): Array<{
    value: string;
    label: string;
    icon: string;
    description: string;
  }> {
    return [
      {
        value: 'SEPA_1',
        label: 'SEPA Transfer',
        icon: '🏦',
        description: 'European bank transfer',
      },
      {
        value: 'card',
        label: 'Credit/Debit Card',
        icon: '💳',
        description: 'Visa, Mastercard payments',
      },
      {
        value: 'bank_wire',
        label: 'Bank Wire',
        icon: '🏛️',
        description: 'International wire transfer',
      },
    ];
  }

  // Validate transaction data before creation
  public validateTransactionData(data: {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    walletAddress?: string;
    paymentMethod: string;
  }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!data.fromCurrency) {
      errors.push('From currency is required');
    }

    if (!data.toCurrency) {
      errors.push('To currency is required');
    }

    if (data.walletAddress && data.walletAddress.length < 10) {
      errors.push('Wallet address appears to be invalid');
    }

    if (!data.paymentMethod) {
      errors.push('Payment method is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get transaction history (placeholder - would integrate with backend)
  public async getTransactionHistory(userId?: string): Promise<any[]> {
    // This would typically fetch from your backend database
    // For now, return mock data or localStorage data
    const mockHistory = [
      {
        id: 'tx_001',
        type: 'fiat_to_crypto',
        fromAmount: 100,
        fromCurrency: 'USD',
        toAmount: 0.025,
        toCurrency: 'BTC',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        commission: 5,
      },
      {
        id: 'tx_002',
        type: 'fiat_to_crypto',
        fromAmount: 500,
        fromCurrency: 'EUR',
        toAmount: 485.2,
        toCurrency: 'USDT',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        commission: 25,
      },
    ];

    return mockHistory;
  }

  // Enhanced error handling
  public handleApiError(error: any): {
    message: string;
    code?: string;
    isRetryable: boolean;
  } {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return {
            message: data?.message || 'Invalid request parameters',
            code: 'INVALID_REQUEST',
            isRetryable: false,
          };
        case 401:
          return {
            message: 'Invalid API key or authentication failed',
            code: 'AUTH_FAILED',
            isRetryable: false,
          };
        case 429:
          return {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT',
            isRetryable: true,
          };
        case 500:
        case 502:
        case 503:
          return {
            message: 'Service temporarily unavailable. Please try again.',
            code: 'SERVICE_ERROR',
            isRetryable: true,
          };
        default:
          return {
            message: data?.message || 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
            isRetryable: true,
          };
      }
    }

    if (error.code === 'NETWORK_ERROR') {
      return {
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        isRetryable: true,
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      isRetryable: true,
    };
  }
}

export default ChangeNowService;