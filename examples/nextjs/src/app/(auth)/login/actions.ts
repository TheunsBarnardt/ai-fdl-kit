// ============================================================
// LOGIN — Server Actions
// Generated from login.blueprint.yaml v1.0.0
// FDL: extensions.nextjs.server_action: true
// ============================================================

"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { login } from "@/lib/auth/login";
import type { ActionResult, LoginInput } from "@/lib/auth/types";

export async function loginAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const headerStore = await headers();
  const input: LoginInput = {
    email: formData.get("email") as string ?? "",
    password: formData.get("password") as string ?? "",
    remember_me: formData.get("remember_me") === "on",
  };

  const result = await login(input, {
    ip_address: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
    user_agent: headerStore.get("user-agent") ?? "unknown",
  });

  if (result.success && result.data) {
    // FDL: rules.session.secure_flags — http_only, secure, same_site: strict
    const cookieStore = await cookies();
    cookieStore.set("access_token", result.data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60, // FDL: rules.session.access_token.expiry_minutes: 15
    });
    cookieStore.set("refresh_token", result.data.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: (input.remember_me ? 30 : 7) * 24 * 60 * 60,
    });
    redirect("/dashboard");
  }

  return result;
}
