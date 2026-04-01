// ============================================================
// SIGNUP — Business Logic
// Generated from signup.blueprint.yaml v1.0.0
// ============================================================

import { hash } from "bcryptjs";
import type { SignupInput, ActionResult } from "./types";
import { AUTH_ERRORS } from "./types";
import { emitSignupSuccess, emitSignupDuplicateEmail } from "./events";

// ─── Configuration from FDL rules ────────────────────────────

// FDL: rules.security.password_hashing.salt_rounds
const BCRYPT_SALT_ROUNDS = 12;
// FDL: rules.security.rate_limit
const RATE_LIMIT_WINDOW_SECONDS = 3600;
const RATE_LIMIT_MAX_REQUESTS = 5;
// FDL: rules.account.default_role
const DEFAULT_ROLE = "user";
// FDL: rules.account.email_verified_on_signup
const EMAIL_VERIFIED_ON_SIGNUP = false;
// FDL: rules.account.auto_login_after_signup
const AUTO_LOGIN_AFTER_SIGNUP = false;

// ─── Types ───────────────────────────────────────────────────

interface RequestContext {
  ip_address: string;
  user_agent: string;
}

// ─── Main Signup Flow ────────────────────────────────────────
// FDL: flows.happy_path

export async function signup(
  input: SignupInput,
  ctx: RequestContext
): Promise<ActionResult> {
  // FDL: flows.happy_path.validate
  const fieldErrors = validateSignupInput(input);
  if (fieldErrors) {
    return {
      success: false,
      error: AUTH_ERRORS.SIGNUP_VALIDATION_ERROR,
      fieldErrors,
    };
  }

  // FDL: flows.rate_limited
  const rateLimited = await checkRateLimit(ctx.ip_address);
  if (rateLimited) {
    return { success: false, error: AUTH_ERRORS.SIGNUP_RATE_LIMITED };
  }

  // FDL: flows.happy_path.normalize — rules.email.case_sensitive: false, trim_whitespace: true
  const normalizedEmail = input.email.toLowerCase().trim();

  // FDL: flows.happy_path.check_unique
  const existingUser = await lookupUserByEmail(normalizedEmail);

  // FDL: flows.email_taken — rules.security.email_enumeration_prevention.enabled: true
  // SECURITY: Same response whether email exists or not
  if (existingUser) {
    await emitSignupDuplicateEmail({
      email: normalizedEmail,
      timestamp: new Date(),
      ip_address: ctx.ip_address,
    });
    // Send "you already have an account" notification to the existing user
    await sendExistingAccountNotification(normalizedEmail);
    // Return same success-like message to prevent enumeration
    return {
      success: true,
      redirect: "/signup/confirmation",
    };
  }

  // FDL: flows.happy_path.hash_password — rules.security.password_hashing
  const passwordHash = await hash(input.password, BCRYPT_SALT_ROUNDS);

  // FDL: flows.happy_path.create_account
  const user = await createUser({
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    role: DEFAULT_ROLE,
    email_verified: EMAIL_VERIFIED_ON_SIGNUP,
  });

  // FDL: flows.happy_path.send_verification
  await sendVerificationEmail(user.id, normalizedEmail);

  // FDL: flows.happy_path.emit_success
  await emitSignupSuccess({
    user_id: user.id,
    email: normalizedEmail,
    timestamp: new Date(),
    ip_address: ctx.ip_address,
    user_agent: ctx.user_agent,
  });

  // FDL: flows.happy_path.redirect
  return {
    success: true,
    redirect: "/signup/confirmation",
  };
}

// ─── Input Validation ────────────────────────────────────────
// FDL: fields[].validation

function validateSignupInput(
  input: SignupInput
): Record<string, string> | null {
  const errors: Record<string, string> = {};

  // FDL: fields.first_name.validation — pattern: Unicode letters, hyphens, apostrophes
  if (!input.first_name || input.first_name.trim().length === 0) {
    errors.first_name = "First name is required";
  } else if (input.first_name.length > 100) {
    errors.first_name = "First name is too long";
  } else if (!/^[\p{L}\s'-]+$/u.test(input.first_name)) {
    errors.first_name = "First name contains invalid characters";
  }

  // FDL: fields.last_name.validation
  if (!input.last_name || input.last_name.trim().length === 0) {
    errors.last_name = "Last name is required";
  } else if (input.last_name.length > 100) {
    errors.last_name = "Last name is too long";
  } else if (!/^[\p{L}\s'-]+$/u.test(input.last_name)) {
    errors.last_name = "Last name contains invalid characters";
  }

  // FDL: fields.email.validation
  if (!input.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "Please enter a valid email address";
  } else if (input.email.length > 255) {
    errors.email = "Email is too long";
  }

  // FDL: fields.password.validation — pattern: uppercase + lowercase + digit
  if (!input.password) {
    errors.password = "Password is required";
  } else if (input.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (input.password.length > 64) {
    errors.password = "Password must be less than 64 characters";
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(input.password)) {
    errors.password =
      "Password must contain uppercase, lowercase, and a number";
  }

  // FDL: fields.confirm_password.validation — type: match, field: password
  if (!input.confirm_password) {
    errors.confirm_password = "Please confirm your password";
  } else if (input.confirm_password !== input.password) {
    errors.confirm_password = "Passwords do not match";
  }

  // FDL: fields.terms_accepted.validation
  if (!input.terms_accepted) {
    errors.terms_accepted =
      "You must accept the terms to create an account";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// ─── Database Stubs (Demo) ───────────────────────────────────
// DEMO: In-memory mock data. Replace with your actual database.

const existingEmails = new Set(["demo@example.com"]);

async function lookupUserByEmail(email: string): Promise<{ id: string } | null> {
  return existingEmails.has(email) ? { id: "user_1" } : null;
}

async function createUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: string;
  email_verified: boolean;
}): Promise<{ id: string }> {
  existingEmails.add(data.email);
  console.log("[demo] Created user:", data.email);
  return { id: `user_${Date.now()}` };
}

async function checkRateLimit(ipAddress: string): Promise<boolean> {
  return false;
}

async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  console.log("[demo] Verification email sent to:", email);
}

async function sendExistingAccountNotification(email: string): Promise<void> {
  console.log("[demo] Existing account notification sent to:", email);
}
