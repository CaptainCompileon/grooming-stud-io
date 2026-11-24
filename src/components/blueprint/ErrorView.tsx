import type { Dispatch } from "react";
import type { ErrorKind, FlowAction } from "@/app/analyze/flow";
import { sk } from "@/i18n/sk";

const MESSAGES: Record<ErrorKind, string> = {
  invalid_request: sk.errors.invalidPhotos,
  analysis_failed: sk.errors.analysisFailed,
  network: sk.errors.network,
};

type Props = {
  kind: ErrorKind;
  dispatch: Dispatch<FlowAction>;
};

export function ErrorView({ kind, dispatch }: Props) {
  // A rejected payload (400/413) would fail the same way again: send the user
  // back to the filled form to change photos instead of resending it.
  const primary =
    kind === "invalid_request"
      ? { label: sk.common.backToForm, action: { type: "BACK_TO_FORM" } as const }
      : { label: sk.common.retry, action: { type: "RETRY" } as const };

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{sk.errors.title}</h1>
      <p role="alert" className="leading-snug">
        {MESSAGES[kind]}
      </p>
      <button
        type="button"
        onClick={() => dispatch(primary.action)}
        className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-strong"
      >
        {primary.label}
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: "RESTART" })}
        className="min-h-11 rounded-xl px-5 text-muted hover:text-ink"
      >
        {sk.common.restart}
      </button>
    </section>
  );
}
