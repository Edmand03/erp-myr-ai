"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";

const authClient = createAuthClient();

const loginSchema = z.object({
  email: z.string().email("Please provide a valid company email address"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 structural characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    setIsPending(true);
    setErrorMsg(null);

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setErrorMsg(error.message || "Invalid authentication credentials.");
      setIsPending(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg bg-white p-6 shadow-sm border border-zinc-200"
    >
      {errorMsg && (
        <div className="rounded bg-red-50 p-2 text-xs font-medium text-red-600 border border-red-100">
          {errorMsg}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700">
          Work Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="name@company.com.my"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700">Password</label>
        <input
          {...register("password")}
          type="password"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-zinc-950 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors"
      >
        {isPending ? "Verifying Context..." : "Sign In to Workspace"}
      </button>
    </form>
  );
}
