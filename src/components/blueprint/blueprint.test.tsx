import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { toPng } from "html-to-image";
import { StrictMode } from "react";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sk } from "@/i18n/sk";
import okFixture from "@/lib/blueprint/__fixtures__/blueprint-ok.sk.json";
import photoIssueFixture from "@/lib/blueprint/__fixtures__/photo-issue.sk.json";
import type { Blueprint, BlueprintResponse } from "@/lib/blueprint/types";
import { BlueprintView } from "./BlueprintView";
import { ErrorView } from "./ErrorView";
import { FeedbackWidget } from "./FeedbackWidget";
import { LoadingView } from "./LoadingView";
import { PhotoIssueView } from "./PhotoIssueView";

// html-to-image needs a real layout engine; jsdom only checks that we call it correctly.
vi.mock("html-to-image", () => ({
  toPng: vi.fn(async () => "data:image/png;base64,iVBORw0KGgo="),
}));

const okBlueprint = (): Blueprint => structuredClone((okFixture as BlueprintResponse).blueprint!);
const photoIssue = photoIssueFixture as BlueprintResponse;

type Plausible = NonNullable<Window["plausible"]>;
let plausible: Mock<Plausible>;

const eventCalls = (name: string) => plausible.mock.calls.filter(([event]) => event === name);

// navigator.clipboard / share / canShare do not exist in jsdom.
function setNavigator(key: "clipboard" | "share" | "canShare", value: unknown) {
  Object.defineProperty(navigator, key, { value, configurable: true, writable: true });
}

beforeEach(() => {
  plausible = vi.fn<Plausible>();
  window.plausible = plausible;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.mocked(toPng).mockClear();
  delete window.plausible;
  for (const key of ["clipboard", "share", "canShare"] as const) {
    delete (navigator as unknown as Record<string, unknown>)[key];
  }
});

