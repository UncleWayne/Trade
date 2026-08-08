"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center font-serif text-lg text-fg">Trading Journal</div>
        <div className="rounded-md border border-hairline bg-surface p-8">
          <h1 className="mb-6 font-serif text-xl text-fg">Create your account</h1>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] tracking-wide text-fg-muted uppercase">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border border-hairline bg-bg px-3 py-2 text-fg outline-none focus:border-silver-lo"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] tracking-wide text-fg-muted uppercase">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-md border border-hairline bg-bg px-3 py-2 text-fg outline-none focus:border-silver-lo"
              />
            </div>
            {state.error && (
              <p className="text-sm text-garnet">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-gradient-to-br from-silver-hi to-silver-lo px-3 py-2 font-semibold text-on-silver hover:brightness-105 disabled:opacity-50"
            >
              {pending ? "Creating account..." : "Sign up"}
            </button>
          </form>
          <p className="mt-4 text-sm text-fg-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-fg underline decoration-hairline decoration-1 underline-offset-2 hover:decoration-silver-lo">
              Log in
            </Link>
          </p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
