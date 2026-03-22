"use client";

import { Box, Card, CardContent, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ExportButton from "@/components/reports/ExportButton";
import ReportFilters from "@/components/reports/ReportFilters";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import { Alert, Button, Skeleton } from "@mui/material";

type StatsPayload = {
  chart14: { date: string; present: number }[];
};

export default function ReportsPage() {
  const today = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  const [from, setFrom] = useState(defaultFrom.toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const [reportType, setReportType] = useState<"daily" | "monthly" | "individual">("daily");
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reports/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("bad");
        setStats((await res.json()) as StatsPayload);
      } catch {
        setError("Trend data unavailable right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trend = useMemo(
    () =>
      (stats?.chart14 ?? []).map((d) => ({
        date: d.date.slice(5),
        present: d.present,
      })),
    [stats],
  );

  const pdfHref = `/api/reports/pdf?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  return (
    <>
      <Topbar title="Reports" />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Payroll-ready exports"
          subtitle="Daily summaries for shop owners, monthly rollups for accountants, and individual GPS trails for audits."
          action={<ExportButton href={pdfHref} label="Generate PDF" />}
        />
        <ReportFilters
          from={from}
          to={to}
          reportType={reportType}
          onChange={(patch) => {
            if (patch.from) setFrom(patch.from);
            if (patch.to) setTo(patch.to);
            if (patch.reportType) setReportType(patch.reportType);
          }}
        />
        {error ? (
          <Alert severity="warning" sx={{ mt: 2 }} action={<Button onClick={() => window.location.reload()}>Retry</Button>}>
            {error}
          </Alert>
        ) : null}
        <Stack spacing={2} mt={3} direction={{ xs: "column", md: "row" }} sx={{ alignItems: "stretch" }}>
          <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, p: 2, borderRadius: 2 }}>
            <Typography fontWeight={800} mb={1}>
              Report preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {reportType === "daily" && "Daily summary — headcount present vs absent with hours tallied per employee."}
              {reportType === "monthly" && "Monthly payroll — consolidates attendance into a month block for salary processing."}
              {reportType === "individual" && "Individual trail — chronological GPS check-ins with coordinates for compliance."}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={2}>
              Selected window {from} → {to}. PDF includes GeoAttend branding, business header, summary grid, and detailed rows with coordinates.
            </Typography>
          </Paper>
          <Card variant="outlined" sx={{ flex: 1, minWidth: 0, borderRadius: 2 }}>
            <CardContent sx={{ minWidth: 0 }}>
              <Typography fontWeight={800} mb={2}>
                Attendance trend
              </Typography>
              {loading ? <Skeleton variant="rounded" height={240} /> : null}
              {!loading && trend.length ? (
                <Box sx={{ width: "100%", minWidth: 0, height: 240 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={trend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} width={28} />
                      <Tooltip />
                      <Line type="monotone" dataKey="present" stroke="#1B4332" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : null}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </>
  );
}
