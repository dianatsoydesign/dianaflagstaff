"use client";

import { useCallback, useSyncExternalStore } from "react";

const HISTORY_KEY = "dianaImageViewer";
const CHANGE_EVENT = "diana-viewer-history-change";
type ViewerEntry = { scope: string; pathname: string; image: string };

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Give enlarged images their own history entry without changing the page URL. */
export function useViewerHistory(scope: string) {
  const readImage = useCallback((): string | null => {
    const entry = window.history.state?.[HISTORY_KEY] as ViewerEntry | undefined;
    return entry?.scope === scope && entry.pathname === window.location.pathname ? entry.image : null;
  }, [scope]);
  const image = useSyncExternalStore(subscribe, readImage, () => null);

  const setImage = useCallback((next: string | null) => {
    const current = readImage();
    if (next === current) return;
    if (next === null) {
      if (current !== null) window.history.back();
      return;
    }
    const state = {
      ...window.history.state,
      [HISTORY_KEY]: { scope, pathname: window.location.pathname, image: next } satisfies ViewerEntry,
    };
    if (current === null) window.history.pushState(state, "", window.location.href);
    else window.history.replaceState(state, "", window.location.href);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [readImage, scope]);

  return [image, setImage] as const;
}
