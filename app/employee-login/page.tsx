"use client";

import {
  Alert,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { normalizePhoneDigits } from "@/lib/phone";

const LAST_PHONE_KEY = "geoattend-employee-phone";
const LAST_BUSINESS_KEY = "geoattend-business-id";

type MatchRow = { businessId: string; businessName: string; employeeName: string };

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pin" | "pick">("pin");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(LAST_PHONE_KEY);
    if (saved && /^\d{10}$/.test(saved)) {
      setPhone(saved);
    }
  }, []);

  const signInWithBusiness = async (businessId: string) => {
    const normalized = normalizePhoneDigits(phone);
    setLoading(true);
    const res = await signIn("employee-pin", {
      businessId,
      phone: normalized,
      pin,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Could not sign in. Try again or check your PIN.");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAST_PHONE_KEY, normalized);
      window.localStorage.setItem(LAST_BUSINESS_KEY, businessId);
    }
    router.push("/checkin");
    router.refresh();
  };

  const lookupWorkplaces = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhoneDigits(phone);
    if (normalized.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    if (pin.length < 4 || pin.length > 6) {
      toast.error("PIN must be 4–6 digits.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/employee-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized, pin }),
      });
      const data = (await res.json()) as { matches?: MatchRow[] };
      const list = Array.isArray(data.matches) ? data.matches : [];
      if (list.length === 0) {
        toast.error("No workplace found for this mobile and PIN.");
        return;
      }
      if (list.length === 1) {
        await signInWithBusiness(list[0].businessId);
        return;
      }
      setMatches(list);
      setStep("pick");
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBackToPin = () => {
    setStep("pin");
    setMatches([]);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2, bgcolor: "background.default" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 440, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={900}>
          Employee login
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {step === "pin"
            ? "Enter the mobile number and PIN your manager set in GeoAttend. If you work for more than one company here, you’ll pick the right workplace next."
            : "Choose where you’re checking in today."}
        </Typography>

        {step === "pin" ? (
          <>
            <Alert severity="info" sx={{ mt: 2 }}>
              Demo (after seed): any seeded employee PIN is <strong>1234</strong>.
            </Alert>
            <Box component="form" onSubmit={(e) => void lookupWorkplaces(e)} mt={2}>
              <Stack spacing={2}>
                <TextField
                  label="Mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  fullWidth
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit mobile"
                />
                <TextField
                  label="PIN"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  fullWidth
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                  {loading ? "Checking…" : "Continue"}
                </Button>
              </Stack>
            </Box>
          </>
        ) : (
          <Stack spacing={2} mt={2}>
            <List disablePadding sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
              {matches.map((m) => (
                <ListItemButton
                  key={m.businessId}
                  disabled={loading}
                  onClick={() => void signInWithBusiness(m.businessId)}
                  sx={{ alignItems: "flex-start", py: 1.5 }}
                >
                  <ListItemText
                    primary={m.businessName}
                    secondary={`Continue as ${m.employeeName}`}
                    primaryTypographyProps={{ fontWeight: 700 }}
                    secondaryTypographyProps={{ variant: "body2" }}
                  />
                </ListItemButton>
              ))}
            </List>
            <Button variant="outlined" fullWidth disabled={loading} onClick={goBackToPin}>
              Back to mobile &amp; PIN
            </Button>
          </Stack>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", lineHeight: 1.65 }}>
          Business owner?{" "}
          <Button
            component={Link}
            href="/login"
            variant="text"
            color="secondary"
            sx={{ p: 0, minWidth: 0, fontWeight: 700, verticalAlign: "baseline", textTransform: "none", fontSize: "inherit" }}
          >
            Sign in to the dashboard
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
}
