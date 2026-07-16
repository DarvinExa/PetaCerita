import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./redirects";

describe("safeInternalPath", () => {
  it("mempertahankan path internal beserta query", () => {
    expect(safeInternalPath("/join/token?from=login")).toBe(
      "/join/token?from=login",
    );
  });

  it.each([
    "https://evil.example",
    "//evil.example/path",
    "/\\evil.example",
    "dashboard",
  ])("menolak redirect eksternal %s", (value) => {
    expect(safeInternalPath(value)).toBe("/dashboard");
  });
});
