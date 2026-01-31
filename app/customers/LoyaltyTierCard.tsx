"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import QuickAddDialog from "@/components/QuickAddDialog";
import { supabase } from "@/lib/supabase";

interface LoyaltyTierRow {
  id: string;
  name: string;
  min_points: number | null;
  reward: string | null;
  created_at: string;
}

export default function LoyaltyTierCard() {
  const [tiers, setTiers] = useState<LoyaltyTierRow[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const loadTiers = async () => {
      const { data, error } = await supabase
        .from("loyalty_tiers")
        .select("id,name,min_points,reward,created_at")
        .order("min_points", { ascending: true });
      if (error) {
        setNotice(error.message);
        return;
      }
      setTiers(data ?? []);
    };

    void loadTiers();
  }, []);

  const handleAddTier = async (values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("loyalty_tiers")
      .insert({
        name: values.name,
        min_points: values.min_points ? Number(values.min_points) : null,
        reward: values.reward || null
      })
      .select("id,name,min_points,reward,created_at")
      .single();

    if (error) {
      setNotice(error.message);
      return;
    }

    if (data) {
      setTiers((prev) => [...prev, data].sort((a, b) => (a.min_points ?? 0) - (b.min_points ?? 0)));
      setNotice("Loyalty tier created.");
    }
  };

  const handleUpdateTier = async (tierId: string, values: Record<string, string>) => {
    const { data, error } = await supabase
      .from("loyalty_tiers")
      .update({
        name: values.name,
        min_points: values.min_points ? Number(values.min_points) : null,
        reward: values.reward || null
      })
      .eq("id", tierId)
      .select("id,name,min_points,reward,created_at")
      .single();

    if (error) {
      setNotice(error.message);
      return;
    }

    if (data) {
      setTiers((prev) =>
        prev.map((tier) => (tier.id === tierId ? data : tier)).sort((a, b) => (a.min_points ?? 0) - (b.min_points ?? 0))
      );
      setNotice("Loyalty tier updated.");
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!window.confirm("Delete this tier?")) {
      return;
    }
    const { error } = await supabase.from("loyalty_tiers").delete().eq("id", tierId);
    if (error) {
      setNotice(error.message);
      return;
    }
    setTiers((prev) => prev.filter((tier) => tier.id !== tierId));
    setNotice("Tier deleted.");
  };

  return (
    <Card>
      <SectionHeader
        title="Loyalty insights"
        subtitle="Create tiers to unlock benefits and automated discounts."
        action={
          <QuickAddDialog
            title="Create loyalty tier"
            description="Define points and rewards"
            triggerLabel="Create loyalty tier"
            fields={[
              { name: "name", label: "Tier name", placeholder: "Gold", required: true },
              { name: "min_points", label: "Minimum points", type: "number" },
              { name: "reward", label: "Reward", placeholder: "10% off voucher" }
            ]}
            onSubmit={handleAddTier}
          />
        }
      />
      {notice ? (
        <div className="mt-4 rounded-xl border border-mint-200 bg-mint-50 px-4 py-2 text-xs text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-200">
          {notice}
        </div>
      ) : null}
      <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
        <p>✅ Apply birthday discount automatically.</p>
        <p>✅ Track preferred fragrance notes.</p>
        <p>✅ Optional consent for promotions.</p>
      </div>
      <div className="mt-4 space-y-3">
        {tiers.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            No loyalty tiers created yet.
          </div>
        ) : (
          tiers.map((tier) => (
            <div
              key={tier.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{tier.name}</p>
                <p className="text-xs text-slate-400">
                  {tier.min_points ? `${tier.min_points} points` : "No minimum"} · {tier.reward ?? "Reward pending"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge label="Active" tone="success" />
                <QuickAddDialog
                  title="Edit tier"
                  description="Update loyalty tier"
                  triggerLabel="Edit"
                  submitLabel="Save"
                  initialValues={{
                    name: tier.name,
                    min_points: tier.min_points ? String(tier.min_points) : "",
                    reward: tier.reward ?? ""
                  }}
                  fields={[
                    { name: "name", label: "Tier name", placeholder: "Gold", required: true },
                    { name: "min_points", label: "Minimum points", type: "number" },
                    { name: "reward", label: "Reward", placeholder: "10% off voucher" }
                  ]}
                  onSubmit={(values) => handleUpdateTier(tier.id, values)}
                />
                <Button variant="ghost" onClick={() => handleDeleteTier(tier.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
