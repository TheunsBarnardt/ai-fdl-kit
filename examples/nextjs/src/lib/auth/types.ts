// ============================================================
// AUTH TYPES — Generated from FDL Blueprints
// login v1.0.0 | signup v1.0.0 | password-reset v1.0.0
// ============================================================

// ─── Login Types ─────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
  remember_me: boolean;
}

// FDL: errors (login.blueprint.yaml)
export type LoginErrorCode =
  | "LOGIN_INVALID_CREDENTIALS"
  | "LOGIN_ACCOUNT_LOCKED"
  | "LOGIN_EMAIL_NOT_VERIFIED"
  | "LOGIN_ACCOUNT_DISABLED"
  | "LOGIN_RATE_LIMITED"
  | "LOGIN_VALIDATION_ERROR";

// ─── Signup Types ────────────────────────────────────────────

export interface SignupInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
}

// FDL: errors (signup.blueprint.yaml)
export type SignupErrorCode =
  | "SIGNUP_VALIDATION_ERROR"
  | "SIGNUP_EMAIL_TAKEN"
  | "SIGNUP_RATE_LIMITED"
  | "SIGNUP_TERMS_NOT_ACCEPTED"
  | "SIGNUP_PASSWORD_WEAK"
  | "SIGNUP_PASSWORD_MISMATCH";

// ─── Password Reset Types ────────────────────────────────────

export interface PasswordResetRequestInput {
  email: string;
}

export interface PasswordResetInput {
  token: string;
  new_password: string;
  confirm_new_password: string;
}

// FDL: errors (password-reset.blueprint.yaml)
export type ResetErrorCode =
  | "RESET_VALIDATION_ERROR"
  | "RESET_TOKEN_INVALID"
  | "RESET_TOKEN_EXPIRED"
  | "RESET_PASSWORD_WEAK"
  | "RESET_PASSWORD_MISMATCH"
  | "RESET_PASSWORD_REUSED"
  | "RESET_RATE_LIMITED";

// ─── Shared Types ────────────────────────────────────────────

export type AuthErrorCode = LoginErrorCode | SignupErrorCode | ResetErrorCode;

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  status: number;
  retry: boolean;
  redirect?: string;
}

// FDL: errors — user-safe error messages
export const AUTH_ERRORS: Record<AuthErrorCode, AuthError> = {
  // Login errors
  LOGIN_INVALID_CREDENTIALS: {
    code: "LOGIN_INVALID_CREDENTIALS",
    status: 401,
    message: "Invalid email or password",
    retry: true,
  },
  LOGIN_ACCOUNT_LOCKED: {
    code: "LOGIN_ACCOUNT_LOCKED",
    status: 423,
    message: "Account temporarily locked. Please try again later.",
    retry: false,
  },
  LOGIN_EMAIL_NOT_VERIFIED: {
    code: "LOGIN_EMAIL_NOT_VERIFIED",
    status: 403,
    message: "Please verify your email address to continue",
    retry: false,
    redirect: "/verify-email",
  },
  LOGIN_ACCOUNT_DISABLED: {
    code: "LOGIN_ACCOUNT_DISABLED",
    status: 403,
    message: "This account has been disabled. Please contact support.",
    retry: false,
  },
  LOGIN_RATE_LIMITED: {
    code: "LOGIN_RATE_LIMITED",
    status: 429,
    message: "Too many login attempts. Please wait a moment.",
    retry: true,
  },
  LOGIN_VALIDATION_ERROR: {
    code: "LOGIN_VALIDATION_ERROR",
    status: 422,
    message: "Please check your input and try again",
    retry: true,
  },
  // Signup errors
  SIGNUP_VALIDATION_ERROR: {
    code: "SIGNUP_VALIDATION_ERROR",
    status: 422,
    message: "Please check your input and try again",
    retry: true,
  },
  SIGNUP_EMAIL_TAKEN: {
    code: "SIGNUP_EMAIL_TAKEN",
    status: 409,
    message:
      "Unable to create account. Please try a different email or sign in.",
    retry: true,
  },
  SIGNUP_RATE_LIMITED: {
    code: "SIGNUP_RATE_LIMITED",
    status: 429,
    message: "Too many attempts. Please try again later.",
    retry: false,
  },
  SIGNUP_TERMS_NOT_ACCEPTED: {
    code: "SIGNUP_TERMS_NOT_ACCEPTED",
    status: 422,
    message: "You must accept the terms to create an account",
    retry: true,
  },
  SIGNUP_PASSWORD_WEAK: {
    code: "SIGNUP_PASSWORD_WEAK",
    status: 422,
    message: "Password does not meet security requirements",
    retry: true,
  },
  SIGNUP_PASSWORD_MISMATCH: {
    code: "SIGNUP_PASSWORD_MISMATCH",
    status: 422,
    message: "Passwords do not match",
    retry: true,
  },
  // Password reset errors
  RESET_VALIDATION_ERROR: {
    code: "RESET_VALIDATION_ERROR",
    status: 422,
    message: "Please check your input and try again",
    retry: true,
  },
  RESET_TOKEN_INVALID: {
    code: "RESET_TOKEN_INVALID",
    status: 400,
    message: "This reset link is invalid. Please request a new one.",
    retry: false,
    redirect: "/forgot-password",
  },
  RESET_TOKEN_EXPIRED: {
    code: "RESET_TOKEN_EXPIRED",
    status: 400,
    message: "This reset link has expired. Please request a new one.",
    retry: false,
    redirect: "/forgot-password",
  },
  RESET_PASSWORD_WEAK: {
    code: "RESET_PASSWORD_WEAK",
    status: 422,
    message: "Password does not meet security requirements",
    retry: true,
  },
  RESET_PASSWORD_MISMATCH: {
    code: "RESET_PASSWORD_MISMATCH",
    status: 422,
    message: "Passwords do not match",
    retry: true,
  },
  RESET_PASSWORD_REUSED: {
    code: "RESET_PASSWORD_REUSED",
    status: 422,
    message: "Please choose a password you haven't used recently",
    retry: true,
  },
  RESET_RATE_LIMITED: {
    code: "RESET_RATE_LIMITED",
    status: 429,
    message: "Please wait before requesting another reset",
    retry: false,
  },
};

// ─── Action Result Types ─────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data?: T; redirect?: string }
  | { success: false; error: AuthError; fieldErrors?: Record<string, string> };

// ─── Event Types ─────────────────────────────────────────────
// FDL: events — all event payloads

export interface LoginSuccessEvent {
  user_id: string;
  email: string;
  timestamp: Date;
  ip_address: string;
  user_agent: string;
  session_id: string;
}

export interface LoginFailedEvent {
  email: string;
  timestamp: Date;
  ip_address: string;
  user_agent: string;
  attempt_count: number;
  reason: string;
}

export interface LoginLockedEvent {
  email: string;
  user_id: string;
  timestamp: Date;
  lockout_until: Date;
  attempt_count: number;
}

export interface LoginUnverifiedEvent {
  user_id: string;
  email: string;
  timestamp: Date;
}

export interface SignupSuccessEvent {
  user_id: string;
  email: string;
  timestamp: Date;
  ip_address: string;
  user_agent: string;
}

export interface SignupDuplicateEmailEvent {
  email: string;
  timestamp: Date;
  ip_address: string;
}

export interface PasswordResetRequestedEvent {
  user_id: string;
  email: string;
  timestamp: Date;
  ip_address: string;
  token_expires_at: Date;
}

export interface PasswordResetSuccessEvent {
  user_id: string;
  email: string;
  timestamp: Date;
  ip_address: string;
}
