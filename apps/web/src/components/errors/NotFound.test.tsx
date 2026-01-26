import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NotFound } from "./NotFound";

// Mock the Link component from @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("NotFound Component", () => {
  it("renders correctly", () => {
    render(<NotFound />);
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByText(/Sorry, we couldn't find/i)).toBeInTheDocument();
    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });
});
