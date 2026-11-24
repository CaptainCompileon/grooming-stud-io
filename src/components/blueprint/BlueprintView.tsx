"use client";

import { useEffect, useRef } from "react";
import { sk } from "@/i18n/sk";
import type { Blueprint } from "@/lib/blueprint/types";
import { track } from "@/lib/client/analytics";
import { BarberCard } from "./BarberCard";
import { FeedbackWidget } from "./FeedbackWidget";
import { GroomingCard } from "./GroomingCard";
import { StyleCard } from "./StyleCard";
import { WhyCard } from "./WhyCard";

export function BlueprintView({ blueprint }: { blueprint: Blueprint }) {
  const renderedTracked = useRef(false); // dev StrictMode runs mount effects twice
  useEffect(() => {
    if (!renderedTracked.current) {
      renderedTracked.current = true;
      track("blueprint_rendered");
    }
  }, []);

  const { observations } = blueprint;
  const notes = sk.cards.lowConfidence;
  const styleNotes = [
    observations.color_confidence === "low" ? notes.color : null,
    observations.body_confidence === "low" ? notes.body : null,
  ].filter((note) => note !== null);

  return (
    <div data-testid="blueprint" className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h1 className="text-2xl font-semibold">{sk.result.title}</h1>
      <BarberCard
        card={blueprint.card_barber}
        lowConfidenceNote={observations.face_shape_confidence === "low" ? notes.face : undefined}
      />
      <StyleCard card={blueprint.card_style} lowConfidenceNotes={styleNotes} />
      <GroomingCard card={blueprint.card_grooming} />
      <WhyCard card={blueprint.card_why} />
      <FeedbackWidget />
    </div>
  );
}
