"use client";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";
import StatusBadge from "@/components/attendance/StatusBadge";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import ExportButton from "@/components/reports/ExportButton";
import type { AttendanceStatus } from "@/types";

type Row = {
  _id: string;
  employeeId: { name: string; avatar?: string };
  date: string;
  checkIn?: { time?: string; location?: { address?: string; lat: number; lng: number }; photo?: string };
  checkOut?: { time?: string };
  totalHours?: number;
  status: AttendanceStatus;
};

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 14);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function AttendanceLogPage() {
  const [{ from, to }, setRange] = useState(defaultRange);
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [employees, setEmployees] = useState<{ _id: string; name: string }[]>([]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("from", from);
    p.set("to", to);
    p.set("page", String(page + 1));
    p.set("limit", String(rowsPerPage));
    if (employeeId) p.set("employeeId", employeeId);
    if (status) p.set("status", status);
    return p.toString();
  }, [from, to, page, rowsPerPage, employeeId, status]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/attendance?${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      const j = (await res.json()) as { rows: Row[]; total: number };
      setRows(j.rows);
      setTotal(j.total);
    } catch {
      setError("Attendance log failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [query]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/employees", { cache: "no-store" });
      if (!res.ok) return;
      const j = (await res.json()) as { employees: { _id: string; name: string }[] };
      setEmployees(j.employees);
    })();
  }, []);

  const exportCsv = () => {
    const header = ["Employee", "Date", "Check-in", "Check-out", "Hours", "Status"];
    const lines = rows.map((r) => [
      r.employeeId.name,
      r.date,
      r.checkIn?.time ? new Date(r.checkIn.time).toISOString() : "",
      r.checkOut?.time ? new Date(r.checkOut.time).toISOString() : "",
      String(r.totalHours ?? ""),
      r.status,
    ]);
    const csv = [header, ...lines].map((l) => l.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "geoattend-attendance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowBg = (s: AttendanceStatus) =>
    s === "present" ? "rgba(22,163,74,0.08)" : s === "late" ? "rgba(217,119,6,0.10)" : s === "absent" ? "rgba(220,38,38,0.08)" : "transparent";

  const pdfHref = `/api/reports/pdf?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${
    employeeId ? `&employeeIds=${encodeURIComponent(employeeId)}` : ""
  }`;

  return (
    <>
      <Topbar title="Attendance log" />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Dense attendance ledger"
          subtitle="Every check-in keeps the GPS trace and optional photo your auditor expects."
          action={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <ExportButton href={pdfHref} label="Export PDF" />
              <Button variant="outlined" onClick={exportCsv}>
                Export CSV
              </Button>
            </Stack>
          }
        />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
          <TextField type="date" label="From" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setRange({ from: e.target.value, to })} />
          <TextField type="date" label="To" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setRange({ from, to: e.target.value })} />
          <TextField select label="Employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} sx={{ minWidth: 220 }}>
            <MenuItem value="">All</MenuItem>
            {employees.map((e) => (
              <MenuItem key={e._id} value={e._id}>
                {e.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as AttendanceStatus | "")} sx={{ minWidth: 180 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="present">Present</MenuItem>
            <MenuItem value="late">Late</MenuItem>
            <MenuItem value="absent">Absent</MenuItem>
            <MenuItem value="half_day">Half day</MenuItem>
          </TextField>
        </Stack>
        {error ? (
          <Alert severity="error" action={<Button onClick={() => void load()}>Retry</Button>} sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Box sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Photo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? null
                : rows.map((r) => (
                    <TableRow key={r._id} sx={{ bgcolor: rowBg(r.status) }}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmployeeAvatar name={r.employeeId.name} src={r.employeeId.avatar} />
                          <Typography fontWeight={700}>{r.employeeId.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>
                        {r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {r.checkIn?.location?.address ?? "GPS capture"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"}
                      </TableCell>
                      <TableCell>{r.totalHours ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>
                        {r.checkIn?.photo ? (
                          <Button size="small" onClick={() => setPhoto(r.checkIn?.photo ?? null)}>
                            View
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
          />
        </Box>
        <Dialog open={Boolean(photo)} onClose={() => setPhoto(null)} maxWidth="md" fullWidth>
          <DialogContent>{photo ? <Box component="img" src={photo} alt="Attendance" sx={{ width: "100%" }} /> : null}</DialogContent>
        </Dialog>
      </Box>
    </>
  );
}
