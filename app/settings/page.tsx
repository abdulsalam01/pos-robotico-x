import AppShell from "@/components/AppShell";
import { Button, Card, SectionHeader } from "@/components/ui";

export default function SettingsPage() {
  return (
    <AppShell
      title="System Settings"
      description="Configure Supabase, roles, and operational preferences."
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <Card>
          <SectionHeader
            title="Supabase integration"
            subtitle="Connect cloud database with minimal configuration."
            action={<Button>Test connection</Button>}
          />
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Environment</p>
              <p className="mt-2">NEXT_PUBLIC_SUPABASE_URL</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tables required</p>
              <p>products, variants, transactions, vendors, customers, discounts, inventory</p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Roles & permissions"
            subtitle="Manage staff access levels."
          />
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>✅ Cashier: POS only</p>
            <p>✅ Supervisor: inventory & discounts</p>
            <p>✅ Admin: full access</p>
          </div>
          <Button variant="secondary">Invite staff</Button>
        </Card>
      </div>
    </AppShell>
  );
}
