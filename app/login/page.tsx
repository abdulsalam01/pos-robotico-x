"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button, Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Parfume POS</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Sign in to your workspace</h1>
          <p className="mt-2 text-sm text-slate-400">
            This POS is private. Only admin-created users can access the system.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Email</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
              placeholder="admin@store.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Password</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
              placeholder="********"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-coral-400">{error}</p> : null}
          <Button>{loading ? "Signing in..." : "Sign in"}</Button>
        </form>
      </Card>
    </div>
  );
}
