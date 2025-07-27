// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_PROXY = import.meta.env.VITE_USE_API_PROXY === 'true';

// API client with proper error handling
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    // Use proxy route if enabled, otherwise use direct API URL
    this.baseUrl = USE_PROXY ? '/api' : baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token if available
    const token = localStorage.getItem('sessionToken');
    if (token && config.headers) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Service-specific API calls
export const servicesApi = {
  // Get all services
  getServices: () => apiClient.get('/services'),
  
  // Access a specific service
  accessService: (serviceId: string, paymentData: any) => 
    apiClient.post(`/services/${serviceId}/access`, paymentData),
  
  // VPN access
  accessVpn: (serviceId: string, paymentData: any) => 
    apiClient.post('/vpn/access', { serviceId, ...paymentData }),
  
  // Course access  
  accessCourse: (serviceId: string, paymentData: any) => 
    apiClient.post('/courses/access', { serviceId, ...paymentData }),
  
  // Storage access
  accessStorage: (serviceId: string, paymentData: any) => 
    apiClient.post('/storage/access', { serviceId, ...paymentData }),
};

// Error handler for API calls
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.message.includes('Failed to fetch')) {
    return 'Network error. Please check your internet connection or try again later.';
  } else if (error.message.includes('blocked by CORS policy')) {
    return 'Configuration error. Please contact support - the server needs to allow requests from this domain.';
  } else if (error.message.includes('NetworkError') || error.name === 'NetworkError') {
    return 'Connection failed. The server may be temporarily unavailable.';
  } else if (error.message.includes('401')) {
    return 'Authentication failed. Please log in again.';
  } else if (error.message.includes('403')) {
    return 'Access denied. You do not have permission for this action.';
  } else if (error.message.includes('404')) {
    return 'Service not found. Please try again or contact support.';
  } else if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (error.message.includes('502') || error.message.includes('503')) {
    return 'Service temporarily unavailable. Please try again in a few minutes.';
  } else {
    return `An unexpected error occurred: ${error.message || 'Please try again.'}`;
  }
};