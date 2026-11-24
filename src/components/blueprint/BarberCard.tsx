"use client";

import { toPng } from "html-to-image";
import { useEffect, useId, useRef, useState } from "react";
import { sk } from "@/i18n/sk";
import { cheatSheetToText, formatLength, mmToGuard } from "@/lib/blueprint/format";
import type { BarberCheatSheet } from "@/lib/blueprint/types";
import { track } from "@/lib/client/analytics";

const IMAGE_FILE_NAME = "grooming-studio-barber.png";
const COPIED_RESET_MS = 2500;

type Props = {
  card: BarberCheatSheet;
  /** Shown when the face shape was read with low confidence. */
  lowConfidenceNote?: string;
};

export function BarberCard({ card, lowConfidenceNote }: Props) {
  const b = sk.cards.barber;
  const headingId = useId();
  // Only this block becomes the PNG: the barber-facing content, without notes, "why" and buttons.
  const exportRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">("idle");

  useEffect(() => {
    if (copyStatus !== "copied") return;
    const timer = setTimeout(() => setCopyStatus("idle"), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cheatSheetToText(card, sk));
    } catch {
      setCopyStatus("error"); // no clipboard API, insecure context or permission denied
      return;
    }
    setCopyStatus("copied");
    track("cheatsheet_copy");
  }

  async function handleSave() {
    const node = exportRef.current;
    if (!node || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      // Rendered entirely on the client; the image is never uploaded.
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const file = dataUrlToFile(dataUrl, IMAGE_FILE_NAME);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: b.title });
      } else {
        downloadDataUrl(dataUrl, IMAGE_FILE_NAME);
      }
    } catch (err) {
      // Closing the share sheet is a cancel, not a failure.
      setSaveStatus(err instanceof DOMException && err.name === "AbortError" ? "idle" : "error");
      return;
    }
    setSaveStatus("idle");
    track("cheatsheet_save_image");
  }

  const lengths = [
    [b.lengths.top, card.top_length_mm],
    [b.lengths.sides, card.sides_length_mm],
    [b.lengths.back, card.back_length_mm],
  ] as const;

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-2xl border border-line bg-surface break-words"
    >
      <div ref={exportRef} className="flex flex-col gap-5 bg-surface p-5">
        <header className="flex flex-col gap-0.5">
          <p className="text-xs font-semibold tracking-wide text-accent uppercase">{b.subtitle}</p>
          <h2 id={headingId} className="text-lg font-semibold">
            {b.title}
          </h2>
        </header>

        <div className="flex flex-col gap-1">
          <h3 className="text-xl leading-tight font-semibold">{card.cut_name}</h3>
          <p className="text-muted">{card.cut_name_local}</p>
        </div>

        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">{b.lengthsLabel}</caption>
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th scope="col" className="py-1.5 font-medium">
                {b.lengthColumns.part}
              </th>
              <th scope="col" className="py-1.5 font-medium">
                {b.lengthColumns.length}
              </th>
              <th scope="col" className="py-1.5 font-medium">
                {b.lengthColumns.guard}
              </th>
            </tr>
          </thead>
          <tbody>
            {lengths.map(([label, mm]) => (
              <tr key={label} className="border-b border-line last:border-0">
                <th scope="row" className="py-2 font-medium">
                  {label}
                </th>
                <td className="py-2 text-lg font-semibold tabular-nums">{mm} mm</td>
                <td className="py-2 tabular-nums">{mmToGuard(mm) ?? b.scissors}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="grid gap-3">
          <Detail label={b.transitionLabel} value={b.transitions[card.transition]} />
          <Detail label={b.necklineLabel} value={b.necklines[card.neckline]} />
          <Detail label={b.textureLabel} value={card.texture_finish} />
        </dl>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{b.instructionsLabel}</h3>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 leading-snug marker:font-semibold marker:text-accent">
            {card.instructions_for_barber.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">{b.stylingLabel}</h3>
          <p className="font-medium">{b.products[card.styling_product.type]}</p>
          <p className="leading-snug text-muted">{card.styling_product.how_to_apply}</p>
        </div>

        {card.beard && (
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">{b.beardLabel}</h3>
            <p className="font-medium">
              {card.beard.style}, {formatLength(card.beard.length_mm, sk)}
            </p>
            <p className="leading-snug text-muted">{card.beard.note}</p>
          </div>
        )}

      </div>

      <div className="flex flex-col gap-5 px-5 pb-5">
        {lowConfidenceNote && (
          <p className="rounded-lg bg-canvas px-3 py-2 text-sm text-muted">
            {lowConfidenceNote}
          </p>
        )}

        <details className="rounded-lg border border-line">
          <summary className="flex min-h-11 cursor-pointer items-center px-3 font-medium text-accent">
            {b.whyToggle}
          </summary>
          <p className="px-3 pb-3 leading-snug">{card.why}</p>
        </details>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-11 rounded-xl bg-accent px-3 font-semibold text-on-accent transition-colors hover:bg-accent-strong"
            >
              {copyStatus === "copied" ? b.copied : b.copy}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="min-h-11 rounded-xl border border-accent px-3 font-semibold text-accent disabled:opacity-60"
            >
              {saveStatus === "saving" ? b.saving : b.saveImage}
            </button>
          </div>
          <div aria-live="polite" className="flex flex-col gap-1 text-sm text-danger empty:hidden">
            {copyStatus === "error" && <p>{b.copyError}</p>}
            {saveStatus === "error" && <p>{b.saveError}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function dataUrlToFile(dataUrl: string, name: string): File {
  const [header, base64] = dataUrl.split(",", 2);
  const type = /^data:([^;]+)/.exec(header)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type });
}

function downloadDataUrl(dataUrl: string, name: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = name;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}
