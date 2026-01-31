"use client";

import { useMemo, useState } from "react";
import { Button, Card, SectionHeader } from "@/components/ui";
import QuickAddDialog from "@/components/QuickAddDialog";
import { supabase } from "@/lib/supabase";

type TestStatus = "idle" | "pending" | "success" | "error";

const requiredTables = [
  "products",
  "variants",
  "transactions",
  "vendors",
  "customers",
  "discounts",
  "inventory"
];

export default function SettingsClient() {
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  const hasSupabaseEnv = useMemo(() => {
    return Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);

  const handleTestConnection = async () => {
    setTestStatus("pending");
    setTestMessage(null);

    if (!hasSupabaseEnv) {
      setTestStatus("error");
      setTestMessage("Missing Supabase environment variables.");
      return;
    }

    const { error } = await supabase.from("products").select("id", { head: true, count: "exact" });

    if (error) {
      setTestStatus("error");
      setTestMessage(error.message);
      return;
    }

    setTestStatus("success");
    setTestMessage("Connection successful.");
  };

  const handleInviteStaff = async (values: Record<string, string>) => {
    const password = `Temp-${Math.random().toString(36).slice(-10)}!`;
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password,
      options: {
        data: {
          role: values.role
        }
      }
    });

    if (error) {
      setInviteStatus(`Error: ${error.message}`);
      return;
    }

    if (data.user) {
      setInviteStatus(
        `User created: ${data.user.email}. Temporary password: ${password}. Ask the user to reset their password.`
      );
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
      <Card>
        <SectionHeader
          title="Supabase integration"
          subtitle="Connect cloud database with minimal configuration."
          action={
            <Button onClick={handleTestConnection} disabled={testStatus === "pending"}>
              {testStatus === "pending" ? "Testing..." : "Test connection"}
            </Button>
          }
        />
        {testMessage ? (
          <div
            className={`mt-4 rounded-xl border px-4 py-2 text-xs ${
              testStatus === "success"
                ? "border-mint-200 bg-mint-50 text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-200"
                : "border-coral-200 bg-coral-50 text-coral-700 dark:border-coral-500/30 dark:bg-coral-500/10 dark:text-coral-200"
            }`}
          >
            {testMessage}
          </div>
        ) : null}
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Environment</p>
            <p className="mt-2">NEXT_PUBLIC_SUPABASE_URL</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tables required</p>
            <p>{requiredTables.join(", ")}</p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Roles & permissions" subtitle="Manage staff access levels." />
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <p>✅ Cashier: POS only</p>
          <p>✅ Supervisor: inventory & discounts</p>
          <p>✅ Admin: full access</p>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <QuickAddDialog
            title="Invite staff"
            description="Create a staff account with a role"
            triggerLabel="Invite staff"
            submitLabel="Create user"
            fields={[
              { name: "email", label: "Email", placeholder: "Email", required: true },
              {
                name: "role",
                label: "Role",
                type: "select",
                required: true,
                options: [
                  { label: "Cashier", value: "cashier" },
                  { label: "Supervisor", value: "supervisor" },
                  { label: "Admin", value: "admin" }
                ]
              }
            ]}
            onSubmit={handleInviteStaff}
          />
          {inviteStatus ? (
            <p
              className={`text-xs ${
                inviteStatus.toLowerCase().includes("error") ? "text-coral-200" : "text-mint-200"
              }`}
            >
              {inviteStatus}
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
