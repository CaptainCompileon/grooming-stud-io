"use client";

import { type Dispatch, type FormEvent, useEffect, useReducer, useRef } from "react";
import { ConsentStep } from "@/components/onboarding/ConsentStep";
import { InputsForm } from "@/components/onboarding/InputsForm";
import { PhotoSlot } from "@/components/onboarding/PhotoSlot";
import { sk } from "@/i18n/sk";
import type { BlueprintResponse } from "@/lib/blueprint/types";
import { track } from "@/lib/client/analytics";
import {
  type Draft,
  type FlowAction,
  PHOTO_KEYS,
  flowReducer,
  hasAllPhotos,
  initialFlowState,
  isDraftComplete,
  toRequest,
} from "./flow";

// Slightly above the server's maxDuration (60 s) so a server-side timeout
// arrives as a 5xx response rather than a client abort.
const REQUEST_TIMEOUT_MS = 70_000;

type FailureReason = "network" | "invalid_request" | "analysis_failed";

const FAILURE_MESSAGES: Record<FailureReason, string> = {
  network: sk.errors.network,
  invalid_request: sk.errors.invalidPhotos,
  analysis_failed: sk.errors.analysisFailed,
};

type AnalyzeOutcome =
  | { ok: true; response: BlueprintResponse }
  | { ok: false; reason: FailureReason };

async function postAnalyze(body: string): Promise<AnalyzeOutcome> {
  let res: Response;
  try {
    res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    return { ok: false, reason: "network" }; // offline, DNS, or client timeout
  }

  if (res.status === 400 || res.status === 413) return { ok: false, reason: "invalid_request" };
  if (!res.ok) return { ok: false, reason: "analysis_failed" };

  try {
    const data: unknown = await res.json();
    if (isBlueprintResponse(data)) return { ok: true, response: data };
    return { ok: false, reason: "analysis_failed" };
  } catch (err) {
    // SyntaxError = malformed body; anything else = connection dropped / timed out mid-body.
    return { ok: false, reason: err instanceof SyntaxError ? "analysis_failed" : "network" };
  }
}

function isBlueprintResponse(value: unknown): value is BlueprintResponse {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Partial<BlueprintResponse>;
  if (r.status === "ok") return typeof r.blueprint === "object" && r.blueprint !== null;
  if (r.status === "photo_issue") return Array.isArray(r.photo_issues);
  return false;
}

export default function AnalyzePage() {
  const [state, dispatch] = useReducer(flowReducer, initialFlowState);

  // One request per entry into `loading`. RETRY re-enters with the same draft
  // object, so the effect re-runs and resends the identical payload.
  const loadingDraft = state.step === "loading" ? state.draft : null;
  useEffect(() => {
    if (!loadingDraft) return;
    let active = true;
    postAnalyze(JSON.stringify(toRequest(loadingDraft))).then((outcome) => {
      if (!active) return;
      if (outcome.ok) {
        if (outcome.response.status === "photo_issue") {
          track("blueprint_error", { reason: "photo_issue" });
        }
        dispatch({ type: "SUCCEEDED", response: outcome.response });
      } else {
        track("blueprint_error", { reason: outcome.reason });
        dispatch({ type: "FAILED", message: FAILURE_MESSAGES[outcome.reason] });
      }
    });
    return () => {
      active = false;
    };
  }, [loadingDraft]);

  const photosCompletedTracked = useRef(false);
  const allPhotosSet = state.step === "form" && hasAllPhotos(state.draft);
  useEffect(() => {
    if (allPhotosSet && !photosCompletedTracked.current) {
      photosCompletedTracked.current = true;
      track("photos_completed");
    }
  }, [allPhotosSet]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8">
      {state.step === "consent" && (
        <ConsentStep
          onConfirm={() => {
            track("consent_given");
            dispatch({ type: "CONSENT" });
          }}
        />
      )}
      {state.step === "form" && <FormStep draft={state.draft} dispatch={dispatch} />}
      {/* Task 9 replaces the placeholders below with LoadingView, BlueprintView / PhotoIssueView and ErrorView. */}
      {state.step === "loading" && <LoadingPlaceholder />}
      {state.step === "result" && <ResultPlaceholder response={state.response} dispatch={dispatch} />}
      {state.step === "error" && <ErrorPlaceholder message={state.message} dispatch={dispatch} />}
    </main>
  );
}

function FormStep({ draft, dispatch }: { draft: Draft; dispatch: Dispatch<FlowAction> }) {
  const complete = isDraftComplete(draft);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!complete) return;
    track("submit");
    dispatch({ type: "SUBMIT" });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{sk.form.title}</h1>
        <p className="text-muted">{sk.form.intro}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{sk.photo.sectionTitle}</h2>
        {PHOTO_KEYS.map((key) => (
          <PhotoSlot
            key={key}
            photoKey={key}
            value={draft.photos[key]}
            onChange={(data) => dispatch({ type: "SET_PHOTO", key, data })}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{sk.inputs.title}</h2>
        <InputsForm
          inputs={draft.inputs}
          onChange={(change) => dispatch({ type: "SET_INPUT", ...change })}
        />
      </section>

      <div className="flex flex-col gap-2">
        {!complete && <p className="text-center text-sm text-muted">{sk.form.incompleteHint}</p>}
        <button
          type="submit"
          disabled={!complete}
          className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sk.form.submit}
        </button>
      </div>
    </form>
  );
}

function LoadingPlaceholder() {
  return (
    <section role="status" className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">{sk.loading.title}</h1>
      <p>{sk.loading.stages[0]}</p>
      <p className="text-sm text-muted">{sk.loading.note}</p>
    </section>
  );
}

function ResultPlaceholder({
  response,
  dispatch,
}: {
  response: BlueprintResponse;
  dispatch: Dispatch<FlowAction>;
}) {
  const isOk = response.status === "ok";
  const renderedTracked = useRef(false);
  useEffect(() => {
    if (isOk && !renderedTracked.current) {
      renderedTracked.current = true;
      track("blueprint_rendered");
    }
  }, [isOk]);

  if (response.blueprint) {
    return (
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{sk.result.title}</h1>
        <p>{response.blueprint.card_why.summary}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{sk.photoIssue.title}</h1>
      <ul className="flex flex-col gap-2">
        {response.photo_issues.map((issue) => (
          <li key={issue.photo} className="rounded-xl border border-line bg-surface p-4">
            <p className="font-semibold">{sk.photo.slots[issue.photo].title}</p>
            <p>{issue.fix_instruction}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">{sk.photoIssue.intro}</p>
      <button
        type="button"
        onClick={() => dispatch({ type: "REPLACE_PHOTOS" })}
        className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-on-accent"
      >
        {sk.photoIssue.replace}
      </button>
    </section>
  );
}

function ErrorPlaceholder({ message, dispatch }: { message: string; dispatch: Dispatch<FlowAction> }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">{sk.errors.title}</h1>
      <p role="alert">{message}</p>
      <button
        type="button"
        onClick={() => dispatch({ type: "RETRY" })}
        className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-on-accent"
      >
        {sk.common.retry}
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: "RESTART" })}
        className="min-h-11 rounded-xl px-5 text-muted"
      >
        {sk.common.restart}
      </button>
    </section>
  );
}
