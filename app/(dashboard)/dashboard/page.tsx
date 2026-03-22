"use client";

import { Alert, Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import AttendanceChart from "@/components/dashboard/AttendanceChart";
import LiveMapWidget from "@/components/dashboard/LiveMapWidget";
import type { MapPinItem } from "@/components/dashboard/LiveMapInner";
import RecentActivity from "@/components/dashboard/RecentActivity";
import StatsCard from "@/components/dashboard/StatsCard";
import PageHeader from "@/components/ui/PageHeader";
import { CardSkeleton, StatsRowSkeleton } from "@/components/ui/LoadingSkeleton";
import Topbar from "@/components/layout/Topbar";
import type { AttendanceStatus } from "@/types";

type StatsPayload = {
  cards: {
    todayPresent: number;
    todayAbsent: number;
    currentlyCheckedIn: number;
    lateArrivals: number;
    savingsInr: number;
  };
  chart14: { date: string; present: number }[];
  topPerformer: { name: string; score: number } | null;
  recent: {
    _id: string;
    status: AttendanceStatus;
    checkIn?: { time?: string };
    employeeId?: { name?: string; avatar?: string };
  }[];
};

type LivePayload = {
  items: {
    employee: { _id: string; name: string };
    attendance: null | {
      checkIn?: { time?: string; location?: { lat: number; lng: number } };
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

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [live, setLive] = useState<LivePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, l] = await Promise.all([
        fetch("/api/reports/stats", { cache: "no-store" }),
        fetch("/api/attendance/live", { cache: "no-store" }),
      ]);
      if (!s.ok || !l.ok) throw new Error("bad");
      setStats((await s.json()) as StatsPayload);
      setLive((await l.json()) as LivePayload);
    } catch {
      setError("We could not reach your GeoAttend workspace. Retry when you are online.");
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
      };
    });
  }, [live]);

  const recentRows = useMemo(() => {
    if (!stats) return [];
    return stats.recent.map((r) => ({
      id: String(r._id),
      name: r.employeeId?.name ?? "Team member",
      avatar: r.employeeId?.avatar,
      timeLabel: r.checkIn?.time
        ? new Date(r.checkIn.time).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })
        : "—",
      status: r.status,
    }));
  }, [stats]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.chart14.map((d) => ({
      date: d.date.slice(5),
      present: d.present,
    }));
  }, [stats]);

  return (
    <>
      <Topbar title="Owner dashboard" />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Today on your shop floor"
          subtitle="Live map pins, late alerts, and payroll-ready hours — tuned for Kerala jewellery teams."
        />
        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void load()}>
                Retry
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        ) : null}
        {loading || !stats ? <StatsRowSkeleton /> : null}
        {!loading && stats ? (
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Today present" value={stats.cards.todayPresent} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Today absent" value={stats.cards.todayAbsent} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Currently checked in" value={stats.cards.currentlyCheckedIn} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard title="Late arrivals" value={stats.cards.lateArrivals} />
            </Grid>
            <Grid item xs={12}>
              <StatsCard
                title="Field-truth savings (₹)"
                value={`₹${stats.cards.savingsInr.toLocaleString("en-IN")}`}
                hint="Estimated value of prevented proxy check-ins this month at ₹300 per suspicious ping."
              />
            </Grid>
          </Grid>
        ) : null}

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            {loading ? <CardSkeleton /> : <LiveMapWidget items={pins} />}
          </Grid>
          <Grid item xs={12} md={5}>
            {loading ? <CardSkeleton /> : <RecentActivity items={recentRows} />}
          </Grid>
          <Grid item xs={12} md={8}>
            {loading ? <CardSkeleton /> : <AttendanceChart data={chartData} />}
          </Grid>
          <Grid item xs={12} md={4}>
            {!loading && stats?.topPerformer ? (
              <Stack sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Typography variant="overline" color="text.secondary">
                  Top performer (14 days)
                </Typography>
                <Typography variant="h5" fontWeight={900} mt={1}>
                  {stats.topPerformer.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {stats.topPerformer.score} on-time days logged on GeoAttend.
                </Typography>
              </Stack>
            ) : null}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
