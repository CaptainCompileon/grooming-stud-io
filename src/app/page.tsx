"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sk } from "@/i18n/sk";
import { getRef, track } from "@/lib/client/analytics";

export default function LandingPage() {
  const [startHref, setStartHref] = useState("/analyze");
  const viewTracked = useRef(false); // dev StrictMode runs mount effects twice

  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      track("landing_view");
    }
    const ref = getRef();
    if (ref) setStartHref(`/analyze?ref=${encodeURIComponent(ref)}`);
  }, []);

  const t = sk.landing;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
        <p className="text-lg leading-relaxed">{t.value}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t.stepsTitle}</h2>
        <ol className="flex flex-col gap-3">
          {t.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
                {i + 1}
              </span>
              <span className="pt-1 leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <p className="rounded-2xl bg-accent-soft p-4 font-medium text-accent-strong">{t.privacyPromise}</p>

      <div className="flex flex-col gap-3">
        <Link
          href={startHref}
          className="flex min-h-12 items-center justify-center rounded-xl bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-strong"
        >
          {t.cta}
        </Link>
        <p className="text-center text-sm text-muted">{t.note}</p>
        <Link
          href="/privacy"
          className="inline-flex min-h-11 items-center self-center text-sm text-accent underline underline-offset-4"
        >
          {sk.common.privacyLink}
        </Link>
      </div>
    </main>
  );
}
