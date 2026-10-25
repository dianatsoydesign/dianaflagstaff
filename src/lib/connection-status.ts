"use client";

import { useSyncExternalStore } from "react";

let requestFailed = false;
const eventName = "diana-connection-change";
export function reportNetworkFailure() {
  requestFailed = true;
  window.dispatchEvent(new Event(eventName));
}
export function clearNetworkFailure() {
  requestFailed = false;
  window.dispatchEvent(new Event(eventName));
}
function subscribe(callback: () => void) {
  const online = () => { requestFailed = false; callback(); };
  window.addEventListener("online", online);
  window.addEventListener("offline", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("online", online);
    window.removeEventListener("offline", callback);
    window.removeEventListener(eventName, callback);
  };
}
export function useConnectionUnavailable() {
  return useSyncExternalStore(subscribe, () => !navigator.onLine || requestFailed, () => false);
}
