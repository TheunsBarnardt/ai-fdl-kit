// ============================================================
// RESET PASSWORD — Page Component
// Generated from password-reset.blueprint.yaml v1.0.0
// FDL: extensions.nextjs — routes.reset: "/reset-password"
// Token passed as URL search param: /reset-password?token=xxx
// ============================================================

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Set New Password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem", textAlign: "center" }}>
        <h1>Invalid reset link</h1>
        <p>This reset link is missing a token.</p>
        <a href="/forgot-password">Request a new reset link</a>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