describe("BlueprintView", () => {
  it("renders the 4 cards with 6 swatches, 3 routine steps and the summary", () => {
    const blueprint = okBlueprint();
    render(<BlueprintView blueprint={blueprint} />);
    const root = screen.getByTestId("blueprint");
    const headings = within(root)
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent);
    expect(headings).toEqual([
      sk.cards.barber.title,
      sk.cards.style.title,
      sk.cards.grooming.title,
      sk.cards.why.title,
      sk.feedback.question,
    ]);
    expect(screen.getAllByTestId("swatch")).toHaveLength(6);
    expect(screen.getAllByTestId("routine-step")).toHaveLength(3);
    expect(screen.getByText(blueprint.card_why.summary)).toBeInTheDocument();
  });

  it("tracks blueprint_rendered exactly once, also under StrictMode and across re-renders", () => {
    const blueprint = okBlueprint();
    const { rerender } = render(
      <StrictMode>
        <BlueprintView blueprint={blueprint} />
      </StrictMode>,
    );
    rerender(
      <StrictMode>
        <BlueprintView blueprint={blueprint} />
      </StrictMode>,
    );
    expect(eventCalls("blueprint_rendered")).toHaveLength(1);
  });

  it("shows each swatch's hex as its background, name and where-to-wear label", () => {
    render(<BlueprintView blueprint={okBlueprint()} />);
    const first = screen.getAllByTestId("swatch")[0];
    expect(within(first).getByText("Olivová")).toBeInTheDocument();
    expect(within(first).getByText("#6B7445")).toBeInTheDocument();
    expect(within(first).getByText(sk.cards.style.whereToWear.top_near_face)).toBeInTheDocument();
    expect(first.querySelector('[style*="background"]')).toHaveStyle({ background: "#6B7445" });
  });

  it("renders the lengths with guard numbers and the barber labels", () => {
    render(<BlueprintView blueprint={okBlueprint()} />);
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
    expect(screen.getByText(sk.cards.barber.scissors)).toBeInTheDocument();
    expect(screen.getByText(sk.cards.barber.transitions.low_taper)).toBeInTheDocument();
    expect(screen.getByText(sk.cards.barber.necklines.natural_tapered)).toBeInTheDocument();
  });

  it("hides the beard block when beard is null and shows it otherwise", () => {
    const blueprint = okBlueprint();
    const { unmount } = render(<BlueprintView blueprint={blueprint} />);
    expect(screen.queryByText(sk.cards.barber.beardLabel)).not.toBeInTheDocument();
    unmount();

    blueprint.card_barber.beard = { style: "Krátke strniská", length_mm: 3, note: "Prirodzená línia." };
    render(<BlueprintView blueprint={blueprint} />);
    expect(screen.getByText(sk.cards.barber.beardLabel)).toBeInTheDocument();
    expect(screen.getByText(/Krátke strniská/)).toBeInTheDocument();
  });

  it("keeps the why text inside a collapsible details element", () => {
    const blueprint = okBlueprint();
    render(<BlueprintView blueprint={blueprint} />);
    const why = screen.getByText(blueprint.card_barber.why);
    expect(why.closest("details")).not.toBeNull();
  });

  it("does not render the targeted tip when its area is none", () => {
    const blueprint = okBlueprint();
    const tip = blueprint.card_grooming.targeted_tip.tip;
    const { unmount } = render(<BlueprintView blueprint={blueprint} />);
    expect(screen.getByText(tip)).toBeInTheDocument();
    unmount();

    blueprint.card_grooming.targeted_tip.area = "none";
    render(<BlueprintView blueprint={blueprint} />);
    expect(screen.queryByText(tip)).not.toBeInTheDocument();
    expect(screen.queryByText(sk.cards.grooming.targetedTipLabel, { exact: false })).not.toBeInTheDocument();
  });

  it("does not render the uncertainties block when the list is empty", () => {
    const blueprint = okBlueprint();
    const { unmount } = render(<BlueprintView blueprint={blueprint} />);
    expect(screen.getByText(sk.cards.why.uncertaintiesLabel)).toBeInTheDocument();
    unmount();

    blueprint.card_why.uncertainties = [];
    render(<BlueprintView blueprint={blueprint} />);
    expect(screen.queryByText(sk.cards.why.uncertaintiesLabel)).not.toBeInTheDocument();
  });

  it("shows a low-confidence note only for observations with low confidence", () => {
    const blueprint = okBlueprint();
    const { unmount } = render(<BlueprintView blueprint={blueprint} />);
    for (const note of Object.values(sk.cards.lowConfidence)) {
      expect(screen.queryByText(note)).not.toBeInTheDocument();
    }
    unmount();

    blueprint.observations.face_shape_confidence = "low";
    blueprint.observations.color_confidence = "low";
    blueprint.observations.body_confidence = "low";
    render(<BlueprintView blueprint={blueprint} />);
    const barberCard = screen.getByRole("heading", { name: sk.cards.barber.title }).closest("section")!;
    const styleCard = screen.getByRole("heading", { name: sk.cards.style.title }).closest("section")!;
    expect(within(barberCard).getByText(sk.cards.lowConfidence.face)).toBeInTheDocument();
    expect(within(styleCard).getByText(sk.cards.lowConfidence.color)).toBeInTheDocument();
    expect(within(styleCard).getByText(sk.cards.lowConfidence.body)).toBeInTheDocument();
  });
});

