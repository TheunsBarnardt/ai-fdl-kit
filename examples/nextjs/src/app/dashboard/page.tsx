export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 600, margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
      <h1>Dashboard</h1>
      <p>You are logged in. This is a placeholder dashboard.</p>
      <a href="/login">Sign out (back to login)</a>
    </div>
  );
}
