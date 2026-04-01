// ============================================================
// PASSWORD RESET — Business Logic
// Generated from password-reset.blueprint.yaml v1.0.0
// ============================================================

import { randomBytes, createHash } from "crypto";
import { hash } from "bcryptjs";
import type {
  PasswordResetRequestInput,
  PasswordResetInput,
  ActionResult,
} from "./types";
import { AUTH_ERRORS } from "./types";
import {
  emitPasswordResetRequested,
  emitPasswordResetSuccess,
} from "./events";

// ─── Configuration from FDL rules ────────────────────────────

// FDL: rules.security.token.length_bytes
const TOKEN_LENGTH_BYTES = 32;
// FDL: rules.security.token_expiry.minutes
const TOKEN_EXPIRY_MINUTES = 60;
// FDL: rules.security.rate_limit — per_email
const RATE_LIMIT_PER_EMAIL_MAX = 3;
const RATE_LIMIT_PER_EMAIL_WINDOW = 3600;
// FDL: rules.security.rate_limit_global — per_ip
const RATE_LIMIT_PER_IP_MAX = 20;
const RATE_LIMIT_PER_IP_WINDOW = 3600;
// FDL: rules.security.password_history
const CHECK_PASSWORD_HISTORY = false;
const PASSWORD_HISTORY_COUNT = 0;
// FDL: rules.security.invalidate_sessions_on_reset
const INVALIDATE_SESSIONS_ON_RESET = true;

const BCRYPT_SALT_ROUNDS = 12;

// ─── Types ───────────────────────────────────────────────────

interface RequestContext {
  ip_address: string;
  user_agent: string;
}

// ─── Step 1: Request Password Reset ──────────────────────────
// FDL: flows.request_happy_path

