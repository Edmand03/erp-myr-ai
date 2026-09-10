import { RegisterForm } from "@/components/features/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-900">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create Your Contractor Enterprise Workspace
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Setup multi-tenant isolated accounting and service tracking fields
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-xs text-zinc-500">
          Already have an operational workspace?{" "}
          <Link
            href="/login"
            className="font-semibold text-zinc-950 hover:underline"
          >
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
