"use client";

import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import CheckInFlow from "@/components/attendance/CheckInFlow";

type Row = {
  _id: string;
  date: string;
  checkIn?: { time?: string };
  checkOut?: { time?: string };
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function CheckInPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me/attendance", { cache: "no-store" });
      if (!res.ok) return;
      const j = (await res.json()) as { rows: Row[] };
      setRows(j.rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const todayRow = useMemo(() => rows.find((r) => r.date === todayKey()), [rows]);
  const hasOpenCheckIn = Boolean(todayRow?.checkIn && !todayRow?.checkOut);

  return (
    <Box sx={{ p: 2, maxWidth: 560, mx: "auto" }}>
      <Typography variant="h5" fontWeight={900} mb={1}>
        GeoAttend check-in
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Built for Kerala jewellery teams — GPS + photo in one flow, even when the showroom Wi-Fi flickers.
      </Typography>
      {loading ? (
        <Typography color="text.secondary">Loading your shift…</Typography>
      ) : (
        <CheckInFlow
          todayAttendanceId={todayRow?._id}
          hasOpenCheckIn={hasOpenCheckIn}
          onCompleted={() => void load()}
        />
      )}
    </Box>
  );
}
