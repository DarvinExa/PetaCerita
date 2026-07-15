import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("menampilkan label", () => {
    render(<Button>Simpan</Button>);
    expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument();
  });

  it("dinonaktifkan dan aria-busy saat loading", () => {
    render(<Button loading>Simpan</Button>);
    const btn = screen.getByRole("button", { name: "Simpan" });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });
});
