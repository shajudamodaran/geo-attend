/**
 * Auth is backed by {@link import("./Business")} (owners) and {@link import("./Employee")} (team PIN).
 * This module re-exports types for clarity with the product spec.
 */
export type { Business as UserOwner } from "./Business";
