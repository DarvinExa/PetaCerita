import { describe, expect, it } from "vitest";
import { settlementTransition } from "./settlement-state";

describe("settlementTransition", () => {
  it("debitur dapat mengirim konfirmasi transfer", () => {
    expect(settlementTransition("UNPAID", "SUBMIT", "DEBTOR")).toEqual({
      nextStatus: "PENDING",
      event: "SUBMITTED",
    });
  });

  it("kreditur dapat mengonfirmasi atau menolak status pending", () => {
    expect(settlementTransition("PENDING", "CONFIRM", "CREDITOR")).toEqual({
      nextStatus: "CONFIRMED",
      event: "CONFIRMED",
    });
    expect(settlementTransition("PENDING", "REJECT", "CREDITOR")).toEqual({
      nextStatus: "UNPAID",
      event: "REJECTED",
    });
  });

  it("debitur dapat membatalkan permintaan yang masih pending", () => {
    expect(settlementTransition("PENDING", "CANCEL", "DEBTOR")).toEqual({
      nextStatus: "UNPAID",
      event: "CANCELLED",
    });
  });

  it("menolak actor dan lompatan status yang tidak sah", () => {
    expect(settlementTransition("UNPAID", "CONFIRM", "CREDITOR")).toBeNull();
    expect(settlementTransition("PENDING", "CONFIRM", "DEBTOR")).toBeNull();
    expect(settlementTransition("CONFIRMED", "SUBMIT", "DEBTOR")).toBeNull();
    expect(settlementTransition("PENDING", "REJECT", "OTHER")).toBeNull();
  });
});
