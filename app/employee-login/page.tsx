"use client";

import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const STORAGE_KEY = "geoattend-business-id";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  });
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("employee-pin", {
      businessId,
      phone,
      pin,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("PIN or mobile does not match this business on GeoAttend.");
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, businessId);
    router.push("/checkin");
    router.refresh();
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2, bgcolor: "background.default" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 420, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={900}>
          Employee login
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Use the mobile number and PIN your owner set inside GeoAttend. After seeding, Business ID prints in the terminal — we remember it on this device.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Demo PIN for every seeded employee: <strong>1234</strong>
        </Alert>
        <Box component="form" onSubmit={(e) => void submit(e)} mt={2}>
          <Stack spacing={2}>
            <TextField label="Business ID" value={businessId} onChange={(e) => setBusinessId(e.target.value)} required fullWidth />
            <TextField label="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required fullWidth />
            <TextField label="PIN" type="password" value={pin} onChange={(e) => setPin(e.target.value)} required fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? "Signing in…" : "Open check-in"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
