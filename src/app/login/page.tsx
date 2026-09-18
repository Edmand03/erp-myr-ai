"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import Link from "next/link";

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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: true,
      });

      console.log("[login] result:", result);

      if (result.error) {
        setError(result.error.message || "Invalid email or password.");
        return;
      }

      console.log("[login] Authentication successful, redirecting...");

      window.location.assign("/dashboard-redirect");
    } catch (error) {
      console.error("[login] error:", error);

      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decoration */}
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <main style={styles.container}>
        <div style={styles.card}>
          {/* =================================================
              BRAND
          ================================================= */}

          <div style={styles.brand}>
            <div style={styles.logoMark}>S</div>

            <div>
              <div style={styles.brandName}>SaaS ERP</div>

              <div style={styles.brandLabel}>BUSINESS OPERATING SYSTEM</div>
            </div>
          </div>

          {/* =================================================
              HEADER
          ================================================= */}

          <div style={styles.header}>
            <div style={styles.eyebrow}>WORKSPACE ACCESS</div>

            <h1 style={styles.title}>Welcome back</h1>

            <p style={styles.subtitle}>
              Sign in to continue to your business workspace.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div role="alert" style={styles.errorAlert}>
              <div style={styles.errorIcon}>!</div>

              <div style={styles.errorText}>{error}</div>
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleLogin} style={styles.form}>
            {/* Email */}

            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={styles.input}
              />
            </div>

            {/* Password */}

            <div style={styles.inputGroup}>
              <div style={styles.passwordHeader}>
                <label htmlFor="password" style={styles.label}>
                  Password
                </label>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={styles.input}
              />
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <span style={styles.spinner} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span style={styles.buttonArrow}>→</span>
                </>
              )}
            </button>
          </form>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div style={styles.footer}>
            <span style={styles.footerText}>Don't have an account?</span>

            <Link href="/register" style={styles.link}>
              Register your company
            </Link>
          </div>
        </div>

        {/* Security text */}

        <div style={styles.securityNote}>
          <span style={styles.securityDot} />
          Secure workspace authentication
        </div>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          min-height: 100%;
          background: #030712;
        }

        body {
          overflow-x: hidden;
        }

        input {
          font: inherit;
        }

        input::placeholder {
          color: #475569;
        }

        input:focus {
          border-color: rgba(56, 189, 248, 0.55) !important;
          box-shadow:
            0 0 0 3px rgba(56, 189, 248, 0.08),
            0 0 20px rgba(56, 189, 248, 0.03) !important;
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        a:hover {
          color: #7dd3fc !important;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 520px) {
          .login-card {
            padding: 28px 20px !important;
            border-radius: 16px !important;
          }

          .login-title {
            font-size: 27px !important;
          }

          .login-container {
            padding: 18px !important;
          }

          .login-brand {
            margin-bottom: 38px !important;
          }
        }

        @media (max-width: 380px) {
          .login-card {
            padding: 24px 16px !important;
          }

          .login-container {
            padding: 12px !important;
          }

          .login-title {
            font-size: 25px !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  // =========================================================
  // PAGE
  // =========================================================

  page: {
    position: "relative" as const,
    minHeight: "100vh",
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#030712",
    color: "#f8fafc",
    fontFamily:
      "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  backgroundGlowOne: {
    position: "fixed" as const,
    width: "500px",
    height: "500px",
    top: "-250px",
    left: "-180px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(56,189,248,0.08), transparent 70%)",
    pointerEvents: "none" as const,
  },

  backgroundGlowTwo: {
    position: "fixed" as const,
    width: "550px",
    height: "550px",
    right: "-250px",
    bottom: "-300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(14,165,233,0.05), transparent 70%)",
    pointerEvents: "none" as const,
  },

  // =========================================================
  // CONTAINER
  // =========================================================

  container: {
    position: "relative" as const,
    zIndex: 1,
    minHeight: "100vh",
    width: "100%",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
  },

  // =========================================================
  // CARD
  // =========================================================

  card: {
    width: "100%",
    maxWidth: "450px",
    backgroundColor: "#080d18",
    border: "1px solid #172033",
    borderRadius: "18px",
    padding: "38px",
    boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)",
  },

  // =========================================================
  // BRAND
  // =========================================================

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "48px",
  },

  logoMark: {
    width: "40px",
    height: "40px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, rgba(56,189,248,0.16), rgba(56,189,248,0.04))",
    border: "1px solid rgba(56,189,248,0.22)",
    color: "#38bdf8",
    fontSize: "17px",
    fontWeight: 900,
    boxShadow: "0 0 25px rgba(56,189,248,0.08)",
  },

  brandName: {
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "-0.2px",
  },

  brandLabel: {
    marginTop: "3px",
    color: "#475569",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: "0.9px",
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    marginBottom: "28px",
  },

  eyebrow: {
    color: "#38bdf8",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1.2px",
    marginBottom: "9px",
  },

  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.8px",
  },

  subtitle: {
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  // =========================================================
  // ERROR
  // =========================================================

  errorAlert: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 13px",
    marginBottom: "22px",
    borderRadius: "10px",
    backgroundColor: "rgba(239,68,68,0.06)",
    border: "1px solid rgba(239,68,68,0.18)",
    color: "#fca5a5",
  },

  errorIcon: {
    width: "18px",
    height: "18px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "rgba(239,68,68,0.15)",
    color: "#f87171",
    fontSize: "10px",
    fontWeight: 900,
  },

  errorText: {
    fontSize: "11px",
    lineHeight: 1.5,
  },

  // =========================================================
  // FORM
  // =========================================================

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "21px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },

  passwordHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    color: "#cbd5e1",
    fontSize: "11px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    minHeight: "48px",
    padding: "12px 14px",
    borderRadius: "10px",
    outline: "none",
    backgroundColor: "#0c1320",
    border: "1px solid #1d2a3e",
    color: "#f8fafc",
    fontSize: "13px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },

  button: {
    width: "100%",
    minHeight: "48px",
    marginTop: "5px",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#38bdf8",
    color: "#031018",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 25px -14px rgba(56,189,248,0.8)",
    transition: "transform 0.15s ease, filter 0.2s ease, opacity 0.2s ease",
  },

  buttonArrow: {
    fontSize: "16px",
    lineHeight: 1,
  },

  spinner: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: "2px solid rgba(3,16,24,0.25)",
    borderTopColor: "#031018",
    animation: "spin 0.7s linear infinite",
  },

  // =========================================================
  // FOOTER
  // =========================================================

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    gap: "5px",
    marginTop: "28px",
    paddingTop: "22px",
    borderTop: "1px solid #172033",
  },

  footerText: {
    color: "#475569",
    fontSize: "11px",
  },

  link: {
    color: "#38bdf8",
    fontSize: "11px",
    fontWeight: 700,
    textDecoration: "none",
  },

  // =========================================================
  // SECURITY
  // =========================================================

  securityNote: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginTop: "18px",
    color: "#334155",
    fontSize: "9px",
    fontWeight: 650,
  },

  securityDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    boxShadow: "0 0 8px rgba(16,185,129,0.6)",
  },
};
