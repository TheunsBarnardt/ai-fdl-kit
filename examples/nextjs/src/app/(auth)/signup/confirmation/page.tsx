export const metadata = { title: "Check Your Email" };

export default function SignupConfirmationPage() {
  return (
    <div style={{ maxWidth: 420, margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
      <h1>Check your email</h1>
      <p>Account created! Please check your email to verify.</p>
      <a href="/login" style={{ display: "inline-block", marginTop: "1rem" }}>
        Go to sign in
      </a>
    </div>
  );
}
