"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ErrorBanner } from "@/components/ui/badges";
import { DEFAULT_SEED_PASSWORD } from "@/lib/auth/config";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      const from = searchParams.get("from") || "/tickets";
      router.push(from);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="app-page-title">Sign in</h1>
        <p className="mt-2 app-muted">Support Ticket Management System</p>
      </div>

      <form onSubmit={handleSubmit} className="app-card space-y-5">
        {error && <ErrorBanner message={error} />}

        <div>
          <label htmlFor="email" className="app-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="app-input"
            placeholder="alice.admin@support.local"
          />
        </div>

        <div>
          <label htmlFor="password" className="app-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="app-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="app-btn-primary w-full"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="app-meta text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="app-link">
            Sign up
          </Link>
        </p>

        <p className="app-meta text-center">
          Demo accounts use password{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5">
            {DEFAULT_SEED_PASSWORD}
          </code>
        </p>
      </form>
    </div>
  );
}
