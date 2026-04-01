// ============================================================
// AUTH EVENTS — Generated from FDL Blueprints
// Emits events for audit logs, analytics, and other consumers.
// Replace console.log with your event bus (e.g., EventEmitter,
// message queue, analytics SDK).
// ============================================================

import type {
  LoginSuccessEvent,
  LoginFailedEvent,
  LoginLockedEvent,
  LoginUnverifiedEvent,
  SignupSuccessEvent,
  SignupDuplicateEmailEvent,
  PasswordResetRequestedEvent,
  PasswordResetSuccessEvent,
} from "./types";

// FDL: events (login.blueprint.yaml)
export function emitLoginSuccess(payload: LoginSuccessEvent): void {
  console.log("[event] login.success", { ...payload, timestamp: payload.timestamp.toISOString() });
}

export function emitLoginFailed(payload: LoginFailedEvent): void {
  console.log("[event] login.failed", { ...payload, timestamp: payload.timestamp.toISOString() });
}

export function emitLoginLocked(payload: LoginLockedEvent): void {
  console.log("[event] login.locked", { ...payload, timestamp: payload.timestamp.toISOString() });
}

export function emitLoginUnverified(payload: LoginUnverifiedEvent): void {
  console.log("[event] login.unverified", { ...payload, timestamp: payload.timestamp.toISOString() });
}

// FDL: events (signup.blueprint.yaml)
export function emitSignupSuccess(payload: SignupSuccessEvent): void {
  console.log("[event] signup.success", { ...payload, timestamp: payload.timestamp.toISOString() });
}

export function emitSignupDuplicateEmail(payload: SignupDuplicateEmailEvent): void {
  console.log("[event] signup.duplicate_email", { ...payload, timestamp: payload.timestamp.toISOString() });
}

// FDL: events (password-reset.blueprint.yaml)
export function emitPasswordResetRequested(payload: PasswordResetRequestedEvent): void {
  console.log("[event] password_reset.requested", { ...payload, timestamp: payload.timestamp.toISOString() });
}

export function emitPasswordResetSuccess(payload: PasswordResetSuccessEvent): void {
  console.log("[event] password_reset.success", { ...payload, timestamp: payload.timestamp.toISOString() });
}
