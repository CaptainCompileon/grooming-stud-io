"use client";

import { useId, useState } from "react";
import { type Draft, type InputChange, isHeightValid } from "@/app/analyze/flow";
import { sk } from "@/i18n/sk";

type Props = {
  inputs: Draft["inputs"];
  onChange(change: InputChange): void;
};

export function InputsForm({ inputs, onChange }: Props) {
  const id = useId();
  const [heightTouched, setHeightTouched] = useState(false);
  const t = sk.inputs;
  const heightInvalid = heightTouched && inputs.height_cm !== null && !isHeightValid(inputs.height_cm);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-height`} className="font-semibold">
          {t.height.label}
        </label>
        <input
          id={`${id}-height`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={t.height.placeholder}
          value={inputs.height_cm ?? ""}
          aria-invalid={heightInvalid}
          aria-describedby={`${id}-height-hint`}
          onBlur={() => setHeightTouched(true)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
            onChange({ field: "height_cm", value: digits === "" ? null : Number(digits) });
          }}
          className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-lg outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 aria-invalid:border-danger"
        />
        <p id={`${id}-height-hint`} className={`text-sm ${heightInvalid ? "text-danger" : "text-muted"}`}>
          {t.height.hint}
        </p>
      </div>

      <ChoiceGroup
        name={`${id}-hair`}
        legend={t.hairType.label}
        options={t.hairType.options}
        value={inputs.hair_type}
        onSelect={(value) => onChange({ field: "hair_type", value })}
      />

      <ChoiceGroup
        name={`${id}-style`}
        legend={t.style.label}
        options={t.style.options}
        value={inputs.preferred_style}
        onSelect={(value) => onChange({ field: "preferred_style", value })}
      />
    </div>
  );
}

function ChoiceGroup<V extends string>({
  name,
  legend,
  options,
  value,
  onSelect,
}: {
  name: string;
  legend: string;
  options: Readonly<Record<V, string>>;
  value: V | null;
  onSelect(value: V): void;
}) {
  const entries = Object.entries(options) as [V, string][];
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-semibold">{legend}</legend>
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([optionValue, label]) => (
          <label
            key={optionValue}
            className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-line bg-surface px-3 text-center text-sm font-medium transition-colors has-checked:border-accent has-checked:bg-accent has-checked:text-on-accent has-focus-visible:ring-2 has-focus-visible:ring-accent has-focus-visible:ring-offset-2"
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onSelect(optionValue)}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
