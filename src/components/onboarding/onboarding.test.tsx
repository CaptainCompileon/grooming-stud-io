import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AnalyzePage from "@/app/analyze/page";
import { sk } from "@/i18n/sk";
import okFixture from "@/lib/blueprint/__fixtures__/blueprint-ok.sk.json";
import photoIssueFixture from "@/lib/blueprint/__fixtures__/photo-issue.sk.json";
import { PhotoSlot } from "./PhotoSlot";

// createImageBitmap and canvas do not exist in jsdom: the page's default
// prepareImage is replaced by a stub that returns a fake JPEG base64.
vi.mock("@/lib/client/image", () => ({
  prepareImage: vi.fn(async (file: File) => `/9j/${file.name}`),
}));

const jpeg = (name: string) => new File(["x"], name, { type: "image/jpeg" });

function fileInputs(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="file"]'));
}

function giveConsent() {
  fireEvent.click(screen.getByRole("checkbox", { name: sk.consent.checkbox }));
  fireEvent.click(screen.getByRole("button", { name: sk.consent.confirm }));
}

async function addAllPhotos(container: HTMLElement) {
  fileInputs(container).forEach((input, i) => {
    fireEvent.change(input, { target: { files: [jpeg(`p${i}.jpg`)] } });
  });
  await waitFor(() => expect(container.querySelectorAll("img")).toHaveLength(3));
}

function fillInputs() {
  fireEvent.change(screen.getByLabelText(sk.inputs.height.label), { target: { value: "182" } });
  fireEvent.click(screen.getByLabelText(sk.inputs.hairType.options.wavy));
  fireEvent.click(screen.getByLabelText(sk.inputs.style.options.minimal));
}

type Plausible = NonNullable<Window["plausible"]>;
let plausible: Mock<Plausible>;

beforeEach(() => {
  plausible = vi.fn<Plausible>();
  window.plausible = plausible;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete window.plausible;
});

describe("consent gate", () => {
  it("renders no photo input until the 18+ checkbox is checked and confirmed", () => {
    const { container } = render(<AnalyzePage />);
    expect(fileInputs(container)).toHaveLength(0);
    const confirm = screen.getByRole("button", { name: sk.consent.confirm });
    expect(confirm).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: sk.consent.checkbox }));
    expect(fileInputs(container)).toHaveLength(0);
    expect(confirm).toBeEnabled();

    fireEvent.click(confirm);
    const inputs = fileInputs(container);
    expect(inputs).toHaveLength(3);
    for (const input of inputs) {
      expect(input).toHaveAttribute("accept", "image/*");
      expect(input).not.toHaveAttribute("capture");
    }
    expect(plausible).toHaveBeenCalledWith("consent_given", { props: {} });
  });
});

describe("PhotoSlot", () => {
  it("shows the decode error and does not call onChange when prepare rejects", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <PhotoSlot
        photoKey="front"
        value={null}
        onChange={onChange}
        prepare={() => Promise.reject(new Error("image_decode_failed"))}
      />,
    );
    fireEvent.change(fileInputs(container)[0], {
      target: { files: [new File(["x"], "IMG_0001.HEIC", { type: "image/heic" })] },
    });
    expect(await screen.findByText(sk.photo.decodeError)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector("img")).toBeNull();
  });

  it("passes the prepared base64 to onChange", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <PhotoSlot photoKey="profile" value={null} onChange={onChange} prepare={async () => "/9j/abc"} />,
    );
    fireEvent.change(fileInputs(container)[0], { target: { files: [jpeg("a.jpg")] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("/9j/abc"));
    expect(screen.queryByText(sk.photo.decodeError)).not.toBeInTheDocument();
  });

  it("shows a JPEG thumbnail and clears the photo with the remove button", () => {
    const onChange = vi.fn();
    const { container } = render(
      <PhotoSlot photoKey="full_body" value="/9j/abc" onChange={onChange} prepare={async () => ""} />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "data:image/jpeg;base64,/9j/abc");
    fireEvent.click(screen.getByRole("button", { name: sk.photo.remove }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("remove also clears a decode error shown for a failed replacement", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <PhotoSlot
        photoKey="front"
        value="/9j/old"
        onChange={onChange}
        prepare={() => Promise.reject(new Error("image_decode_failed"))}
      />,
    );
    fireEvent.change(fileInputs(container)[0], { target: { files: [jpeg("broken.jpg")] } });
    expect(await screen.findByText(sk.photo.decodeError)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: sk.photo.remove }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByText(sk.photo.decodeError)).not.toBeInTheDocument();
  });

  it("renders the slot title, two tips and the example caption", () => {
    render(<PhotoSlot photoKey="front" value={null} onChange={() => {}} />);
    const copy = sk.photo.slots.front;
    expect(screen.getByText(copy.title)).toBeInTheDocument();
    expect(copy.tips).toHaveLength(2);
    for (const tip of copy.tips) expect(screen.getByText(tip)).toBeInTheDocument();
    expect(screen.getByText(copy.example)).toBeInTheDocument();
  });
});

