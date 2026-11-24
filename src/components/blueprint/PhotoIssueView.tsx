import type { Dispatch } from "react";
import type { FlowAction } from "@/app/analyze/flow";
import { sk } from "@/i18n/sk";
import type { PhotoIssue } from "@/lib/blueprint/types";

type Props = {
  issues: PhotoIssue[];
  dispatch: Dispatch<FlowAction>;
};

export function PhotoIssueView({ issues, dispatch }: Props) {
  return (
    <section className="flex flex-col gap-4 break-words">
      <h1 className="text-2xl font-semibold">{sk.photoIssue.title}</h1>
      <ul className="flex flex-col gap-3">
        {issues.map((issue, i) => (
          <li key={`${issue.photo}-${i}`} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold">{sk.photo.slots[issue.photo].title}</p>
            <p className="mt-1 leading-snug">{issue.fix_instruction}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">{sk.photoIssue.intro}</p>
      <button
        type="button"
        onClick={() => dispatch({ type: "REPLACE_PHOTOS" })}
        className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-on-accent transition-colors hover:bg-accent-strong"
      >
        {sk.photoIssue.replace}
      </button>
    </section>
  );
}
