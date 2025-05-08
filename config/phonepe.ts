// PhonePe configuration file
// This centralizes all PhonePe-related configuration

// PhonePe API endpoints
export const PHONEPE_API = {
  TEST: {
    INITIATE: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
    STATUS: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status',
    REFUND: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund',
  },
  PROD: {
    INITIATE: 'https://api.phonepe.com/apis/hermes/pg/v1/pay',
    STATUS: 'https://api.phonepe.com/apis/hermes/pg/v1/status',
    REFUND: 'https://api.phonepe.com/apis/hermes/pg/v1/refund',
  }
};

// Helper function to safely access environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // For server-side code
  if (typeof process !== 'undefined' && process.env) {
    // In Next.js, environment variables are available via process.env
    // This works for both .env and .env.local files
    return process.env[key] || defaultValue;
  }

  // For client-side code
  // Next.js automatically exposes environment variables prefixed with NEXT_PUBLIC_
  // If you need client-side access, prefix your env vars with NEXT_PUBLIC_
  if (typeof window !== 'undefined') {
    // For environment variables exposed to the client
    if (process.env[`NEXT_PUBLIC_${key}`]) {
      return process.env[`NEXT_PUBLIC_${key}`] || defaultValue;
    }

    // Fallback for any custom __ENV object that might be defined
    if ((window as any).__ENV && (window as any).__ENV[key]) {
      return (window as any).__ENV[key] || defaultValue;
    }
  }

  return defaultValue;
};

// PhonePe merchant configuration from environment variables
export const PHONEPE_CONFIG = {
  MERCHANT_ID: getEnvVar('PHONEPE_MERCHANT_ID', ''),
  SALT_KEY: getEnvVar('PHONEPE_SALT_KEY', ''),
  SALT_INDEX: getEnvVar('PHONEPE_SALT_INDEX', '1'),
  IS_TEST_MODE: getEnvVar('PHONEPE_IS_TEST_MODE', 'true') === 'true',
};

// Generate a SHA256 hash
export async function generateSHA256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Base64 encode a string
export function base64Encode(str: string): string {
  if (typeof window !== 'undefined') {
    return btoa(str);
  } else {
    return Buffer.from(str).toString('base64');
  }
}

// Generate a unique transaction ID
export function generateTransactionId(bookingId: string | number): string {
  const timestamp = new Date().getTime();
  return `NIBOG_${bookingId}_${timestamp}`;
}

// Payment status types
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

// PhonePe payment request interface
export interface PhonePePaymentRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  callbackUrl: string;
  mobileNumber: string;
  paymentInstrument?: {
    type: string;
    [key: string]: any;
  };
}

// PhonePe payment response interface
export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse: {
      type: string;
      redirectInfo: {
        url: string;
        method: string;
      };
    };
  };
}
