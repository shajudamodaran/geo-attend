import type { AttendanceStatus } from "@/types";

export function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseTimeToToday(baseDate: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const out = new Date(baseDate);
  out.setHours(h ?? 0, m ?? 0, 0, 0);
  return out;
}

export function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function deriveStatus(params: {
  checkInTime: Date;
  workStartTime: string;
  graceMinutes: number;
  hasCheckout: boolean;
  hoursWorked?: number;
}): AttendanceStatus {
  const start = parseTimeToToday(params.checkInTime, params.workStartTime);
  const graceEnd = new Date(start.getTime() + params.graceMinutes * 60 * 1000);
  let status: AttendanceStatus = params.checkInTime > graceEnd ? "late" : "present";
  if (params.hasCheckout && params.hoursWorked !== undefined && params.hoursWorked < 4) {
    status = "half_day";
  }
  return status;
}
