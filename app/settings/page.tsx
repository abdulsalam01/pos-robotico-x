import AppShell from "@/components/AppShell";
import SettingsClient from "@/app/settings/SettingsClient";

export default function SettingsPage() {
  return (
    <AppShell
      title="System Settings"
      description="Configure Supabase, roles, and operational preferences."
    >
      <SettingsClient />
    </AppShell>
  );
}
