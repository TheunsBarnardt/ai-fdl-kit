// ============================================================
// FORGOT PASSWORD — Server Actions
// Generated from password-reset.blueprint.yaml v1.0.0
// FDL: extensions.nextjs — routes.request: "/forgot-password"
// ============================================================

"use server";

import { headers } from "next/headers";
import { requestPasswordReset } from "@/lib/auth/password-reset";
import type { ActionResult, PasswordResetRequestInput } from "@/lib/auth/types";

export async function forgotPasswordAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const headerStore = await headers();
  const input: PasswordResetRequestInput = {
    email: formData.get("email") as string ?? "",
  };

  const result = await requestPasswordReset(input, {
    ip_address: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    user_agent: headerStore.get("user-agent") ?? "unknown",
  });

  return result;
}
