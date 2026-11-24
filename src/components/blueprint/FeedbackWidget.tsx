"use client";

import { type FormEvent, useId, useState } from "react";
import { sk } from "@/i18n/sk";
import { getRef, track } from "@/lib/client/analytics";

type Vote = "up" | "down";

const MAX_COMMENT = 1000; // same limit as /api/feedback

export function FeedbackWidget() {
  const t = sk.feedback;
  const id = useId();
  const [vote, setVote] = useState<Vote | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function handleVote(value: Vote) {
    if (vote) return;
    setVote(value);
    track("feedback_submitted", { value });
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!vote || status === "sending") return;
    setStatus("sending");
    const text = comment.trim();
    const ref = getRef();
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: vote, ...(text ? { text } : {}), ...(ref ? { ref } : {}) }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <section role="status" className="flex flex-col gap-1 rounded-2xl bg-accent-soft p-5 text-accent-strong">
        <p className="font-semibold">{t.thanks}</p>
        <p>{t.followUp}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${id}-q`} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <h2 id={`${id}-q`} className="text-lg font-semibold">
        {t.question}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <VoteButton label={t.yes} emoji="👍" selected={vote === "up"} disabled={vote !== null} onClick={() => handleVote("up")} />
        <VoteButton label={t.no} emoji="👎" selected={vote === "down"} disabled={vote !== null} onClick={() => handleVote("down")} />
      </div>

      {vote && (
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <label htmlFor={`${id}-comment`} className="font-medium">
            {t.commentLabel}
          </label>
          <textarea
            id={`${id}-comment`}
            value={comment}
            maxLength={MAX_COMMENT}
            rows={3}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          {status === "error" && (
            <p role="alert" className="text-sm text-danger">
              {t.error}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="min-h-11 rounded-xl bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {t.send}
          </button>
        </form>
      )}
    </section>
  );
}

function VoteButton({
  label,
  emoji,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  emoji: string;
  selected: boolean;
  disabled: boolean;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line px-3 font-medium transition-colors aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent disabled:cursor-default disabled:not-aria-pressed:opacity-50"
    >
      <span aria-hidden>{emoji}</span>
      {label}
    </button>
  );
}
