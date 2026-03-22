"use client";

import { MenuItem, Stack, TextField } from "@mui/material";

export default function ReportFilters({
  from,
  to,
  reportType,
  onChange,
}: {
  from: string;
  to: string;
  reportType: "daily" | "monthly" | "individual";
  onChange: (patch: Partial<{ from: string; to: string; reportType: "daily" | "monthly" | "individual" }>) => void;
}) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <TextField type="date" label="From" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => onChange({ from: e.target.value })} />
      <TextField type="date" label="To" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => onChange({ to: e.target.value })} />
      <TextField select label="Report type" value={reportType} onChange={(e) => onChange({ reportType: e.target.value as "daily" | "monthly" | "individual" })}>
        <MenuItem value="daily">Daily summary</MenuItem>
        <MenuItem value="monthly">Monthly payroll</MenuItem>
        <MenuItem value="individual">Individual trail</MenuItem>
      </TextField>
    </Stack>
  );
}
