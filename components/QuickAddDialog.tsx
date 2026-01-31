"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";

export type QuickAddField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "date" | "select" | "currency";
  options?: { label: string; value: string }[];
  required?: boolean;
};

interface QuickAddDialogProps {
  title: string;
  description?: string;
  triggerLabel: string;
  submitLabel?: string;
  fields: QuickAddField[];
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

export default function QuickAddDialog({
  title,
  description,
  triggerLabel,
  submitLabel,
  fields,
  initialValues,
  onSubmit
}: QuickAddDialogProps) {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );

  const formatIdr = (value: string) => {
    if (!value) {
      return "";
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return "";
    }
    return new Intl.NumberFormat("id-ID").format(numericValue);
  };

  const parseIdr = (value: string) => value.replace(/[^\d]/g, "");

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  const handleOpen = () => {
    const seeded = fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: initialValues?.[field.name] ?? ""
      }),
      {}
    );
    setValues(seeded);
    setOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit(values);
      setValues(fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}));
      setOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen}>{translate(locale, triggerLabel)}</Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {translate(locale, title)}
                </h3>
                {description ? (
                  <p className="mt-1 text-sm text-slate-400">{translate(locale, description)}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-sm font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                {translate(locale, "Cancel")}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {fields.map((field) => (
                <label key={field.name} className="block text-xs font-semibold text-slate-600 dark:text-slate-200">
                  {translate(locale, field.label)}
                  {field.type === "select" ? (
                    <select
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                      value={values[field.name]}
                      onChange={(event) => handleChange(field.name, event.target.value)}
                      required={field.required}
                    >
                      <option value="">--</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {translate(locale, option.label)}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "currency" ? (
                    <input
                      inputMode="numeric"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder={field.placeholder ? translate(locale, field.placeholder) : undefined}
                      value={formatIdr(values[field.name])}
                      onChange={(event) => handleChange(field.name, parseIdr(event.target.value))}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type ?? "text"}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder={field.placeholder ? translate(locale, field.placeholder) : undefined}
                      value={values[field.name]}
                      onChange={(event) => handleChange(field.name, event.target.value)}
                      required={field.required}
                    />
                  )}
                </label>
              ))}
              {error ? (
                <p className="text-xs text-coral-600 dark:text-coral-300">{error}</p>
              ) : null}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  {translate(locale, "Cancel")}
                </Button>
                <Button type="submit" disabled={busy}>
                  {translate(locale, submitLabel ?? "Save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
