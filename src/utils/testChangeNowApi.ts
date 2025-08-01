// Test utility to validate ChangeNOW API calls
// This matches the exact curl request format provided

const CHANGENOW_API_URL = import.meta.env.VITE_CHANGENOW_API_URL || 'https://api.changenow.io/v2';
const CHANGENOW_API_KEY = import.meta.env.VITE_CHANGENOW_API_KEY;

export const testChangeNowApiCall = async () => {
  try {
    console.log('🧪 Testing ChangeNOW API with exact curl format...');
    
    // Construct the URL exactly as in the curl request
    const params = new URLSearchParams({
      from_currency: 'INR',
      from_amount: '1900',
      to_currency: 'USDT',
      to_network: 'ETH', // Adding the missing parameter that should be there
      deposit_type: 'SEPA_1',
      payout_type: 'SEPA_1'
    });

    const url = `${CHANGENOW_API_URL}/fiat-estimate?${params.toString()}`;
    console.log('🔗 Request URL:', url);

    // Headers that match the curl request
    const headers = {
      'accept': 'application/json',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'x-api-key': CHANGENOW_API_KEY,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    };

    console.log('📋 Request headers:', headers);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
    });

    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Alternative test without to_network to match your exact curl
export const testChangeNowApiCallExact = async () => {
  try {
    console.log('🧪 Testing ChangeNOW API with EXACT curl format (no to_network)...');
    
    // Construct the URL exactly as in your curl request (without to_network)
    const params = new URLSearchParams({
      from_currency: 'INR',
      from_amount: '1900',
      to_currency: 'USDT',
      deposit_type: 'SEPA_1',
      payout_type: 'SEPA_1'
    });

    const url = `${CHANGENOW_API_URL}/fiat-estimate?${params.toString()}`;
    console.log('🔗 Request URL (exact curl):', url);

    const headers = {
      'accept': 'application/json',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'x-api-key': CHANGENOW_API_KEY,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
    });

    console.log('📊 Response status (exact curl):', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error (exact curl):', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response (exact curl):', data);
    
    return data;
  } catch (error) {
    console.error('❌ Exact curl test failed:', error);
    throw error;
  }
};