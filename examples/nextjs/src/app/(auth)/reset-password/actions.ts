// ============================================================
// RESET PASSWORD — Server Actions
// Generated from password-reset.blueprint.yaml v1.0.0
// FDL: extensions.nextjs — routes.reset: "/reset-password"
// ============================================================

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resetPassword } from "@/lib/auth/password-reset";
import type { ActionResult, PasswordResetInput } from "@/lib/auth/types";

export async function resetPasswordAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const headerStore = await headers();
  const input: PasswordResetInput = {
    // FDL: Token passed as URL search param: /reset-password?token=xxx
    token: formData.get("token") as string ?? "",
    new_password: formData.get("new_password") as string ?? "",
    confirm_new_password: formData.get("confirm_new_password") as string ?? "",
  };

  const result = await resetPassword(input, {
    ip_address: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    user_agent: headerStore.get("user-agent") ?? "unknown",
  });

  if (result.success && result.redirect) {
    redirect(result.redirect);
  }

  return result;
}
