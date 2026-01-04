import { render, screen, fireEvent } from "@testing-library/react";
import IdempotentPage from "../../app/demo/idempotent/page";

const mutate = vi.fn();
const reset = vi.fn();

// Mock the hook used by the page so we can assert inputs -> mutation call
vi.mock("../../../lib/hooks", () => ({
    useDemoIdempotent: () => ({
        mutate,
        reset,
        isPending: false,
        error: null,
        data: null,
    }),
}));

// Mock idempotency key generator for deterministic test
vi.mock("../../../lib/idempotency", () => ({
    newIdempotencyKey: () => "idem-new-001",
}));

async function renderPage() {
    const { default: IdempotentPage } = await import("../../app/demo/idempotent/page");
    return render(<IdempotentPage />);
}

describe("Idempotent demo page", () => {
    beforeEach(() => {
        mutate.mockClear();
        reset.mockClear();
    });

    it("renders form fields and sends mutation with body + idempotency key", async () => {
        // render(<IdempotentPage />);
        await renderPage();

        const amount = screen.getByPlaceholderText("Amount") as HTMLInputElement;
        const currency = screen.getByPlaceholderText("Currency") as HTMLInputElement;
        const key = screen.getByPlaceholderText("X-Idempotency-Key") as HTMLInputElement;

        // defaults from the page
        expect(amount.value).toBe("100");
        expect(currency.value).toBe("PLN");
        expect(key.value).toBe("12345");

        fireEvent.change(amount, { target: { value: "250" } });
        fireEvent.change(currency, { target: { value: "EUR" } });
        fireEvent.change(key, { target: { value: "k-123" } });

        const sendBtn = screen.getByRole("button", { name: "Send" });
        expect(sendBtn).not.toBeDisabled();

        fireEvent.click(sendBtn);

        expect(mutate).toHaveBeenCalledTimes(1);
        expect(mutate).toHaveBeenCalledWith({
            body: { amount: 250, currency: "EUR" },
            idempotencyKey: "k-123",
        });
    });

    it("generates a new idempotency key when clicking 'New key'", async () => {
        // render(<IdempotentPage />);
        await renderPage();

        const key = screen.getByPlaceholderText("X-Idempotency-Key") as HTMLInputElement;
        expect(key.value).toBe("12345");

        fireEvent.click(screen.getByRole("button", { name: "New key" }));
        expect(key.value).toBe("idem-new-001");
    });

    it("disables Send when idempotency key is blank", async () => {
        // render(<IdempotentPage />);
        await renderPage();

        const key = screen.getByPlaceholderText("X-Idempotency-Key") as HTMLInputElement;
        fireEvent.change(key, { target: { value: "   " } });

        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    });

    it("disables Send when amount is not a number", async () => {
        // render(<IdempotentPage />);
        await renderPage();

        const amount = screen.getByPlaceholderText("Amount") as HTMLInputElement;
        fireEvent.change(amount, { target: { value: "abc" } });

        expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    });

    it("Reset button calls mutation reset()", async () => {
        // render(<IdempotentPage />);
        await renderPage();

        fireEvent.click(screen.getByRole("button", { name: "Reset" }));
        expect(reset).toHaveBeenCalledTimes(1);
    });
});
