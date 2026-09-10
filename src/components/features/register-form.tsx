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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterValues) => {
    setIsPending(true);
    setErrorMsg(null);

    const result = await registerTenantAction(values);

    if (result?.error) {
      setErrorMsg(result.error);
      setIsPending(false);
    } else {
      // Successfully provisioned, push them right into the login page to initialize context
      router.push("/login?registered=true");
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">
            Full Name
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Tan Ah Kow"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-900"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">
            Work Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="management@company.com.my"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-900"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700">Password</label>
        <input
          {...register("password")}
          type="password"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-900"
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <hr className="border-zinc-200 my-2" />

      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700">
          Company Name (Sdn Bhd / Enterprise)
        </label>
        <input
          {...register("companyName")}
          type="text"
          placeholder="Mega Electrical Engineering"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-900"
        />
        {errors.companyName && (
          <p className="text-xs text-red-500">{errors.companyName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700">
          SSM Registration Number
        </label>
        <input
          {...register("companyRegNo")}
          type="text"
          placeholder="2026010XXXXX"
          className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:ring-1 focus:ring-zinc-900"
        />
        {errors.companyRegNo && (
          <p className="text-xs text-red-500">{errors.companyRegNo.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-zinc-950 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors mt-2"
      >
        {isPending ? "Provisioning Workspace..." : "Register Company Workspace"}
      </button>
    </form>
  );
}
