"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

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

      console.log("LOGIN RESULT:", result);

      if (result.error) {
        setError(
          result.error.message || "Unable to sign in with those credentials.",
        );
        return;
      }

      window.location.replace("/dashboard-redirect");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* =====================================================
          SUBTLE BACKGROUND
      ===================================================== */}

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="login-content">
        {/* ===================================================
            BRAND
        =================================================== */}

        <div className="brand">
          <div className="brand-mark">S</div>

          <span className="brand-name">SaaS ERP</span>
        </div>

        {/* ===================================================
            LOGIN
        =================================================== */}

        <section className="login-section">
          <div className="heading">
            <h1>Sign in</h1>

            <p>Access your business workspace.</p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="error" role="alert">
              <span className="error-mark">!</span>

              <span>{error}</span>
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleLogin} className="login-form">
            {/* EMAIL */}

            <div className="field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            {/* PASSWORD */}

            <div className="field">
              <div className="password-row">
                <label htmlFor="password">Password</label>

                <button
                  type="button"
                  className="forgot-button"
                  onClick={() => {
                    // Add forgot-password flow here
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* SUBMIT */}

            <button type="submit" disabled={loading} className="sign-in-button">
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <span className="arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="register-area">
            <span>Don't have an account?</span>

            <button type="button" onClick={() => router.push("/register")}>
              Create one
              <span>→</span>
            </button>
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="footer">
          <span className="status-dot" />
          Secure business workspace
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          min-height: 100%;
          background: #050505;
        }

        body {
          overflow-x: hidden;
        }

        button,
        input {
          font: inherit;
        }

        /* ===================================================
           PAGE
        =================================================== */

        .login-page {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(255,255,255,0.035),
              transparent 35%
            ),
            #050505;
          color: #f5f5f7;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "SF Pro Display",
            "SF Pro Text",
            system-ui,
            sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ===================================================
           AMBIENT LIGHT
        =================================================== */

        .ambient {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(30px);
        }

        .ambient-one {
          top: -500px;
          left: 50%;
          transform: translateX(-50%);
          background:
            radial-gradient(
              circle,
              rgba(255,255,255,0.045),
              transparent 70%
            );
        }

        .ambient-two {
          bottom: -500px;
          right: -300px;
          background:
            radial-gradient(
              circle,
              rgba(56,189,248,0.025),
              transparent 70%
            );
        }

        /* ===================================================
           CONTENT
        =================================================== */

        .login-content {
          position: relative;
          z-index: 2;
          width: min(
            100%,
            460px
          );
          padding: 32px 24px;
        }

        /* ===================================================
           BRAND
        =================================================== */

        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 64px;
        }

        .brand-mark {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #f5f5f7;
          color: #050505;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand-name {
          color: #f5f5f7;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.25px;
        }

        /* ===================================================
           LOGIN SECTION
        =================================================== */

        .login-section {
          width: 100%;
        }

        .heading {
          text-align: center;
          margin-bottom: 36px;
        }

        .heading h1 {
          margin: 0;
          color: #f5f5f7;
          font-size: 42px;
          line-height: 1.05;
          font-weight: 600;
          letter-spacing: -1.8px;
        }

        .heading p {
          margin: 11px 0 0;
          color: #86868b;
          font-size: 15px;
          line-height: 1.5;
          letter-spacing: -0.1px;
        }

        /* ===================================================
           ERROR
        =================================================== */

        .error {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 13px;
          margin-bottom: 18px;
          border-radius: 10px;
          background: rgba(255,59,48,0.07);
          border: 1px solid rgba(255,59,48,0.15);
          color: #ff6961;
          font-size: 12px;
          line-height: 1.5;
        }

        .error-mark {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,59,48,0.14);
          font-size: 10px;
          font-weight: 700;
        }

        /* ===================================================
           FORM
        =================================================== */

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          padding-left: 2px;
          color: #a1a1a6;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.05px;
        }

        .password-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .forgot-button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #86868b;
          font-size: 11px;
          cursor: pointer;
        }

        .forgot-button:hover {
          color: #f5f5f7;
        }

        .field input {
          width: 100%;
          height: 54px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid #38383c;
          background: #171719;
          color: #f5f5f7;
          outline: none;
          font-size: 15px;
          letter-spacing: -0.1px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
        }

        .field input:hover:not(:disabled) {
          border-color: #505055;
        }

        .field input:focus {
          border-color: #8e8e93;
          background: #1a1a1c;
          box-shadow:
            0 0 0 3px rgba(255,255,255,0.055);
        }

        .field input::placeholder {
          color: #636366;
        }

        .field input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ===================================================
           BUTTON
        =================================================== */

        .sign-in-button {
          width: 100%;
          height: 54px;
          margin-top: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 12px;
          background: #f5f5f7;
          color: #050505;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.1px;
          cursor: pointer;
          transition:
            background-color 0.2s ease,
            transform 0.15s ease,
            opacity 0.2s ease;
        }

        .sign-in-button:hover:not(:disabled) {
          background: #ffffff;
          transform: translateY(-1px);
        }

        .sign-in-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .sign-in-button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .arrow {
          font-size: 17px;
          line-height: 1;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.16);
          border-top-color: #050505;
          animation: spin 0.7s linear infinite;
        }

        /* ===================================================
           REGISTER
        =================================================== */

        .register-area {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 28px;
          color: #68686d;
          font-size: 12px;
        }

        .register-area button {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #f5f5f7;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }

        .register-area button:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ===================================================
           FOOTER
        =================================================== */

        .footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 50px;
          color: #48484a;
          font-size: 10px;
          letter-spacing: -0.05px;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #34c759;
        }

        /* ===================================================
           ANIMATION
        =================================================== */

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ===================================================
           TABLET
        =================================================== */

        @media (max-width: 600px) {
          .login-content {
            width: min(
              100%,
              440px
            );
            padding: 28px 20px;
          }

          .brand {
            margin-bottom: 54px;
          }

          .heading h1 {
            font-size: 38px;
          }
        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 420px) {
          .login-page {
            align-items: flex-start;
          }

          .login-content {
            padding: 30px 18px;
          }

          .brand {
            margin-bottom: 50px;
          }

          .heading {
            margin-bottom: 30px;
          }

          .heading h1 {
            font-size: 34px;
          }

          .heading p {
            font-size: 14px;
          }

          .field input,
          .sign-in-button {
            height: 52px;
          }
        }
      `}</style>
    </main>
  );
}
