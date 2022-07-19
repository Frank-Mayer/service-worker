declare const self: ServiceWorkerGlobalScope;

import { onInstall } from "./onInstall";
import { onFetch } from "./onFetch";
import { onActivate } from "./onActivate";

self.addEventListener("install", (ev: InstallEvent) => {
  ev.waitUntil(onInstall().then(() => self.skipWaiting()));
});

self.addEventListener("fetch", (ev: FetchEvent) => {
  try {
    if (!ev.request.url.startsWith(self.location.origin)) {
      return;
    }

    // Prevent Chrome Developer Tools error:
    // Failed to execute 'fetch' on 'ServiceWorkerGlobalScope': 'only-if-cached' can be set only with 'same-origin' mode
    // See also https://stackoverflow.com/a/49719964/1217468
    if (
      ev.request.cache === "only-if-cached" &&
      ev.request.mode !== "same-origin"
    ) {
      return;
    }

    ev.respondWith(
      onFetch(ev).catch(() => {
        console.error("fetch failed", ev);
      })
    );
  } catch (err) {
    console.error(err, ev);
  }
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(onActivate());
});
