"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { registerTenantAction } from "@/app/actions/register";

const registerSchema = z.object({
  name: z.string().min(2, "Full name is required"),

  email: z.string().email("Please provide a valid company email"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  companyName: z.string().min(2, "Company name is required"),

  companyRegNo: z
    .string()
    .min(
      1,
      "SSM Registration Number is required for Malaysia operating environments",
    ),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterValues) => {
    if (loading) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const result = await registerTenantAction(values);

      if (result?.error) {
        setErrorMsg(result.error);
        return;
      }

      router.push("/login?registered=true");
    } catch (error) {
      console.error("REGISTRATION ERROR:", error);

      setErrorMsg(
        "Something went wrong while creating your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="register-content">
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="brand">
          <div className="brand-mark">S</div>

          <span className="brand-name">SaaS ERP</span>
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="heading">
          <h1>Create an account</h1>

          <p>Set up your business workspace.</p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMsg && (
          <div className="error" role="alert">
            <span className="error-mark">!</span>

            <span>{errorMsg}</span>
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          {/* =================================================
              ACCOUNT DETAILS
          ================================================= */}

          <div className="section-label">ACCOUNT</div>

          <div className="account-fields">
            {/* NAME */}

            <div className="field">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                {...register("name")}
                type="text"
                autoComplete="name"
                placeholder="Tan Ah Kow"
                disabled={loading}
                className={errors.name ? "has-error" : ""}
              />

              {errors.name && (
                <span className="field-error">{errors.name.message}</span>
              )}
            </div>

            {/* EMAIL */}

            <div className="field">
              <label htmlFor="email">Work Email</label>

              <input
                id="email"
                {...register("email")}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@company.com"
                disabled={loading}
                className={errors.email ? "has-error" : ""}
              />

              {errors.email && (
                <span className="field-error">{errors.email.message}</span>
              )}
            </div>
          </div>

          {/* PASSWORD */}

          <div className="field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              {...register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              disabled={loading}
              className={errors.password ? "has-error" : ""}
            />

            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          {/* =================================================
              COMPANY
          ================================================= */}

          <div className="divider" />

          <div className="section-label">BUSINESS</div>

          {/* COMPANY NAME */}

          <div className="field">
            <label htmlFor="companyName">Company Name</label>

            <input
              id="companyName"
              {...register("companyName")}
              type="text"
              autoComplete="organization"
              placeholder="Mega Electrical Engineering"
              disabled={loading}
              className={errors.companyName ? "has-error" : ""}
            />

            {errors.companyName && (
              <span className="field-error">{errors.companyName.message}</span>
            )}
          </div>

          {/* SSM */}

          <div className="field">
            <label htmlFor="companyRegNo">SSM Registration Number</label>

            <input
              id="companyRegNo"
              {...register("companyRegNo")}
              type="text"
              placeholder="2026010XXXXX"
              disabled={loading}
              className={errors.companyRegNo ? "has-error" : ""}
            />

            {errors.companyRegNo && (
              <span className="field-error">{errors.companyRegNo.message}</span>
            )}
          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button type="submit" disabled={loading} className="create-button">
            {loading ? (
              <>
                <span className="spinner" />
                Creating account
              </>
            ) : (
              <>
                Create account
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </form>

        {/* =================================================
            LOGIN
        ================================================= */}

        <div className="login-area">
          <span>Already have an account?</span>

          <button type="button" onClick={() => router.push("/login")}>
            Sign in
            <span>→</span>
          </button>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

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

        input,
        button {
          font: inherit;
        }

        /* ===================================================
           PAGE
        =================================================== */

        .register-page {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(255, 255, 255, 0.032),
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
           BACKGROUND
        =================================================== */

        .ambient {
          position: fixed;
          width: 650px;
          height: 650px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(30px);
        }

        .ambient-one {
          top: -550px;
          left: 50%;
          transform: translateX(-50%);
          background:
            radial-gradient(
              circle,
              rgba(255, 255, 255, 0.04),
              transparent 70%
            );
        }

        .ambient-two {
          bottom: -500px;
          right: -350px;
          background:
            radial-gradient(
              circle,
              rgba(56, 189, 248, 0.018),
              transparent 70%
            );
        }

        /* ===================================================
           CONTENT
        =================================================== */

        .register-content {
          position: relative;
          z-index: 2;
          width: min(100%, 560px);
        }

        /* ===================================================
           BRAND
        =================================================== */

        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 56px;
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
           HEADER
        =================================================== */

        .heading {
          text-align: center;
          margin-bottom: 34px;
        }

        .heading h1 {
          margin: 0;
          color: #f5f5f7;
          font-size: 40px;
          line-height: 1.05;
          font-weight: 600;
          letter-spacing: -1.7px;
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
          background: rgba(255, 59, 48, 0.07);
          border: 1px solid rgba(255, 59, 48, 0.15);
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
          background: rgba(255, 59, 48, 0.14);
          font-size: 10px;
          font-weight: 700;
        }

        /* ===================================================
           FORM
        =================================================== */

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .section-label {
          margin-top: 4px;
          margin-bottom: -2px;
          padding-left: 2px;
          color: #68686d;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.4px;
        }

        .account-fields {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }

        .field label {
          padding-left: 2px;
          color: #a1a1a6;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.05px;
        }

        .field input {
          width: 100%;
          height: 54px;
          padding: 0 15px;
          border-radius: 12px;
          border: 1px solid #38383c;
          background: #171719;
          color: #f5f5f7;
          outline: none;
          font-size: 14px;
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
            0 0 0 3px rgba(255, 255, 255, 0.05);
        }

        .field input::placeholder {
          color: #636366;
        }

        .field input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .field input.has-error {
          border-color: rgba(255, 59, 48, 0.6);
        }

        .field-error {
          padding-left: 2px;
          color: #ff6961;
          font-size: 11px;
          line-height: 1.4;
        }

        /* ===================================================
           DIVIDER
        =================================================== */

        .divider {
          width: 100%;
          height: 1px;
          margin: 7px 0 2px;
          background: #2c2c2f;
        }

        /* ===================================================
           BUTTON
        =================================================== */

        .create-button {
          width: 100%;
          height: 54px;
          margin-top: 7px;
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

        .create-button:hover:not(:disabled) {
          background: #ffffff;
          transform: translateY(-1px);
        }

        .create-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .create-button:disabled {
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
          border: 2px solid rgba(0, 0, 0, 0.14);
          border-top-color: #050505;
          animation: spin 0.7s linear infinite;
        }

        /* ===================================================
           LOGIN
        =================================================== */

        .login-area {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 26px;
          color: #68686d;
          font-size: 12px;
        }

        .login-area button {
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

        .login-area button:hover {
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
          margin-top: 42px;
          color: #48484a;
          font-size: 10px;
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

        @media (max-width: 700px) {
          .register-page {
            padding: 36px 20px;
            align-items: flex-start;
          }

          .register-content {
            width: 100%;
            max-width: 520px;
          }

          .brand {
            margin-bottom: 48px;
          }

          .heading h1 {
            font-size: 36px;
          }
        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 520px) {
          .register-page {
            padding: 28px 18px;
          }

          .heading {
            margin-bottom: 29px;
          }

          .heading h1 {
            font-size: 33px;
          }

          .heading p {
            font-size: 14px;
          }

          .account-fields {
            grid-template-columns: 1fr;
            gap: 17px;
          }

          .field input,
          .create-button {
            height: 52px;
          }

          .footer {
            margin-top: 36px;
          }
        }

        /* ===================================================
           SMALL PHONES
        =================================================== */

        @media (max-width: 380px) {
          .register-page {
            padding: 24px 15px;
          }

          .brand {
            margin-bottom: 42px;
          }

          .heading h1 {
            font-size: 30px;
          }

          .heading p {
            font-size: 13px;
          }

          .field input,
          .create-button {
            height: 50px;
          }

          .login-area {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </main>
  );
}
