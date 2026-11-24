"use client";

import { useEffect, useState } from "react";
import { sk } from "@/i18n/sk";

const STAGE_INTERVAL_MS = 6000;

/** Progress copy only (no real progress events): advances every 6 s and holds on the last stage. */
export function LoadingView() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const lastStage = sk.loading.stages.length - 1;
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, lastStage)), STAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flex flex-col items-center gap-5 py-10 text-center">
      <span
        aria-hidden
        className="size-10 animate-spin rounded-full border-4 border-accent-soft border-t-accent motion-reduce:animate-none"
      />
      <h1 className="text-2xl font-semibold">{sk.loading.title}</h1>
      <p role="status" className="min-h-6 font-medium">
        {sk.loading.stages[stage]}
      </p>
      <p className="text-sm text-muted">{sk.loading.note}</p>
    </section>
  );
}
