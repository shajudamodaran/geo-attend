"use client";

import { Box, Button, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import AddEmployeeModal from "@/components/employees/AddEmployeeModal";
import EmployeeCard from "@/components/employees/EmployeeCard";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@mui/material";
import type { AttendanceStatus } from "@/types";

type EmployeeRow = {
  _id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  avatar?: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [live, setLive] = useState<Record<string, AttendanceStatus | "none">>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [e, l] = await Promise.all([
        fetch("/api/employees", { cache: "no-store" }),
        fetch("/api/attendance/live", { cache: "no-store" }),
      ]);
      if (!e.ok) throw new Error("bad");
      const ej = (await e.json()) as { employees: EmployeeRow[] };
      setEmployees(ej.employees);
      if (l.ok) {
        const lj = (await l.json()) as {
          items: { employee: { _id: string }; attendance: { status?: AttendanceStatus } | null }[];
        };
        const map: Record<string, AttendanceStatus | "none"> = {};
        for (const it of lj.items) {
          map[String(it.employee._id)] = it.attendance?.status ?? "none";
        }
        setLive(map);
      }
    } catch {
      setError("Could not load your team. Retry shortly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return employees.filter((x) => {
      const q = search.trim().toLowerCase();
      const okSearch = !q || x.name.toLowerCase().includes(q) || x.phone.includes(q);
      const okRole = role === "all" || x.role === role;
      return okSearch && okRole;
    });
  }, [employees, search, role]);

  return (
    <>
      <Topbar title="Team" />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader
          title="Your GeoAttend roster"
          subtitle="Field agents, showroom staff, and managers — each with their own PIN-based mobile check-in."
          action={
            <Button variant="contained" onClick={() => setOpen(true)}>
              Add team member
            </Button>
          }
        />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
          <TextField label="Search name or mobile" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
          <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="all">All roles</MenuItem>
            <MenuItem value="field_agent">Field agent</MenuItem>
            <MenuItem value="shop_staff">Shop staff</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </TextField>
        </Stack>
        {error ? (
          <Typography color="error" mb={2}>
            {error}{" "}
            <Button size="small" onClick={() => void load()}>
              Retry
            </Button>
          </Typography>
        ) : null}
        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={200} />
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Add your first team member"
            description="GeoAttend only works when every counter and field route is on the map. Start with your showroom leads and sales riders."
            actionLabel="Add team member"
            onAction={() => setOpen(true)}
          />
        ) : (
          <Grid container spacing={2}>
            {filtered.map((emp) => (
              <Grid item xs={12} sm={6} md={4} key={emp._id}>
                <EmployeeCard
                  id={emp._id}
                  name={emp.name}
                  role={emp.role}
                  department={emp.department}
                  phone={emp.phone}
                  avatar={emp.avatar}
                  todayStatus={live[emp._id] ?? "none"}
                />
              </Grid>
            ))}
          </Grid>
        )}
        <AddEmployeeModal open={open} onClose={() => setOpen(false)} onCreated={() => void load()} />
      </Box>
    </>
  );
}
