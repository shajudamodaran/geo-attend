"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/attendance/StatusBadge";
import type { AttendanceStatus } from "@/types";

type Row = {
  _id: string;
  date: string;
  status: AttendanceStatus;
  totalHours?: number;
  checkIn?: { location?: { address?: string } };
};

export default function EmployeeHistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/me/attendance", { cache: "no-store" });
        if (!res.ok) throw new Error("bad");
        const j = (await res.json()) as { rows: Row[] };
        setRows(j.rows);
      } catch {
        setError("History could not be loaded offline or without a session.");
      }
    })();
  }, []);

  return (
    <Box sx={{ p: 2, maxWidth: 560, mx: "auto", pb: 10 }}>
      <Typography variant="h5" fontWeight={900} mb={1}>
        My attendance
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Every entry shows the status GeoAttend calculated from your GPS and shop hours.
      </Typography>
      {error ? <Typography color="error">{error}</Typography> : null}
      <Stack spacing={1.5}>
        {rows.map((r) => (
          <Card key={r._id} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <div>
                  <Typography fontWeight={800}>{r.date}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.checkIn?.location?.address ?? "GPS verified check-in"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    Hours logged: {r.totalHours ?? "—"}
                  </Typography>
                </div>
                <StatusBadge status={r.status} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
