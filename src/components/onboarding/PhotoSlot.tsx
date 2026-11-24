"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { sk } from "@/i18n/sk";
import type { PhotoKey } from "@/lib/blueprint/types";
import { prepareImage } from "@/lib/client/image";

type Props = {
  photoKey: PhotoKey;
  value: string | null;
  onChange(data: string | null): void;
  prepare?: (file: File) => Promise<string>;
};

type Status = "idle" | "processing" | "error";

export function PhotoSlot({ photoKey, value, onChange, prepare = prepareImage }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  // Only the latest selected file may update the slot (user can re-pick while processing).
  const latestPick = useRef(0);
  const t = sk.photo.slots[photoKey];
  const actionLabel = value ? sk.photo.replace : sk.photo.add;

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;

    const pick = ++latestPick.current;
    setStatus("processing");
    try {
      const data = await prepare(file);
      if (pick !== latestPick.current) return;
      setStatus("idle");
      onChange(data);
    } catch {
      if (pick !== latestPick.current) return;
      setStatus("error");
    }
  }

  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex gap-4">
        <div className="flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-canvas">
          {value ? (
            <img
              src={`data:image/jpeg;base64,${value}`}
              alt={t.title}
              className="size-full object-cover"
            />
          ) : (
            <ExampleIllustration photoKey={photoKey} />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="font-semibold">{t.title}</h3>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-sm leading-snug">
            {t.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <p className="text-xs text-muted">{t.example}</p>
        </div>
      </div>

      <p aria-live="polite" className="empty:hidden mt-3 text-sm">
        {status === "processing" && <span className="text-muted">{sk.photo.processing}</span>}
        {status === "error" && (
          <span role="alert" className="block rounded-lg bg-danger-soft px-3 py-2 text-danger">
            {sk.photo.decodeError}
          </span>
        )}
      </p>

      <div className="mt-3 flex gap-2">
        <label className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-accent px-4 text-center font-medium text-accent focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2">
          <input
            type="file"
            accept="image/*"
            aria-label={`${t.title} – ${actionLabel}`}
            onChange={handleFile}
            className="sr-only"
          />
          {actionLabel}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="min-h-11 rounded-xl px-4 text-muted hover:text-ink"
          >
            {sk.photo.remove}
          </button>
        )}
      </div>
    </article>
  );
}

// Simple outline sketches of the expected framing for each photo.
function ExampleIllustration({ photoKey }: { photoKey: PhotoKey }) {
  const common = {
    viewBox: "0 0 60 80",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4/5 text-muted",
    "aria-hidden": true,
  };
  if (photoKey === "front") {
    return (
      <svg {...common}>
        <ellipse cx="30" cy="32" rx="13" ry="16" />
        <path d="M6 78c2-14 11-20 24-20s22 6 24 20" />
      </svg>
    );
  }
  if (photoKey === "profile") {
    return (
      <svg {...common}>
        <path d="M24 16c10-3 20 4 20 14l4 6-4 2c0 6-2 10-8 10h-4v8" />
        <path d="M24 16c-6 2-9 8-9 14 0 7 3 12 9 15v11" />
        <path d="M10 78c2-10 8-16 18-18" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="30" cy="10" r="6" />
      <path d="M20 20h20l3 24M20 20l-3 24M23 20v26l-1 30M37 20v26l1 30M30 46v30" />
    </svg>
  );
}
