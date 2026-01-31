import AppShell from "@/components/AppShell";
import ReportsClient from "@/app/reports/ReportsClient";

export default async function ReportsPage() {
  return (
    <AppShell
      title="Reports & PDF Export"
      description="Generate financial, inventory, and customer reports in seconds."
    >
      <ReportsClient />
    </AppShell>
  );
}
