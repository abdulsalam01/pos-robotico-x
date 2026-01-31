"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import type { DiscountRow } from "@/lib/data";

interface DiscountSimulationProps {
  discounts: DiscountRow[];
}

const formatIdr = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export default function DiscountSimulation({ discounts }: DiscountSimulationProps) {
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>(discounts[0]?.id ?? "");
  const [subtotalInput, setSubtotalInput] = useState("250000");
  const [result, setResult] = useState<{ discount: number; total: number } | null>(null);

  const selectedDiscount = useMemo(
    () => discounts.find((discount) => discount.id === selectedDiscountId),
    [discounts, selectedDiscountId]
  );

  const handleRun = () => {
    const subtotal = Number(subtotalInput || 0);
    const baseValue = Number(selectedDiscount?.value ?? 0);
    const discountAmount =
      selectedDiscount?.type === "percentage" ? subtotal * (baseValue / 100) : baseValue;
    const total = Math.max(subtotal - discountAmount, 0);
    setResult({ discount: Math.round(discountAmount), total: Math.round(total) });
  };

  return (
    <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200">
        Discount campaign
        <select
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
          value={selectedDiscountId}
          onChange={(event) => setSelectedDiscountId(event.target.value)}
        >
          <option value="">Choose discount</option>
          {discounts.map((discount) => (
            <option key={discount.id} value={discount.id}>
              {discount.name} ({discount.type === "percentage" ? `${discount.value}%` : `Rp ${discount.value}`})
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-200">
        Cart subtotal
        <input
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
          inputMode="numeric"
          value={subtotalInput}
          onChange={(event) => setSubtotalInput(event.target.value.replace(/[^\d]/g, ""))}
        />
      </label>
      <Button variant="secondary" onClick={handleRun} disabled={!selectedDiscountId}>
        Run simulation
      </Button>
      {result ? (
        <div className="rounded-xl border border-mint-200 bg-mint-50 p-4 text-xs text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-200">
          Discount applied: Rp {formatIdr(result.discount)} → Final total: Rp {formatIdr(result.total)}.
        </div>
      ) : null}
    </div>
  );
}