describe("form step", () => {
  it("keeps submit disabled until 3 photos and 3 inputs are set", async () => {
    const { container } = render(<AnalyzePage />);
    giveConsent();
    const submit = screen.getByRole("button", { name: sk.form.submit });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(sk.inputs.height.label), { target: { value: "182" } });
    fireEvent.click(screen.getByLabelText(sk.inputs.hairType.options.wavy));
    fireEvent.click(screen.getByLabelText(sk.inputs.style.options.minimal));
    expect(submit).toBeDisabled();

    await addAllPhotos(container);
    expect(submit).toBeEnabled();

    fireEvent.change(screen.getByLabelText(sk.inputs.height.label), { target: { value: "250" } });
    expect(submit).toBeDisabled();
  });

  it("tracks photos_completed once, even after a photo is removed and re-added", async () => {
    const { container } = render(<AnalyzePage />);
    giveConsent();
    await addAllPhotos(container);
    fireEvent.click(screen.getAllByRole("button", { name: sk.photo.remove })[0]);
    fireEvent.change(fileInputs(container)[0], { target: { files: [jpeg("again.jpg")] } });
    await waitFor(() => expect(container.querySelectorAll("img")).toHaveLength(3));
    const calls = plausible.mock.calls.filter(([event]) => event === "photos_completed");
    expect(calls).toHaveLength(1);
  });

  it("sends exactly one request on submit", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<AnalyzePage />);
    giveConsent();
    await addAllPhotos(container);
    fillInputs();

    const submit = screen.getByRole("button", { name: sk.form.submit });
    fireEvent.click(submit);
    fireEvent.click(submit);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button", { name: sk.form.submit })).not.toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/analyze");
    expect(JSON.parse(init.body as string)).toEqual({
      photos: { front: "/9j/p0.jpg", profile: "/9j/p1.jpg", full_body: "/9j/p2.jpg" },
      inputs: { height_cm: 182, hair_type: "wavy", preferred_style: "minimal" },
      measurements: null,
      locale: "sk",
    });
    expect(plausible).toHaveBeenCalledWith("submit", { props: {} });
  });

  it("on a network failure shows the error and retry resends the same payload", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<AnalyzePage />);
    giveConsent();
    await addAllPhotos(container);
    fillInputs();
    fireEvent.click(screen.getByRole("button", { name: sk.form.submit }));

    expect(await screen.findByText(sk.errors.network)).toBeInTheDocument();
    expect(plausible).toHaveBeenCalledWith("blueprint_error", { props: { reason: "network" } });

    fireEvent.click(screen.getByRole("button", { name: sk.common.retry }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const bodies = fetchMock.mock.calls.map((c) => (c as unknown as [string, RequestInit])[1].body);
    expect(bodies[1]).toBe(bodies[0]);
  });
});

describe("analyze outcome", () => {
  async function submitWith(fetchMock: Mock) {
    vi.stubGlobal("fetch", fetchMock);
    const utils = render(<AnalyzePage />);
    giveConsent();
    await addAllPhotos(utils.container);
    fillInputs();
    fireEvent.click(screen.getByRole("button", { name: sk.form.submit }));
    return utils;
  }

  const jsonResponse = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

  it.each([400, 413])(
    "%i shows the invalid-photos message and 'Upraviť fotky' returns to the filled form",
    async (status) => {
      const { container } = await submitWith(vi.fn(async () => jsonResponse(status, { error: "invalid_request" })));

      expect(await screen.findByRole("alert")).toHaveTextContent(sk.errors.invalidPhotos);
      expect(plausible).toHaveBeenCalledWith("blueprint_error", { props: { reason: "invalid_request" } });
      expect(screen.queryByRole("button", { name: sk.common.retry })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: sk.common.backToForm }));
      expect(container.querySelectorAll("img")).toHaveLength(3);
      expect(screen.getByLabelText(sk.inputs.height.label)).toHaveValue("182");
      expect(screen.getByRole("button", { name: sk.form.submit })).toBeEnabled();
    },
  );

  it.each([
    ["502", () => jsonResponse(502, { error: "analysis_failed" })],
    ["502 model_error", () => jsonResponse(502, { error: "analysis_failed", reason: "model_error" })],
    ["500 server_error", () => jsonResponse(500, { error: "analysis_failed", reason: "server_error" })],
    ["malformed JSON", () => new Response("{not json", { status: 200 })],
    ["an unexpected shape", () => jsonResponse(200, { status: "weird" })],
  ])("%s shows the analysis-failed message with a retry button", async (_label, respond) => {
    await submitWith(vi.fn(async () => respond()));
    expect(await screen.findByRole("alert")).toHaveTextContent(sk.errors.analysisFailed);
    expect(plausible).toHaveBeenCalledWith("blueprint_error", { props: { reason: "analysis_failed" } });
    expect(screen.getByRole("button", { name: sk.common.retry })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: sk.common.backToForm })).not.toBeInTheDocument();
  });

  it("an ok response renders the blueprint and tracks blueprint_rendered once", async () => {
    await submitWith(vi.fn(async () => jsonResponse(200, okFixture)));
    expect(await screen.findByTestId("blueprint")).toBeInTheDocument();
    expect(plausible.mock.calls.filter(([event]) => event === "blueprint_rendered")).toHaveLength(1);
    expect(plausible.mock.calls.filter(([event]) => event === "blueprint_error")).toHaveLength(0);
  });

  it("a photo_issue response shows the fix instructions and tracks only blueprint_error", async () => {
    await submitWith(vi.fn(async () => jsonResponse(200, photoIssueFixture)));
    expect(await screen.findByText(photoIssueFixture.photo_issues[0].fix_instruction)).toBeInTheDocument();
    expect(plausible).toHaveBeenCalledWith("blueprint_error", { props: { reason: "photo_issue" } });
    expect(plausible.mock.calls.filter(([event]) => event === "blueprint_rendered")).toHaveLength(0);
  });
});
