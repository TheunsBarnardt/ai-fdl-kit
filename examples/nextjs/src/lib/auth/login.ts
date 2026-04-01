// ============================================================
// LOGIN — Business Logic
// Generated from login.blueprint.yaml v1.0.0
// ============================================================

import { compare } from "bcryptjs";
import type { LoginInput, ActionResult, AuthError } from "./types";
import { AUTH_ERRORS } from "./types";
import { emitLoginSuccess, emitLoginFailed, emitLoginLocked } from "./events";

// ─── Configuration from FDL rules ────────────────────────────

// FDL: rules.security.max_attempts
const MAX_ATTEMPTS = 5;
// FDL: rules.security.lockout_duration_minutes
const LOCKOUT_DURATION_MINUTES = 15;
// FDL: rules.security.rate_limit
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 10;
// FDL: rules.session.access_token.expiry_minutes
const ACCESS_TOKEN_EXPIRY_MINUTES = 15;
// FDL: rules.session.refresh_token.expiry_days
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
// FDL: rules.session.remember_me_expiry_days
const REMEMBER_ME_EXPIRY_DAYS = 30;

// ─── Types ───────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  status: "active" | "disabled";
  failed_login_attempts: number;
  locked_until: Date | null;
}

interface RequestContext {
  ip_address: string;
  user_agent: string;
}

// ─── Main Login Flow ─────────────────────────────────────────
// FDL: flows.happy_path

export async function login(
  input: LoginInput,
  ctx: RequestContext
): Promise<ActionResult<{ access_token: string; refresh_token: string }>> {
  // FDL: flows.happy_path.validate
  const fieldErrors = validateLoginInput(input);
  if (fieldErrors) {
    return {
      success: false,
      error: AUTH_ERRORS.LOGIN_VALIDATION_ERROR,
      fieldErrors,
    };
  }

  // FDL: flows.rate_limited
  const rateLimited = await checkRateLimit(ctx.ip_address);
  if (rateLimited) {
    return { success: false, error: AUTH_ERRORS.LOGIN_RATE_LIMITED };
  }

  // FDL: flows.happy_path.normalize — rules.email.case_sensitive: false, trim_whitespace: true
  const normalizedEmail = input.email.toLowerCase().trim();

  // FDL: flows.happy_path.lookup
  const user = await lookupUserByEmail(normalizedEmail);

  // FDL: flows.invalid_credentials — credential_error_handling.generic_message: true
  // SECURITY: Same error for user-not-found and wrong-password to prevent enumeration
  if (!user) {
    await emitLoginFailed({
      email: normalizedEmail,
      timestamp: new Date(),
      ip_address: ctx.ip_address,
      user_agent: ctx.user_agent,
      attempt_count: 0,
      reason: "user_not_found",
    });
    return { success: false, error: AUTH_ERRORS.LOGIN_INVALID_CREDENTIALS };
  }

  // FDL: flows.happy_path.check_lock
  if (user.locked_until && user.locked_until > new Date()) {
    await emitLoginLocked({
      email: normalizedEmail,
      user_id: user.id,
      timestamp: new Date(),
      lockout_until: user.locked_until,
      attempt_count: user.failed_login_attempts,
    });
    return { success: false, error: AUTH_ERRORS.LOGIN_ACCOUNT_LOCKED };
  }

  // FDL: flows.happy_path.check_disabled — flows.account_disabled
  if (user.status === "disabled") {
    return { success: false, error: AUTH_ERRORS.LOGIN_ACCOUNT_DISABLED };
  }

  // FDL: flows.happy_path.compare_password
  // FDL: rules.security.password_comparison.constant_time: true
  // bcryptjs.compare is constant-time by design
  const passwordValid = await compare(input.password, user.password_hash);
  if (!passwordValid) {
    // FDL: flows.invalid_credentials — increment_attempt_counter
    const newAttemptCount = user.failed_login_attempts + 1;
    const lockUntil =
      newAttemptCount >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
        : null;

    await updateLoginAttempts(user.id, newAttemptCount, lockUntil);

    if (lockUntil) {
      await emitLoginLocked({
        email: normalizedEmail,
        user_id: user.id,
        timestamp: new Date(),
        lockout_until: lockUntil,
        attempt_count: newAttemptCount,
      });
    }

    await emitLoginFailed({
      email: normalizedEmail,
      timestamp: new Date(),
      ip_address: ctx.ip_address,
      user_agent: ctx.user_agent,
      attempt_count: newAttemptCount,
      reason: "invalid_password",
    });

    return { success: false, error: AUTH_ERRORS.LOGIN_INVALID_CREDENTIALS };
  }

  // FDL: flows.happy_path.check_verified — rules.email.require_verified: true
  if (!user.email_verified) {
    return {
      success: false,
      error: AUTH_ERRORS.LOGIN_EMAIL_NOT_VERIFIED,
      redirect: "/verify-email",
    };
  }

  // FDL: flows.happy_path.reset_attempts
  await updateLoginAttempts(user.id, 0, null);

  // FDL: flows.happy_path.create_session
  const refreshExpiryDays = input.remember_me
    ? REMEMBER_ME_EXPIRY_DAYS
    : REFRESH_TOKEN_EXPIRY_DAYS;
  const session = await createSession(user.id, {
    accessTokenExpiryMinutes: ACCESS_TOKEN_EXPIRY_MINUTES,
    refreshTokenExpiryDays: refreshExpiryDays,
    // FDL: rules.session.refresh_token.rotate_on_use: true
    rotateRefreshToken: true,
  });

  // FDL: flows.happy_path.emit_success
  await emitLoginSuccess({
    user_id: user.id,
    email: normalizedEmail,
    timestamp: new Date(),
    ip_address: ctx.ip_address,
    user_agent: ctx.user_agent,
    session_id: session.session_id,
  });

  // FDL: flows.happy_path.redirect — extensions.nextjs.middleware_redirect: "/dashboard"
  return {
    success: true,
    data: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    },
    redirect: "/dashboard",
  };
}

