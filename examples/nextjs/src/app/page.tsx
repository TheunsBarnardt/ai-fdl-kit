import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ maxWidth: 480, margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
      <h1>FDL Auth Example</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Generated from FDL auth blueprints (login, signup, password-reset)
      </p>
      <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Link href="/login" style={{ padding: "0.75rem", border: "1px solid #ccc", borderRadius: 4, textDecoration: "none", color: "inherit" }}>
          Sign In
        </Link>
        <Link href="/signup" style={{ padding: "0.75rem", border: "1px solid #ccc", borderRadius: 4, textDecoration: "none", color: "inherit" }}>
          Create Account
        </Link>
        <Link href="/forgot-password" style={{ padding: "0.75rem", border: "1px solid #ccc", borderRadius: 4, textDecoration: "none", color: "inherit" }}>
          Forgot Password
        </Link>
      </nav>
    </div>
  );
}
