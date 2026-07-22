import { TicketStatus } from "@/app/generated/prisma";
import {
  InvalidStatusTransitionError,
  assertTransition,
  canTransition,
  getValidTransitions,
} from "@/lib/ticket-state-machine";

describe("ticket-state-machine (unit)", () => {
  describe("canTransition", () => {
    it.each([
      [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, true],
      [TicketStatus.OPEN, TicketStatus.CANCELLED, true],
      [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, true],
      [TicketStatus.RESOLVED, TicketStatus.CLOSED, true],
      [TicketStatus.CLOSED, TicketStatus.OPEN, true],
      [TicketStatus.OPEN, TicketStatus.CLOSED, false],
      [TicketStatus.CANCELLED, TicketStatus.OPEN, false],
    ])("%s → %s returns %s", (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    });
  });

  describe("getValidTransitions", () => {
    it("returns allowed targets for OPEN", () => {
      expect(getValidTransitions(TicketStatus.OPEN)).toEqual([
        TicketStatus.IN_PROGRESS,
        TicketStatus.CANCELLED,
      ]);
    });

    it("returns empty array for CANCELLED", () => {
      expect(getValidTransitions(TicketStatus.CANCELLED)).toEqual([]);
    });

    it("returns reopen for CLOSED", () => {
      expect(getValidTransitions(TicketStatus.CLOSED)).toEqual([
        TicketStatus.OPEN,
      ]);
    });
  });

  describe("assertTransition", () => {
    it("does not throw for valid transition", () => {
      expect(() =>
        assertTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
      ).not.toThrow();
    });

    it("throws InvalidStatusTransitionError for invalid transition", () => {
      expect(() =>
        assertTransition(TicketStatus.OPEN, TicketStatus.CLOSED),
      ).toThrow(InvalidStatusTransitionError);
    });
  });
});
