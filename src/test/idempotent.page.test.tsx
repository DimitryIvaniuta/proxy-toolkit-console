import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// mock API call used by the hook
vi.mock("../../lib/api", async (importOriginal) => {
    const mod = await importOriginal<any>();
    return {
        ...mod,
        demoIdempotent: vi.fn(),
    };
});

import { demoIdempotent } from "../../lib/api";
import IdempotentPage from "../../app/demo/idempotent/page";

const demoIdempotentMock = demoIdempotent as unknown as ReturnType<typeof vi.fn>;

function renderWithQueryClient() {
    const qc = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={qc}>
            <IdempotentPage />
        </QueryClientProvider>
    );
}

describe("Idempotent demo page", () => {
    beforeEach(() => {
        demoIdempotentMock.mockReset();

        let seq = 0;
        const randomUUID = vi.fn(() => `uuid-${++seq}`);

        vi.stubGlobal("crypto", { randomUUID } as any);

        // needed for "New key" button (newIdempotencyKey uses crypto.randomUUID)
        // vi.stubGlobal("crypto", { randomUUID: () => "uuid-1" } as any);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("sends request using demoIdempotent(body, key) and shows response", async () => {
        demoIdempotentMock.mockResolvedValue({
            paymentId: "p-1",
            amount: 250,
            currency: "EUR",
        });

        renderWithQueryClient();

        fireEvent.change(screen.getByPlaceholderText("Amount"), { target: { value: "250" } });
        fireEvent.change(screen.getByPlaceholderText("Currency"), { target: { value: "EUR" } });
        fireEvent.change(screen.getByPlaceholderText("X-Idempotency-Key"), { target: { value: "k-123" } });

        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        await waitFor(() => {
            expect(demoIdempotentMock).toHaveBeenCalledWith(
                { amount: 250, currency: "EUR" },
                "k-123"
            );
        });

        // response rendered
        expect(await screen.findByText(/"paymentId":\s*"p-1"/)).toBeInTheDocument();
    });

    it("generates a new idempotency key when clicking 'New key'", () => {
        renderWithQueryClient();

        const key = screen.getByPlaceholderText("X-Idempotency-Key") as HTMLInputElement;

        const first = key.value;
        expect(first).toMatch(/^idem-uuid-\d+$/);

        fireEvent.click(screen.getByRole("button", { name: "New key" }));

        expect(key.value).toMatch(/^idem-uuid-\d+$/);
        expect(key.value).not.toBe(first);
    });

    it("disables Send when idempotency key is blank", () => {
        renderWithQueryClient();

        fireEvent.change(screen.getByPlaceholderText("X-Idempotency-Key"), { target: { value: "   " } });
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    });

    it("disables Send when amount is not a number", () => {
        renderWithQueryClient();

        fireEvent.change(screen.getByPlaceholderText("Amount"), { target: { value: "abc" } });
        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    });

    it("Reset clears displayed response", async () => {
        demoIdempotentMock.mockResolvedValue({
            paymentId: "p-2",
            amount: 100,
            currency: "PLN",
        });

        renderWithQueryClient();

        fireEvent.click(screen.getByRole("button", { name: "Send" }));
        expect(await screen.findByText(/"paymentId":\s*"p-2"/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Reset" }));

        await waitFor(() => {
            expect(screen.queryByText(/"paymentId":/)).not.toBeInTheDocument();
        });
    });
});
