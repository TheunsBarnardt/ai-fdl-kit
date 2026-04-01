// ============================================================
// FORGOT PASSWORD — Form Component (Request Step)
// Generated from password-reset.blueprint.yaml v1.0.0
// FDL: ui_hints.screens.request
// ============================================================

"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/app/(auth)/forgot-password/actions";
import type { ActionResult } from "@/lib/auth/types";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    forgotPasswordAction,
    null
  );

  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;

  // FDL: flows.request_happy_path.show_confirmation
  // FDL: flows.request_email_not_found — identical message (enumeration prevention)
  if (state?.success) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem", textAlign: "center" }}>
        <h1>Check your email</h1>
        <p>
          If an account with that email exists, we've sent a password reset
          link.
        </p>
        <a href="/login" style={{ display: "inline-block", marginTop: "1rem" }}>
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    // FDL: ui_hints.screens.request — layout: single_column_centered, max_width: 420px
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem" }}>
      {/* FDL: ui_hints.screens.request.show_logo: true */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1>Reset your password</h1>
        {/* FDL: ui_hints.screens.request.subtitle */}
        <p style={{ color: "#666" }}>
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form action={formAction}>
        {/* FDL: ui_hints.accessibility.aria_live_region: true */}
        {state && !state.success && !state.fieldErrors && (
          <div role="alert" aria-live="assertive" style={{ color: "red", marginBottom: "1rem" }}>
            {state.error.message}
          </div>
        )}

        {/* FDL: fields.email (form: request) */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            maxLength={255}
            // FDL: ui_hints.accessibility.autofocus_request: email
            autoFocus
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

        {/* FDL: ui_hints.screens.request.actions.primary — "Send reset link" */}
        {/* FDL: ui_hints.loading — disable_button, show_spinner, prevent_double_submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{ width: "100%", padding: "0.75rem" }}
        >
          {isPending ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {/* FDL: ui_hints.screens.request.links — "Back to sign in" below_form */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <a href="/login">Back to sign in</a>
      </div>
    </div>
  );
}
