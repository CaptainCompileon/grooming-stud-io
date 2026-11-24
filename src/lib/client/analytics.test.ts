// @vitest-environment jsdom
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRef, track } from "./analytics";

type Plausible = NonNullable<Window["plausible"]>;

function setUrl(search: string) {
  window.history.replaceState({}, "", `/${search}`);
}

describe("analytics", () => {
  let plausible: Mock<Plausible>;

  beforeEach(() => {
    sessionStorage.clear();
    setUrl("");
    plausible = vi.fn<Plausible>();
    window.plausible = plausible;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete window.plausible;
  });

  it("attaches a valid ?ref= to the event", () => {
    setUrl("?ref=t07");
    track("submit");
    expect(plausible).toHaveBeenCalledWith("submit", { props: { ref: "t07" } });
  });

  it("merges event props with the ref", () => {
    setUrl("?ref=t07");
    track("feedback_submitted", { value: "up" });
    expect(plausible).toHaveBeenCalledWith("feedback_submitted", {
      props: { value: "up", ref: "t07" },
    });
  });

  it("drops an invalid ref", () => {
    setUrl("?ref=bad%20ref!");
    track("submit");
    expect(plausible).toHaveBeenCalledWith("submit", { props: {} });
    expect(getRef()).toBeNull();
  });

  it("drops a ref longer than 16 characters", () => {
    setUrl("?ref=abcdefghijklmnopq");
    expect(getRef()).toBeNull();
  });

  it("remembers the ref in sessionStorage after the param is gone", () => {
    setUrl("?ref=t07");
    expect(getRef()).toBe("t07");
    expect(sessionStorage.getItem("gs_ref")).toBe("t07");
    setUrl("");
    track("consent_given");
    expect(plausible).toHaveBeenCalledWith("consent_given", { props: { ref: "t07" } });
  });

  it("does not throw when Plausible is not loaded", () => {
    delete window.plausible;
    setUrl("?ref=t07");
    expect(() => track("landing_view")).not.toThrow();
  });

  it("does not throw when sessionStorage throws, and still uses the URL ref", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    setUrl("?ref=t07");
    expect(() => track("submit")).not.toThrow();
    expect(plausible).toHaveBeenCalledWith("submit", { props: { ref: "t07" } });
    setUrl("");
    expect(() => track("submit")).not.toThrow();
    expect(plausible).toHaveBeenLastCalledWith("submit", { props: {} });
  });
});
