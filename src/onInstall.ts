import { CACHE_NAME } from "./globals";

export const onInstall = async () => {
  await caches.open(CACHE_NAME);
  await self.skipWaiting();
};
