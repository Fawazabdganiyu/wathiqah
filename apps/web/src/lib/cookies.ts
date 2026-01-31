export type CookieOptions = {
  path?: string;
  maxAge?: number;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
};

const hasDocument = typeof document !== "undefined";

export function getCookie(name: string): string | undefined {
  if (!hasDocument) return undefined;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const c of cookies) {
    const [k, ...rest] = c.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}
