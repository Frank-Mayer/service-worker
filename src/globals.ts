export const SW_MANIFEST: Array<string> = [];
export const SW_VERSION: string = "sw_000001";

const now = new Date();

export const CACHE_NAME: string =
  "sw-cache-" +
  now.getFullYear().toString() +
  "-" +
  now.getMonth().toString().padStart(2, "0");
