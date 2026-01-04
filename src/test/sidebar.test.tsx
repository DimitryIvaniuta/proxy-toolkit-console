import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/demo/cache",
}));

describe("Sidebar", () => {
  it("renders navigation items", async () => {
    const { Sidebar } = await import("../../components/layout/Sidebar");
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Cache")).toBeInTheDocument();
    expect(screen.getByText("Idempotency")).toBeInTheDocument();
    expect(screen.getByText("Rate Limit")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
    expect(screen.getByText("API Clients")).toBeInTheDocument();
  });
});
