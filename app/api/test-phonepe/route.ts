import { NextResponse } from 'next/server';
import { validatePhonePeConfig, logPhonePeConfig, PHONEPE_CONFIG } from '@/config/phonepe';

/**
 * Test endpoint to validate PhonePe configuration
 * Only available in development mode for security
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: "Configuration test not available in production" },
      { status: 403 }
    );
  }

  try {
    // Log configuration to console
    logPhonePeConfig();
    
    // Validate configuration
    const validation = validatePhonePeConfig();

    // Mask sensitive data for response
    const safeConfig = {
      environment: PHONEPE_CONFIG.ENVIRONMENT,
      merchantId: PHONEPE_CONFIG.MERCHANT_ID,
      saltKey: PHONEPE_CONFIG.SALT_KEY ? '***' + PHONEPE_CONFIG.SALT_KEY.slice(-4) : 'NOT SET',
      saltIndex: PHONEPE_CONFIG.SALT_INDEX,
      appUrl: PHONEPE_CONFIG.APP_URL,
      isTestMode: PHONEPE_CONFIG.IS_TEST_MODE,
      isValid: validation.isValid,
      errors: validation.errors
    };

    return NextResponse.json({
      status: "success",
      message: "PhonePe configuration test completed",
      config: safeConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
