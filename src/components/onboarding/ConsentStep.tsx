"use client";

import Link from "next/link";
import { useState } from "react";
import { sk } from "@/i18n/sk";

export function ConsentStep({ onConfirm }: { onConfirm: () => void }) {
  const [checked, setChecked] = useState(false);
  const t = sk.consent;

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">{t.title}</h1>
      <ul className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
        {t.points.map((point) => (
          <li key={point} className="flex gap-3 leading-snug">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/privacy"
        className="inline-flex min-h-11 items-center self-start text-sm text-accent underline underline-offset-4"
      >
        {sk.common.privacyLink}
      </Link>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 font-medium">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="size-5 shrink-0 accent-accent"
        />
        {t.checkbox}
      </label>
      <button
        type="button"
        disabled={!checked}
        onClick={onConfirm}
        className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t.confirm}
      </button>
    </section>
  );
}
