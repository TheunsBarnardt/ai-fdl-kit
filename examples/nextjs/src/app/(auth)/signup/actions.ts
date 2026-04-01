// ============================================================
// SIGNUP — Server Actions
// Generated from signup.blueprint.yaml v1.0.0
// FDL: extensions.nextjs.server_action: true
// ============================================================

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signup } from "@/lib/auth/signup";
import type { ActionResult, SignupInput } from "@/lib/auth/types";

export async function signupAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const headerStore = await headers();
  const input: SignupInput = {
    first_name: formData.get("first_name") as string ?? "",
    last_name: formData.get("last_name") as string ?? "",
    email: formData.get("email") as string ?? "",
    password: formData.get("password") as string ?? "",
    confirm_password: formData.get("confirm_password") as string ?? "",
    terms_accepted: formData.get("terms_accepted") === "on",
  };

  const result = await signup(input, {
    ip_address: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    user_agent: headerStore.get("user-agent") ?? "unknown",
  });

  if (result.success && result.redirect) {
    redirect(result.redirect);
  }

  return result;
}
