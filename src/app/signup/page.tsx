"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-8">
        <h1 className="mb-6 text-xl font-semibold text-neutral-100">
          Create your account
        </h1>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-indigo-500"
            />
          </div>
          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
