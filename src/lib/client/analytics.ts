// Cookieless funnel analytics (Plausible). Never pass photos or personal input values as props.

export type AnalyticsEvent =
  | "landing_view"
  | "consent_given"
  | "photos_completed"
  | "submit"
  | "blueprint_rendered"
  | "blueprint_error"
  | "cheatsheet_copy"
  | "cheatsheet_save_image"
  | "feedback_submitted";

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Props }) => void;
  }
}

const REF_PATTERN = /^[a-z0-9_-]{1,16}$/i;
const REF_STORAGE_KEY = "gs_ref";

/** Anonymous beta invite code from `?ref=`, remembered for the browser tab session. */
export function getRef(): string | null {
  if (typeof window === "undefined") return null;

  const fromUrl = new URLSearchParams(window.location.search).get("ref");
  if (fromUrl !== null && REF_PATTERN.test(fromUrl)) {
    try {
      window.sessionStorage.setItem(REF_STORAGE_KEY, fromUrl);
    } catch {
      // storage blocked (private mode, sandbox) – the URL value still counts
    }
    return fromUrl;
  }

  try {
    const stored = window.sessionStorage.getItem(REF_STORAGE_KEY);
    if (stored !== null && REF_PATTERN.test(stored)) return stored;
  } catch {
    // storage blocked
  }
  return null;
}

export function track(event: AnalyticsEvent, props?: Props): void {
  if (typeof window === "undefined") return;
  const ref = getRef();
  try {
    window.plausible?.(event, { props: { ...props, ...(ref ? { ref } : {}) } });
  } catch {
    // analytics must never break the flow
  }
}
