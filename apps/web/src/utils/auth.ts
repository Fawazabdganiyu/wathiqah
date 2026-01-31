import { redirect } from "@tanstack/react-router";
import { getCookie } from "@/lib/cookies";

export const isAuthenticated = () => {
  const token = getCookie("isLoggedIn");
  return !!token;
};

export const authGuard = (opts?: { location?: { pathname?: string; searchStr?: string } }) => {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    const pathname = opts?.location?.pathname ?? window.location.pathname ?? "/";
    const searchStr = opts?.location?.searchStr ?? window.location.search ?? "";
    const redirectTo = encodeURIComponent(`${pathname}${searchStr}`);
    throw redirect({
      to: "/login",
      search: { redirectTo },
    });
  }
};