describe("BarberCard actions", () => {
  it("copies the plain-text cheat sheet and tracks cheatsheet_copy", async () => {
    const writeText = vi.fn(async () => {});
    setNavigator("clipboard", { writeText });
    render(<BlueprintView blueprint={okBlueprint()} />);

    fireEvent.click(screen.getByRole("button", { name: sk.cards.barber.copy }));

    await screen.findByRole("button", { name: sk.cards.barber.copied });
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]).toEqual([expect.stringContaining("6 mm (#2)")]);
    expect(eventCalls("cheatsheet_copy")).toHaveLength(1);
  });

  it("shows an error and does not track when the clipboard rejects", async () => {
    setNavigator("clipboard", { writeText: vi.fn(async () => Promise.reject(new Error("denied"))) });
    render(<BlueprintView blueprint={okBlueprint()} />);
    fireEvent.click(screen.getByRole("button", { name: sk.cards.barber.copy }));
    expect(await screen.findByText(sk.cards.barber.copyError)).toBeInTheDocument();
    expect(eventCalls("cheatsheet_copy")).toHaveLength(0);
  });

  it("shares the PNG via the share sheet when files can be shared", async () => {
    const share = vi.fn(async () => {});
    setNavigator("canShare", vi.fn(() => true));
    setNavigator("share", share);
    render(<BlueprintView blueprint={okBlueprint()} />);

    fireEvent.click(screen.getByRole("button", { name: sk.cards.barber.saveImage }));

    await waitFor(() => expect(eventCalls("cheatsheet_save_image")).toHaveLength(1));
    // Only the barber-facing block is captured: it holds the cut, not the user's buttons or the why.
    const exported = vi.mocked(toPng).mock.calls[0][0];
    expect(toPng).toHaveBeenCalledWith(exported, expect.objectContaining({ pixelRatio: 2 }));
    expect(exported).toContainElement(screen.getByRole("heading", { name: sk.cards.barber.title }));
    expect(exported).toHaveTextContent("Textured crop with low taper");
    expect(exported).not.toContainElement(screen.getByRole("button", { name: sk.cards.barber.copy }));
    expect(exported).not.toHaveTextContent(okBlueprint().card_barber.why);
    expect(share).toHaveBeenCalledTimes(1);
    const [{ files }] = share.mock.calls[0] as unknown as [{ files: File[] }];
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("grooming-studio-barber.png");
    expect(files[0].type).toBe("image/png");
  });

  it("downloads the PNG when the share sheet cannot take files", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<BlueprintView blueprint={okBlueprint()} />);

    fireEvent.click(screen.getByRole("button", { name: sk.cards.barber.saveImage }));

    await waitFor(() => expect(eventCalls("cheatsheet_save_image")).toHaveLength(1));
    expect(click).toHaveBeenCalledTimes(1);
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("grooming-studio-barber.png");
    expect(anchor.href).toMatch(/^data:image\/png;base64,/);
    click.mockRestore();
  });

  it("falls back to a download when the share sheet rejects with NotAllowedError (iOS)", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const share = vi.fn(async () => Promise.reject(new DOMException("no gesture", "NotAllowedError")));
    setNavigator("canShare", vi.fn(() => true));
    setNavigator("share", share);
    render(<BlueprintView blueprint={okBlueprint()} />);

    fireEvent.click(screen.getByRole("button", { name: sk.cards.barber.saveImage }));

    await waitFor(() => expect(eventCalls("cheatsheet_save_image")).toHaveLength(1));
    expect(share).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("grooming-studio-barber.png");
    expect(anchor.href).toMatch(/^data:image\/png;base64,/);
    expect(screen.queryByText(sk.cards.barber.saveError)).not.toBeInTheDocument();
    click.mockRestore();
  });

  it("shows the save error and does not track when rendering the PNG fails", async () => {
    vi.mocked(toPng).mockRejectedValueOnce(new Error("canvas tainted"));
    render(<BlueprintView blueprint={okBlueprint()} />);
    fireEvent.click(screen.getByRole("button", { name: sk.cards.barber.saveImage }));
    expect(await screen.findByText(sk.cards.barber.saveError)).toBeInTheDocument();
    expect(eventCalls("cheatsheet_save_image")).toHaveLength(0);
  });

  it("does not track or show an error when the user cancels the share sheet", async () => {
    setNavigator("canShare", vi.fn(() => true));
    setNavigator("share", vi.fn(async () => Promise.reject(new DOMException("cancel", "AbortError"))));
    render(<BlueprintView blueprint={okBlueprint()} />);
    fireEvent.click(screen.getByRole("button", { name: sk.cards.barber.saveImage }));
    await waitFor(() => expect(screen.getByRole("button", { name: sk.cards.barber.saveImage })).toBeEnabled());
    expect(eventCalls("cheatsheet_save_image")).toHaveLength(0);
    expect(screen.queryByText(sk.cards.barber.saveError)).not.toBeInTheDocument();
  });
});