export async function requestPasswordReset(
  input: PasswordResetRequestInput,
  ctx: RequestContext
): Promise<ActionResult> {
  // FDL: flows.request_happy_path.validate_email
  if (!input.email) {
    return {
      success: false,
      error: AUTH_ERRORS.RESET_VALIDATION_ERROR,
      fieldErrors: { email: "Email is required" },
    };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return {
      success: false,
      error: AUTH_ERRORS.RESET_VALIDATION_ERROR,
      fieldErrors: { email: "Please enter a valid email address" },
    };
  }

  // FDL: flows.request_happy_path.normalize — rules.email
  const normalizedEmail = input.email.toLowerCase().trim();

  // FDL: flows.request_happy_path.lookup
  const user = await lookupUserByEmail(normalizedEmail);

  // FDL: flows.request_email_not_found — rules.email.enumeration_prevention: true
  // SECURITY: Identical response whether email exists or not
  if (!user) {
    return { success: true };
  }

  // FDL: flows.request_happy_path.check_rate_limit
  const rateLimited = await checkEmailRateLimit(normalizedEmail);
  if (rateLimited) {
    // FDL: flows.rate_limited — same message as success
    return { success: true };
  }

  // FDL: flows.request_happy_path.invalidate_old — rules.security.invalidate_previous: true
  await invalidatePreviousTokens(user.id);

  // FDL: flows.request_happy_path.generate_token
  // FDL: rules.security.token.type: cryptographic_random
  const rawToken = randomBytes(TOKEN_LENGTH_BYTES).toString("hex");
  // FDL: rules.security.token.hash_before_storage: true, algorithm: sha256
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await storeResetToken({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  // FDL: flows.request_happy_path.send_email
  await sendResetEmail(normalizedEmail, rawToken, expiresAt);

  // FDL: flows.request_happy_path.emit_requested
  await emitPasswordResetRequested({
    user_id: user.id,
    email: normalizedEmail,
    timestamp: new Date(),
    ip_address: ctx.ip_address,
    token_expires_at: expiresAt,
  });

  // FDL: flows.request_happy_path.show_confirmation
  return { success: true };
}

// ─── Step 2: Reset Password ─────────────────────────────────
// FDL: flows.reset_happy_path

export async function resetPassword(
  input: PasswordResetInput,
  ctx: RequestContext
): Promise<ActionResult> {
  // FDL: flows.reset_happy_path.validate_fields
  const fieldErrors = validateResetInput(input);
  if (fieldErrors) {
    return {
      success: false,
      error: AUTH_ERRORS.RESET_VALIDATION_ERROR,
      fieldErrors,
    };
  }

  // FDL: flows.reset_happy_path.validate_token
  // Hash the provided token and look up in DB
  const tokenHash = createHash("sha256").update(input.token).digest("hex");
  const resetRecord = await lookupResetToken(tokenHash);

  // FDL: flows.token_invalid
  if (!resetRecord) {
    return { success: false, error: AUTH_ERRORS.RESET_TOKEN_INVALID };
  }

  // FDL: flows.token_expired
  if (resetRecord.expires_at < new Date()) {
    return { success: false, error: AUTH_ERRORS.RESET_TOKEN_EXPIRED };
  }

  if (resetRecord.used) {
    // FDL: rules.security.single_use: true
    return { success: false, error: AUTH_ERRORS.RESET_TOKEN_INVALID };
  }

  // FDL: flows.reset_happy_path.check_password_history (optional)
  if (CHECK_PASSWORD_HISTORY && PASSWORD_HISTORY_COUNT > 0) {
    const reused = await checkPasswordHistory(
      resetRecord.user_id,
      input.new_password,
      PASSWORD_HISTORY_COUNT
    );
    if (reused) {
      return { success: false, error: AUTH_ERRORS.RESET_PASSWORD_REUSED };
    }
  }

  // FDL: flows.reset_happy_path.hash_password
  const passwordHash = await hash(input.new_password, BCRYPT_SALT_ROUNDS);

  // FDL: flows.reset_happy_path.update_password
  await updateUserPassword(resetRecord.user_id, passwordHash);

  // FDL: flows.reset_happy_path.invalidate_token — rules.security.single_use: true
  await markTokenUsed(tokenHash);

  // FDL: flows.reset_happy_path.invalidate_sessions
  if (INVALIDATE_SESSIONS_ON_RESET) {
    await invalidateAllSessions(resetRecord.user_id);
  }

  // FDL: flows.reset_happy_path.emit_success
  await emitPasswordResetSuccess({
    user_id: resetRecord.user_id,
    email: resetRecord.email,
    timestamp: new Date(),
    ip_address: ctx.ip_address,
  });

  // FDL: flows.reset_happy_path.send_confirmation
  await sendPasswordChangedEmail(resetRecord.email);

  // FDL: flows.reset_happy_path.redirect — target: login
  return {
    success: true,
    redirect: "/login",
  };
}

// ─── Input Validation ────────────────────────────────────────
// FDL: fields[].validation (form: reset)

function validateResetInput(
  input: PasswordResetInput
): Record<string, string> | null {
  const errors: Record<string, string> = {};

  if (!input.token) {
    errors.token = "Reset token is missing";
  }

  // FDL: fields.new_password.validation — same rules as signup password
  if (!input.new_password) {
    errors.new_password = "New password is required";
  } else if (input.new_password.length < 8) {
    errors.new_password = "Password must be at least 8 characters";
  } else if (input.new_password.length > 64) {
    errors.new_password = "Password must be less than 64 characters";
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(input.new_password)
  ) {
    errors.new_password =
      "Password must contain uppercase, lowercase, and a number";
  }

  // FDL: fields.confirm_new_password.validation — type: match
  if (!input.confirm_new_password) {
    errors.confirm_new_password = "Please confirm your new password";
  } else if (input.confirm_new_password !== input.new_password) {
    errors.confirm_new_password = "Passwords do not match";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// ─── Database Stubs (Demo) ───────────────────────────────────
// DEMO: In-memory mock data. Replace with your actual database.

const demoTokens = new Map<string, { user_id: string; email: string; expires_at: Date; used: boolean }>();

async function lookupUserByEmail(email: string): Promise<{ id: string } | null> {
  return email === "demo@example.com" ? { id: "user_1" } : null;
}

async function checkEmailRateLimit(email: string): Promise<boolean> {
  return false;
}

async function invalidatePreviousTokens(userId: string): Promise<void> {
  for (const [key, val] of demoTokens) {
    if (val.user_id === userId) demoTokens.delete(key);
  }
}

async function storeResetToken(data: {
  user_id: string;
  token_hash: string;
  expires_at: Date;
}): Promise<void> {
  demoTokens.set(data.token_hash, {
    user_id: data.user_id,
    email: "demo@example.com",
    expires_at: data.expires_at,
    used: false,
  });
}

async function lookupResetToken(tokenHash: string): Promise<{
  user_id: string;
  email: string;
  expires_at: Date;
  used: boolean;
} | null> {
  return demoTokens.get(tokenHash) ?? null;
}

async function markTokenUsed(tokenHash: string): Promise<void> {
  const token = demoTokens.get(tokenHash);
  if (token) token.used = true;
}

async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  console.log("[demo] Password updated for user:", userId);
}

async function invalidateAllSessions(userId: string): Promise<void> {
  console.log("[demo] All sessions invalidated for user:", userId);
}

async function checkPasswordHistory(userId: string, newPassword: string, count: number): Promise<boolean> {
  return false;
}

async function sendResetEmail(email: string, token: string, expiresAt: Date): Promise<void> {
  console.log("[demo] Reset email sent to:", email, "token:", token);
}

async function sendPasswordChangedEmail(email: string): Promise<void> {
  console.log("[demo] Password changed confirmation sent to:", email);
}
