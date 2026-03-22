"use client";

import { Chip } from "@mui/material";
import type { AttendanceStatus } from "@/types";

const label: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  half_day: "Half day",
};

const color: Record<
  AttendanceStatus,
  "success" | "error" | "warning" | "default"
> = {
  present: "success",
  absent: "error",
  late: "warning",
  half_day: "default",
};

export default function StatusBadge({ status }: { status: AttendanceStatus }) {
  return <Chip size="small" label={label[status]} color={color[status]} variant="outlined" />;
}