describe("PhotoIssueView", () => {
  it("lists each issue with the slot name and fix instruction and dispatches REPLACE_PHOTOS", () => {
    const dispatch = vi.fn();
    render(<PhotoIssueView issues={photoIssue.photo_issues} dispatch={dispatch} />);
    expect(screen.getByText(sk.photoIssue.title)).toBeInTheDocument();
    expect(screen.getByText(sk.photo.slots.full_body.title)).toBeInTheDocument();
    expect(screen.getByText(photoIssue.photo_issues[0].fix_instruction)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: sk.photoIssue.replace }));
    expect(dispatch).toHaveBeenCalledWith({ type: "REPLACE_PHOTOS" });
  });
});

describe("ErrorView", () => {
  it.each(["network", "analysis_failed"] as const)(
    "%s: shows its message, retry dispatches RETRY and restart dispatches RESTART",
    (kind) => {
      const dispatch = vi.fn();
      render(<ErrorView kind={kind} dispatch={dispatch} />);
      const message = kind === "network" ? sk.errors.network : sk.errors.analysisFailed;
      expect(screen.getByRole("alert")).toHaveTextContent(message);
      expect(screen.queryByRole("button", { name: sk.common.backToForm })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: sk.common.retry }));
      expect(dispatch).toHaveBeenLastCalledWith({ type: "RETRY" });
      fireEvent.click(screen.getByRole("button", { name: sk.common.restart }));
      expect(dispatch).toHaveBeenLastCalledWith({ type: "RESTART" });
    },
  );

  it.each([
    ["invalid_request", sk.errors.invalidPhotos],
    ["refusal", sk.errors.refusal],
  ] as const)("%s: offers to edit the photos (BACK_TO_FORM) instead of retrying", (kind, message) => {
    const dispatch = vi.fn();
    render(<ErrorView kind={kind} dispatch={dispatch} />);
    expect(screen.getByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByRole("button", { name: sk.common.retry })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: sk.common.backToForm }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: "BACK_TO_FORM" });
    fireEvent.click(screen.getByRole("button", { name: sk.common.restart }));
    expect(dispatch).toHaveBeenLastCalledWith({ type: "RESTART" });
  });
});

describe("LoadingView", () => {
  it("advances through the 4 stages every 6 s and stays on the last one", () => {
    vi.useFakeTimers();
    render(<LoadingView />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(sk.loading.stages[0]);
    act(() => vi.advanceTimersByTime(6000));
    expect(status).toHaveTextContent(sk.loading.stages[1]);
    act(() => vi.advanceTimersByTime(12_000));
    expect(status).toHaveTextContent(sk.loading.stages[3]);
    act(() => vi.advanceTimersByTime(60_000));
    expect(status).toHaveTextContent(sk.loading.stages[3]);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("FeedbackWidget", () => {
  it("tracks the vote, posts the optional comment and thanks the user", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<FeedbackWidget />);

    fireEvent.click(screen.getByRole("button", { name: sk.feedback.yes }));
    expect(plausible).toHaveBeenCalledWith("feedback_submitted", { props: { value: "up" } });

    const textarea = screen.getByLabelText(sk.feedback.commentLabel);
    expect(textarea).toHaveAttribute("maxLength", "1000");
    fireEvent.change(textarea, { target: { value: "  Super, ďakujem  " } });
    fireEvent.click(screen.getByRole("button", { name: sk.feedback.send }));

    expect(await screen.findByText(sk.feedback.thanks)).toBeInTheDocument();
    expect(screen.getByText(sk.feedback.followUp)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/feedback");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ value: "up", text: "Super, ďakujem" });
  });

  it("sends only the vote when the comment is empty", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<FeedbackWidget />);
    fireEvent.click(screen.getByRole("button", { name: sk.feedback.no }));
    expect(plausible).toHaveBeenCalledWith("feedback_submitted", { props: { value: "down" } });
    fireEvent.click(screen.getByRole("button", { name: sk.feedback.send }));
    await screen.findByText(sk.feedback.thanks);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ value: "down" });
  });

  it("shows an error and keeps the form when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    render(<FeedbackWidget />);
    fireEvent.click(screen.getByRole("button", { name: sk.feedback.yes }));
    fireEvent.click(screen.getByRole("button", { name: sk.feedback.send }));
    expect(await screen.findByText(sk.feedback.error)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: sk.feedback.send })).toBeEnabled();
    expect(screen.queryByText(sk.feedback.thanks)).not.toBeInTheDocument();
  });
});
