// ============================================================
// SIGNUP — Form Component
// Generated from signup.blueprint.yaml v1.0.0
// ============================================================

"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/(auth)/signup/actions";
import type { ActionResult } from "@/lib/auth/types";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    signupAction,
    null
  );

  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;

  return (
    // FDL: ui_hints.layout: single_column_centered, max_width: 480px
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "2rem" }}>
      {/* FDL: ui_hints.show_logo: true */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1>Create account</h1>
      </div>

      <form action={formAction}>
        {/* FDL: ui_hints.accessibility.aria_live_region: true */}
        {state && !state.success && !state.fieldErrors && (
          <div role="alert" aria-live="assertive" style={{ color: "red", marginBottom: "1rem" }}>
            {state.error.message}
          </div>
        )}

        {/* FDL: ui_hints.fields_order: [first_name, last_name, email, password, confirm_password, terms_accepted] */}

        {/* FDL: ui_hints.field_grouping — name group: side_by_side */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          {/* FDL: fields.first_name */}
          <div style={{ flex: 1 }}>
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="John"
              required
              maxLength={100}
              // FDL: ui_hints.accessibility.autofocus: first_name
              autoFocus
              // FDL: ui_hints.accessibility.autocomplete.first_name: given-name
              autoComplete="given-name"
              aria-invalid={!!fieldErrors?.first_name}
              aria-describedby={fieldErrors?.first_name ? "first-name-error" : undefined}
              style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            />
            {fieldErrors?.first_name && (
              <div id="first-name-error" role="alert" style={{ color: "red", fontSize: "0.875rem" }}>
                {fieldErrors.first_name}
              </div>
            )}
          </div>

          {/* FDL: fields.last_name */}
          <div style={{ flex: 1 }}>
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Doe"
              required
              maxLength={100}
              autoComplete="family-name"
              aria-invalid={!!fieldErrors?.last_name}
              aria-describedby={fieldErrors?.last_name ? "last-name-error" : undefined}
              style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
            />
            {fieldErrors?.last_name && (
              <div id="last-name-error" role="alert" style={{ color: "red", fontSize: "0.875rem" }}>
                {fieldErrors.last_name}
              </div>
            )}
          </div>
        </div>

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
            autoComplete="email"
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
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={64}
            // FDL: ui_hints.accessibility.autocomplete.password: new-password
            autoComplete="new-password"
            aria-invalid={!!fieldErrors?.password}
            aria-describedby={fieldErrors?.password ? "password-error" : undefined}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
          {fieldErrors?.password && (
            <div id="password-error" role="alert" style={{ color: "red", fontSize: "0.875rem" }}>
              {fieldErrors.password}
            </div>
          )}
          {/* FDL: ui_hints.password_strength.show_requirements: true */}
          <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
            Must be 8+ characters with uppercase, lowercase, and a number
          </div>
        </div>

        {/* FDL: fields.confirm_password */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            required
            autoComplete="new-password"
            aria-invalid={!!fieldErrors?.confirm_password}
            aria-describedby={fieldErrors?.confirm_password ? "confirm-password-error" : undefined}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
          {fieldErrors?.confirm_password && (
            <div id="confirm-password-error" role="alert" style={{ color: "red", fontSize: "0.875rem" }}>
              {fieldErrors.confirm_password}
            </div>
          )}
        </div>

        {/* FDL: fields.terms_accepted */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <input
              name="terms_accepted"
              type="checkbox"
              required
              style={{ marginTop: "0.25rem" }}
            />
            <span>
              I agree to the{" "}
              {/* FDL: ui_hints.links — Terms of Service, inline_with_checkbox */}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
          {fieldErrors?.terms_accepted && (
            <div role="alert" style={{ color: "red", fontSize: "0.875rem" }}>
              {fieldErrors.terms_accepted}
            </div>
          )}
        </div>

        {/* FDL: ui_hints.actions.primary — label: "Create account", full_width: true */}
        {/* FDL: ui_hints.loading — disable_button, show_spinner, prevent_double_submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{ width: "100%", padding: "0.75rem" }}
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      {/* FDL: ui_hints.links — "Already have an account? Sign in" below_form */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <a href="/login">Already have an account? Sign in</a>
      </div>
    </div>
  );
}
