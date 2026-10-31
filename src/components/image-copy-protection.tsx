"use client";

import { useEffect } from "react";

/** Discourage casual image copying without blocking text or gallery controls. */
export function ImageCopyProtection() {
  useEffect(() => {
    const imageTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      if (target.closest("img, picture")) return true;
      const control = target.closest("button, a");
      if (control) return !!control.querySelector("img") && !control.textContent?.trim();
      return !!target.closest("[data-image-copy-protected]");
    };
    const contextMenu = (event: MouseEvent) => {
      if (imageTarget(event.target)) event.preventDefault();
    };
    const drag = (event: DragEvent) => {
      if (imageTarget(event.target)) event.preventDefault();
    };
    const copy = (event: ClipboardEvent) => {
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || (active instanceof HTMLElement && active.isContentEditable)) return;
      const selection = window.getSelection();
      // Preserve copying written content, but strip embedded images from copied selections.
      if (selection?.rangeCount && !selection.isCollapsed) {
        const fragment = selection.getRangeAt(0).cloneContents();
        if (fragment.querySelector("img, picture")) {
          event.preventDefault();
          event.clipboardData?.setData("text/plain", selection.toString());
        }
        return;
      }
      if (imageTarget(event.target) || imageTarget(active)) event.preventDefault();
    };
    // Capture also covers images rendered in modal portals outside the main page.
    document.addEventListener("contextmenu", contextMenu, true);
    document.addEventListener("dragstart", drag, true);
    document.addEventListener("copy", copy, true);
    return () => {
      document.removeEventListener("contextmenu", contextMenu, true);
      document.removeEventListener("dragstart", drag, true);
      document.removeEventListener("copy", copy, true);
    };
  }, []);
  return null;
}
