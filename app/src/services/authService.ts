/**
 * Authentication and Bank KYC Service
 * Clean service layer isolating authentication and validation business logic from the UI.
 * Connectable to real REST/GraphQL agritech backends in production.
 */

export const DEMO_OTP = '123456';
export const LEGACY_DEMO_OTP = '8492';

export interface RegisterResult {
  success: boolean;
  error?: string;
  errorKey?: string;
}

export interface SendOtpResult {
  success: boolean;
  demoOtp: string;
  expiresInSeconds: number;
}

export interface VerifyOtpResult {
  success: boolean;
  errorKey?: string;
}

export interface LoginResult {
  success: boolean;
  errorKey?: string;
}

export interface BankValidationResult {
  isValid: boolean;
  errorKey?: string;
}

/**
 * Validates a 10-digit Indian mobile number
 * Starts with 6, 7, 8, or 9 and has exactly 10 digits
 */
export function isValidIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates password: minimum 6 characters
 */
export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.trim().length >= 6;
}

/**
 * Validates Indian Financial System Code (IFSC)
 * 11 characters: 4 letters, then '0', then 6 alphanumeric characters
 */
export function isValidIfsc(ifsc: string): boolean {
  if (!ifsc) return false;
  const cleaned = ifsc.trim().toUpperCase();
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleaned);
}

/**
 * Validates bank account number (between 9 and 18 digits in India)
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  const cleaned = accountNumber.replace(/\D/g, '');
  return cleaned.length >= 9 && cleaned.length <= 18;
}

/**
 * Masks an account number, showing only the last 4 digits
 * e.g. "123456789012" -> "•••• •••• •••• 9012"
 */
export function maskAccountNumber(accountNumber: string): string {
  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '•••• •••• ••••';
  const lastFour = cleaned.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
}

export const authService = {
  /**
   * Register a new farmer account
   */
  async register(phone: string, password: string): Promise<RegisterResult> {
    // Simulated network latency for realistic fintech feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!isValidIndianMobile(phone)) {
      return { success: false, errorKey: 'auth.validationMobile' };
    }

    if (!isValidPassword(password)) {
      return { success: false, errorKey: 'auth.passwordTooShort' };
    }

    return { success: true };
  },

  /**
   * Send 6-digit OTP to farmer's mobile
   */
  async sendOtp(phone: string): Promise<SendOtpResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In demo/hackathon mode, returns the configurable demo OTP
    return {
      success: true,
      demoOtp: DEMO_OTP,
      expiresInSeconds: 30,
    };
  },

  /**
   * Verify the entered OTP
   */
  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleaned = otp.trim();
    if (cleaned === DEMO_OTP || cleaned === LEGACY_DEMO_OTP || cleaned === '123456') {
      return { success: true };
    }

    return { success: false, errorKey: 'auth.otpInvalid' };
  },

  /**
   * Farmer login with mobile and password
   */
  async login(phone: string, password: string): Promise<LoginResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!isValidIndianMobile(phone)) {
      return { success: false, errorKey: 'auth.validationMobile' };
    }

    if (!isValidPassword(password)) {
      return { success: false, errorKey: 'auth.passwordTooShort' };
    }

    return { success: true };
  },

  /**
   * Validate Bank KYC fields before saving
   */
  validateBankDetails(details: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    confirmAccountNumber: string;
    ifscCode: string;
  }): BankValidationResult {
    if (!details.accountHolderName.trim()) {
      return { isValid: false, errorKey: 'kyc.nameRequired' };
    }

    if (!details.bankName.trim()) {
      return { isValid: false, errorKey: 'kyc.bankNameRequired' };
    }

    if (!isValidAccountNumber(details.accountNumber)) {
      return { isValid: false, errorKey: 'kyc.invalidAccount' };
    }

    if (details.accountNumber.trim() !== details.confirmAccountNumber.trim()) {
      return { isValid: false, errorKey: 'kyc.accountMismatch' };
    }

    if (!isValidIfsc(details.ifscCode)) {
      return { isValid: false, errorKey: 'kyc.invalidIfsc' };
    }

    return { isValid: true };
  },
};
