// ============================================================
// RESET PASSWORD — Form Component (Reset Step)
// Generated from password-reset.blueprint.yaml v1.0.0
// FDL: ui_hints.screens.reset
// ============================================================

"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/app/(auth)/reset-password/actions";
import type { ActionResult } from "@/lib/auth/types";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    resetPasswordAction,
    null
  );

  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined;

  return (
    // FDL: ui_hints.screens.reset — layout: single_column_centered, max_width: 420px
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        {/* FDL: ui_hints.screens.reset.title */}
        <h1>Set new password</h1>
        {/* FDL: ui_hints.screens.reset.subtitle */}
        <p style={{ color: "#666" }}>Enter your new password below</p>
      </div>

      <form action={formAction}>
        {/* FDL: fields.token — hidden, passed from URL */}
        <input type="hidden" name="token" value={token} />

        {/* FDL: ui_hints.accessibility.aria_live_region: true */}
        {state && !state.success && !state.fieldErrors && (
          <div role="alert" aria-live="assertive" style={{ color: "red", marginBottom: "1rem" }}>
            {state.error.message}
            {/* FDL: flows.token_invalid / token_expired — link to request new one */}
            {state.error.redirect && (
              <a href={state.error.redirect} style={{ display: "block", marginTop: "0.5rem" }}>
                Request a new reset link
              </a>
            )}
          </div>
        )}

        {/* FDL: ui_hints.screens.reset.fields_order: [new_password, confirm_new_password] */}

        {/* FDL: fields.new_password */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="new_password">New Password</label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            required
            minLength={8}
            maxLength={64}
            // FDL: ui_hints.accessibility.autofocus_reset: new_password
            autoFocus
            // FDL: ui_hints.accessibility.autocomplete.new_password: new-password
            autoComplete="new-password"
            aria-invalid={!!fieldErrors?.new_password}
            aria-describedby={fieldErrors?.new_password ? "new-password-error" : undefined}
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
          {fieldErrors?.new_password && (
            <div id="new-password-error" role="alert" style={{ color: "red", fontSize: "0.875rem" }}>
              {fieldErrors.new_password}
            </div>
          )}
          {/* FDL: ui_hints.password_strength.show_requirements: true */}
          <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
            Must be 8+ characters with uppercase, lowercase, and a number
          </div>
        </div>

        {/* FDL: fields.confirm_new_password */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="confirm_new_password">Confirm New Password</label>
          <input
            id="confirm_new_password"
            name="confirm_new_password"
            type="password"
            required
            autoComplete="new-password"
            aria-invalid={!!fieldErrors?.confirm_new_password}
            aria-describedby={
              fieldErrors?.confirm_new_password
                ? "confirm-new-password-error"
                : undefined
            }
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
          {fieldErrors?.confirm_new_password && (
            <div
              id="confirm-new-password-error"
              role="alert"
              style={{ color: "red", fontSize: "0.875rem" }}
            >
              {fieldErrors.confirm_new_password}
            </div>
          )}
        </div>

        {/* FDL: ui_hints.screens.reset.actions.primary — "Reset password" */}
        {/* FDL: ui_hints.loading — disable_button, show_spinner, prevent_double_submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{ width: "100%", padding: "0.75rem" }}
        >
          {isPending ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}
