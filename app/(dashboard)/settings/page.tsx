"use client";

import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import { Alert, Skeleton } from "@mui/material";

const GeofencePicker = dynamic(() => import("@/components/settings/GeofencePicker"), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={320} />,
});

type Business = {
  name: string;
  address: string;
  phone: string;
  logoUrl?: string;
  geofenceRadius: number;
  geofenceCenter: { lat: number; lng: number };
  workStartTime: string;
  workEndTime: string;
  graceMinutes: number;
  workingDays: boolean[];
  notifications: { lateAlerts: boolean; absenceAlerts: boolean; weeklyReportEmail: boolean };
};

export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/business", { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      const j = (await res.json()) as { business: Business };
      setBusiness(j.business);
    } catch {
      setError("Settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (patch: Partial<Business> & Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("bad");
      toast.success("Saved to GeoAttend.");
      await load();
    } catch {
      toast.error("Save failed — try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !business) {
    return (
      <>
        <Topbar title="Settings" />
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rounded" height={420} />
        </Box>
      </>
    );
  }

  return (
    <>
      <Topbar title="Settings" />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <PageHeader title="Workplace controls" subtitle="Profile, geofence, hours, and alerts — what your field and floor teams run on daily." />
        {error ? (
          <Alert severity="error" action={<Button onClick={() => void load()}>Retry</Button>} sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Business profile" />
          <Tab label="Geofence" />
          <Tab label="Work hours" />
          <Tab label="Notifications" />
        </Tabs>
        {tab === 0 ? (
          <Stack spacing={2} maxWidth={560}>
            <TextField label="Business name" value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} fullWidth />
            <TextField label="Address" value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} fullWidth multiline minRows={2} />
            <TextField label="Contact phone" value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} fullWidth />
            <TextField label="Logo URL (Cloudinary)" value={business.logoUrl ?? ""} onChange={(e) => setBusiness({ ...business, logoUrl: e.target.value })} fullWidth />
            <Button variant="contained" disabled={saving} onClick={() => void save({ name: business.name, address: business.address, phone: business.phone, logoUrl: business.logoUrl })}>
              Save profile
            </Button>
          </Stack>
        ) : null}
        {tab === 1 ? (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Drag the map or tap a new spot to set your workplace anchor (office, yard, or main site). Combine with the radius slider (50m–2km).
            </Typography>
            <GeofencePicker
              center={business.geofenceCenter}
              radius={business.geofenceRadius}
              onCenterChange={(lat, lng) => setBusiness({ ...business, geofenceCenter: { lat, lng } })}
            />
            <Typography gutterBottom>Radius: {business.geofenceRadius}m</Typography>
            <Slider min={50} max={2000} value={business.geofenceRadius} onChange={(_, v) => setBusiness({ ...business, geofenceRadius: v as number })} />
            <TextField
              label="Quick address lookup (paste coordinates)"
              helperText="Paste 'lat,lng' from Google Maps to jump the pin."
              onBlur={(e) => {
                const raw = e.target.value.trim();
                const parts = raw.split(/[,\s]+/).filter(Boolean);
                if (parts.length >= 2) {
                  const lat = Number(parts[0]);
                  const lng = Number(parts[1]);
                  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                    setBusiness({ ...business, geofenceCenter: { lat, lng } });
                  }
                }
              }}
            />
            <Button
              variant="contained"
              disabled={saving}
              onClick={() =>
                void save({
                  geofenceRadius: business.geofenceRadius,
                  geofenceCenterLat: business.geofenceCenter.lat,
                  geofenceCenterLng: business.geofenceCenter.lng,
                })
              }
            >
              Save geofence
            </Button>
          </Stack>
        ) : null}
        {tab === 2 ? (
          <Stack spacing={2} maxWidth={560}>
            <TextField
              label="Workday start"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={business.workStartTime}
              onChange={(e) => setBusiness({ ...business, workStartTime: e.target.value })}
            />
            <TextField
              label="Workday end"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={business.workEndTime}
              onChange={(e) => setBusiness({ ...business, workEndTime: e.target.value })}
            />
            <TextField
              label="Grace minutes"
              type="number"
              value={business.graceMinutes}
              onChange={(e) => setBusiness({ ...business, graceMinutes: Number(e.target.value) })}
            />
            <Typography fontWeight={700}>Working week</Typography>
            <Grid container spacing={1}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, idx) => (
                <Grid item xs={6} sm={4} key={d}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(business.workingDays[idx])}
                        onChange={(e) => {
                          const next = [...business.workingDays];
                          next[idx] = e.target.checked;
                          setBusiness({ ...business, workingDays: next });
                        }}
                      />
                    }
                    label={d}
                  />
                </Grid>
              ))}
            </Grid>
            <Button
              variant="contained"
              disabled={saving}
              onClick={() =>
                void save({
                  workStartTime: business.workStartTime,
                  workEndTime: business.workEndTime,
                  graceMinutes: business.graceMinutes,
                  workingDays: business.workingDays,
                })
              }
            >
              Save hours
            </Button>
          </Stack>
        ) : null}
        {tab === 3 ? (
          <Stack spacing={2} maxWidth={560}>
            <FormControlLabel
              control={
                <Switch
                  checked={business.notifications.lateAlerts}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      notifications: { ...business.notifications, lateAlerts: e.target.checked },
                    })
                  }
                />
              }
              label="Late arrival SMS / email"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={business.notifications.absenceAlerts}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      notifications: { ...business.notifications, absenceAlerts: e.target.checked },
                    })
                  }
                />
              }
              label="Absence alerts for no check-in"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={business.notifications.weeklyReportEmail}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      notifications: { ...business.notifications, weeklyReportEmail: e.target.checked },
                    })
                  }
                />
              }
              label="Weekly payroll preview email"
            />
            <Button variant="contained" disabled={saving} onClick={() => void save({ notifications: business.notifications })}>
              Save notifications
            </Button>
          </Stack>
        ) : null}
      </Box>
    </>
  );
}
