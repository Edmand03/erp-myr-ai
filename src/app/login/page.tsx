"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (typeof window !== "undefined" ? window.location.origin : ""),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard-redirect",
      });

      if (authError) {
        setError(authError.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>S</div>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>
            Enter your credentials to access your workspace
          </p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <svg
              style={{ width: "16px", height: "16px", flexShrink: 0 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in..." : "Sign In to Workspace"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <a href="/register" style={styles.link}>
            Register your company
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#09090b",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "12px",
    padding: "40px 32px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
  },
  header: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    marginBottom: "28px",
  },
  logoBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold" as const,
    marginBottom: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#ffffff",
    margin: "0 0 8px 0",
    letterSpacing: "-0.025em",
  },
  subtitle: {
    fontSize: "14px",
    color: "#a1a1aa",
    margin: 0,
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#e4e4e7",
  },
  input: {
    padding: "10px 14px",
    backgroundColor: "#09090b",
    border: "1px solid #27272a",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s ease",
  },
  button: {
    padding: "12px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    marginTop: "8px",
  },
  footerText: {
    fontSize: "13px",
    color: "#a1a1aa",
    textAlign: "center" as const,
    marginTop: "24px",
    marginBottom: 0,
  },
  link: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 500,
  },
};
