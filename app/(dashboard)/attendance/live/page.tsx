"use client";

import { Box, Card, CardContent, Chip, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { MapPinItem } from "@/components/dashboard/LiveMapInner";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import { Alert, Button, Skeleton } from "@mui/material";

const AttendanceLiveMap = dynamic(() => import("@/components/dashboard/AttendanceLiveMap"), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={560} />,
});

type LivePayload = {
  items: {
    employee: { _id: string; name: string };
    attendance: null | {
      checkIn?: { time?: string; location?: { lat: number; lng: number }; photo?: string };
    };
    checkedIn: boolean;
  }[];
  center: { lat: number; lng: number };
};

function stableOffset(id: string, center: { lat: number; lng: number }) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = Math.imul(31, h) + id.charCodeAt(i);
  }
  const dx = ((h % 200) - 100) / 8000;
  const dy = (((Math.floor(h / 7) % 200) - 100) / 8000) as number;
  return { lat: center.lat + dx, lng: center.lng + dy };
}

export default function LiveAttendancePage() {
  const [live, setLive] = useState<LivePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attendance/live", { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      setLive((await res.json()) as LivePayload);
    } catch {
      setError("Live map could not load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pins: MapPinItem[] = useMemo(() => {
    if (!live) return [];
    const center = live.center;
    return live.items.map((it) => {
      const loc = it.attendance?.checkIn?.location;
      const pos = loc ?? stableOffset(String(it.employee._id), center);
      const t = it.attendance?.checkIn?.time;
      return {
        id: String(it.employee._id),
        name: it.employee.name,
        lat: pos.lat,
        lng: pos.lng,
        checkedIn: it.checkedIn,
        timeLabel: t
          ? new Date(t).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })
          : undefined,
        photoThumb: it.attendance?.checkIn?.photo,
      };
    });
  }, [live]);

  return (
    <>
      <Topbar title="Live map" />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Field and counter visibility"
          subtitle="Green markers are actively checked in — grey markers have not opened the GeoAttend mobile flow yet."
        />
        {error ? (
          <Alert severity="error" action={<Button onClick={() => void load()}>Retry</Button>} sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <Box flex={1}>
            {loading ? <Skeleton variant="rounded" height={560} /> : <AttendanceLiveMap items={pins} />}
          </Box>
          <Card variant="outlined" sx={{ width: { xs: "100%", lg: 360 }, borderRadius: 2, height: "fit-content" }}>
            <CardContent>
              <Typography fontWeight={800} mb={1}>
                Team status
              </Typography>
              <List dense>
                {live?.items.map((it) => (
                  <ListItem key={String(it.employee._id)} disableGutters>
                    <ListItemText
                      primary={it.employee.name}
                      secondary={it.checkedIn ? "Checked in" : "Not checked in"}
                    />
                    <Chip size="small" label={it.checkedIn ? "Live" : "Idle"} color={it.checkedIn ? "success" : "default"} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}
