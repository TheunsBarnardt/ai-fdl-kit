// ============================================================
// LOGIN — Form Component
// Generated from login.blueprint.yaml v1.0.0
// ============================================================

"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/(auth)/login/actions";
import type { ActionResult } from "@/lib/auth/types";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null
  );

  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;

  return (
    // FDL: ui_hints.layout: single_column_centered, max_width: 420px
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem" }}>
      {/* FDL: ui_hints.show_logo: true */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        {/* TODO: Replace with your logo */}
        <h1>Sign in</h1>
      </div>

      <form action={formAction}>
        {/* FDL: ui_hints.accessibility.aria_live_region: true */}
        {state && !state.success && !state.fieldErrors && (
          <div role="alert" aria-live="assertive" style={{ color: "red", marginBottom: "1rem" }}>
            {state.error.message}
            {/* FDL: errors — LOGIN_EMAIL_NOT_VERIFIED redirect */}
            {state.error.redirect && (
              <a href={state.error.redirect} style={{ display: "block", marginTop: "0.5rem" }}>
                {state.error.code === "LOGIN_EMAIL_NOT_VERIFIED"
                  ? "Resend verification email"
                  : "Try again"}
              </a>
            )}
          </div>
        )}

        {/* FDL: fields_order: [email, password, remember_me] */}

        {/* FDL: fields.email */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            maxLength={255}
            // FDL: ui_hints.accessibility.autofocus: email
            autoFocus
            // FDL: ui_hints.accessibility.autocomplete.email: username
            autoComplete="username"
            aria-invalid={!!fieldErrors?.email}
            aria-describedby={fieldErrors?.email ? "email-error" : undefined}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
          {fieldErrors?.email && (
            <div id="email-error" role="alert" style={{ color: "red", fontSize: "0.875rem" }}>
              {fieldErrors.email}
            </div>
          )}
        </div>

        {/* FDL: fields.password */}
        <div style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={64}
            // FDL: ui_hints.accessibility.autocomplete.password: current-password
            autoComplete="current-password"
            aria-invalid={!!fieldErrors?.password}
            aria-describedby={fieldErrors?.password ? "password-error" : undefined}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
          {fieldErrors?.password && (
            <div id="password-error" role="alert" style={{ color: "red", fontSize: "0.875rem" }}>
              {fieldErrors.password}
            </div>
          )}
        </div>

        {/* FDL: ui_hints.links — "Forgot password?" below_password_field */}
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <a href="/forgot-password" style={{ fontSize: "0.875rem" }}>
            Forgot password?
          </a>
        </div>

        {/* FDL: fields.remember_me */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input name="remember_me" type="checkbox" />
            Remember me
          </label>
        </div>

        {/* FDL: ui_hints.actions.primary — label: "Sign in", full_width: true */}
        {/* FDL: ui_hints.loading — disable_button, show_spinner, prevent_double_submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{ width: "100%", padding: "0.75rem" }}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* FDL: ui_hints.links — "Don't have an account? Sign up" below_form */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <a href="/signup">Don't have an account? Sign up</a>
      </div>
    </div>
  );
}
