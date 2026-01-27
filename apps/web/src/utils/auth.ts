import { redirect } from "@tanstack/react-router";

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
};

export const authGuard = (opts?: { location?: { pathname?: string; searchStr?: string } }) => {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    const pathname = opts?.location?.pathname ?? window.location.pathname ?? "/";
    const searchStr = opts?.location?.searchStr ?? window.location.search ?? "";
    const redirectTo = `${pathname}${searchStr}`;
    throw redirect({
      to: "/login",
      search: { redirectTo },
    });
  }
};