// ─── Input Validation ────────────────────────────────────────
// FDL: fields[].validation

function validateLoginInput(
  input: LoginInput
): Record<string, string> | null {
  const errors: Record<string, string> = {};

  // FDL: fields.email.validation
  if (!input.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "Please enter a valid email address";
  } else if (input.email.length > 255) {
    errors.email = "Email is too long";
  }

  // FDL: fields.password.validation
  if (!input.password) {
    errors.password = "Password is required";
  } else if (input.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (input.password.length > 64) {
    // FDL: OWASP — bcrypt 72-byte limit
    errors.password = "Password must be less than 64 characters";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// ─── Database Stubs (Demo) ───────────────────────────────────
// DEMO: In-memory mock data. Replace with your actual database.

const DEMO_USER: User = {
  id: "user_1",
  email: "demo@example.com",
  // "Password1" hashed with bcrypt (salt rounds 12)
  password_hash: "$2a$12$5mzN/vDPTZDRV4yFYPnBq.uMf0yEkSahzTMgOzk8GOrUdHGVcSHWe",
  email_verified: true,
  status: "active",
  failed_login_attempts: 0,
  locked_until: null,
};

async function lookupUserByEmail(email: string): Promise<User | null> {
  return email === DEMO_USER.email ? { ...DEMO_USER } : null;
}

async function updateLoginAttempts(
  userId: string,
  attemptCount: number,
  lockedUntil: Date | null
): Promise<void> {
  // no-op in demo
}

async function checkRateLimit(ipAddress: string): Promise<boolean> {
  return false; // never rate-limited in demo
}

async function createSession(
  userId: string,
  options: {
    accessTokenExpiryMinutes: number;
    refreshTokenExpiryDays: number;
    rotateRefreshToken: boolean;
  }
): Promise<{ session_id: string; access_token: string; refresh_token: string }> {
  return {
    session_id: `sess_${Date.now()}`,
    access_token: `demo_access_${Date.now()}`,
    refresh_token: `demo_refresh_${Date.now()}`,
  };
}
