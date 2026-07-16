export const SETTLEMENT_ACTIONS = [
  "SUBMIT",
  "CANCEL",
  "CONFIRM",
  "REJECT",
] as const;

export type SettlementAction = (typeof SETTLEMENT_ACTIONS)[number];
export type SettlementActor = "DEBTOR" | "CREDITOR" | "OTHER";
export type SettlementStatusValue = "UNPAID" | "PENDING" | "CONFIRMED";
export type SettlementEventValue =
  "SUBMITTED" | "CANCELLED" | "CONFIRMED" | "REJECTED";

export type SettlementTransition = {
  nextStatus: SettlementStatusValue;
  event: SettlementEventValue;
};

/** State machine murni untuk mencegah lompatan status atau actor yang salah. */
export function settlementTransition(
  status: SettlementStatusValue,
  action: SettlementAction,
  actor: SettlementActor,
): SettlementTransition | null {
  if (status === "UNPAID" && action === "SUBMIT" && actor === "DEBTOR") {
    return { nextStatus: "PENDING", event: "SUBMITTED" };
  }
  if (status === "PENDING" && action === "CANCEL" && actor === "DEBTOR") {
    return { nextStatus: "UNPAID", event: "CANCELLED" };
  }
  if (status === "PENDING" && action === "CONFIRM" && actor === "CREDITOR") {
    return { nextStatus: "CONFIRMED", event: "CONFIRMED" };
  }
  if (status === "PENDING" && action === "REJECT" && actor === "CREDITOR") {
    return { nextStatus: "UNPAID", event: "REJECTED" };
  }
  return null;
}
