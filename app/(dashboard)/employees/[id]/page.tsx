"use client";

import { Alert, Box, Button, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";
import StatusBadge from "@/components/attendance/StatusBadge";
import Topbar from "@/components/layout/Topbar";
import { Skeleton } from "@mui/material";
import type { AttendanceStatus } from "@/types";

type Recent = {
  _id: string;
  date: string;
  status: AttendanceStatus;
  totalHours?: number;
};

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<{ name: string; phone: string; department: string; role: string; avatar?: string } | null>(null);
  const [stats, setStats] = useState<{ present: number; absent: number; late: number; half_day: number } | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      const j = (await res.json()) as {
        employee: { name: string; phone: string; department: string; role: string; avatar?: string };
        stats: { present: number; absent: number; late: number; half_day: number };
        recent: Recent[];
      };
      setEmployee(j.employee);
      setStats(j.stats);
      setRecent(j.recent);
    } catch {
      setError("Profile could not be opened.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const heat = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const r of recent) map.set(r.date, r.status);
    const out: { key: string; status: AttendanceStatus | "empty" }[] = [];
    const today = new Date();
    for (let i = 34; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ key, status: map.get(key) ?? "empty" });
    }
    return out;
  }, [recent]);

  const deactivate = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("bad");
      router.push("/employees");
      router.refresh();
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Topbar title="Team profile" />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {error ? (
          <Alert severity="error" action={<Button onClick={() => void load()}>Retry</Button>}>
            {error}
          </Alert>
        ) : null}
        {loading || !employee ? (
          <Skeleton variant="rounded" height={220} />
        ) : (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <EmployeeAvatar name={employee.name} src={employee.avatar} />
              </Grid>
              <Grid item xs>
                <Typography variant="h5" fontWeight={900}>
                  {employee.name}
                </Typography>
                <Typography color="text.secondary">{employee.department}</Typography>
                <Typography color="text.secondary">{employee.phone}</Typography>
              </Grid>
              <Grid item xs={12} md="auto">
                <Button color="error" variant="outlined" onClick={() => setConfirmOpen(true)}>
                  Deactivate
                </Button>
              </Grid>
            </Grid>
            <Typography variant="subtitle2" color="text.secondary" mt={3} mb={1}>
              Last 35 days heatmap
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {heat.map((h) => {
                const color =
                  h.status === "present"
                    ? "#16A34A"
                    : h.status === "late"
                      ? "#D97706"
                      : h.status === "absent"
                        ? "#DC2626"
                        : h.status === "half_day"
                          ? "#93C5FD"
                          : "#E5E7EB";
                return <Box key={h.key} sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} title={h.key} />;
              })}
            </Box>
            {stats ? (
              <Grid container spacing={2} mt={2}>
                <Grid item xs={4}>
                  <Typography variant="h6">{stats.present}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Present
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6">{stats.late}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Late
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6">{stats.absent}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Absent
                  </Typography>
                </Grid>
              </Grid>
            ) : null}
          </Paper>
        )}
        <Typography variant="h6" fontWeight={800} mb={1}>
          Recent log
        </Typography>
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.totalHours ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <ConfirmDialog
          open={confirmOpen}
          title="Deactivate team member?"
          description="They will lose mobile check-in access until you re-enable them in GeoAttend."
          confirmLabel="Deactivate"
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => void deactivate()}
          loading={busy}
        />
      </Box>
    </>
  );
}
