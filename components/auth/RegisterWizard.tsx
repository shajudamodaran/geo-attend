"use client";

import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { registerSchema } from "@/lib/schemas";

const steps = ["Business", "Owner", "Team"];

export default function RegisterWizard() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    businessName: "",
    businessType: "Field services" as "Field services" | "Retail" | "Services" | "Manufacturing" | "Other",
    city: "",
    ownerName: "",
    phone: "",
    email: "",
    password: "",
    teamSize: "6–15",
  });

  const summary = useMemo(() => values, [values]);

  const next = () => setActive((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setActive((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      toast.error(typeof j.error === "string" ? j.error : "Registration failed");
      return;
    }
    toast.success("Welcome to GeoAttend — sign in with your new owner account.");
    router.push("/login");
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 6, px: 2, bgcolor: "background.default" }}>
      <Paper sx={{ maxWidth: 720, mx: "auto", p: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={900}>
          Register your business
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          For teams that work outside one desk — field crews, service routes, retail floors, and hybrid ops. Replace paper registers with map-backed attendance.
        </Typography>
        <Stepper activeStep={active} sx={{ mt: 4, mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {active === 0 ? (
          <Stack spacing={2}>
            <TextField label="Business name" value={values.businessName} onChange={(e) => setValues({ ...values, businessName: e.target.value })} fullWidth required />
            <TextField select label="Business type" value={values.businessType} onChange={(e) => setValues({ ...values, businessType: e.target.value as typeof values.businessType })} fullWidth>
              <MenuItem value="Field services">Field &amp; mobile teams</MenuItem>
              <MenuItem value="Retail">Retail &amp; storefront</MenuItem>
              <MenuItem value="Services">Professional services</MenuItem>
              <MenuItem value="Manufacturing">Manufacturing &amp; logistics</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField label="City" value={values.city} onChange={(e) => setValues({ ...values, city: e.target.value })} fullWidth required />
          </Stack>
        ) : null}

        {active === 1 ? (
          <Stack spacing={2}>
            <TextField label="Owner name" value={values.ownerName} onChange={(e) => setValues({ ...values, ownerName: e.target.value })} fullWidth required />
            <TextField label="Mobile (10 digits)" value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} fullWidth required />
            <TextField label="Work email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} fullWidth required />
            <TextField
              label="Password"
              type="password"
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              fullWidth
              required
              helperText="Minimum 8 characters with at least one special character."
            />
          </Stack>
        ) : null}

        {active === 2 ? (
          <Stack spacing={2}>
            <TextField select label="Team size" value={values.teamSize} onChange={(e) => setValues({ ...values, teamSize: e.target.value })} fullWidth>
              <MenuItem value="1–5">1–5</MenuItem>
              <MenuItem value="6–15">6–15</MenuItem>
              <MenuItem value="16–50">16–50</MenuItem>
              <MenuItem value="50+">50+</MenuItem>
            </TextField>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography fontWeight={800}>Summary</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {summary.businessName} · {summary.businessType} · {summary.city}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Owner {summary.ownerName} ({summary.email})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team size {summary.teamSize}
              </Typography>
            </Paper>
          </Stack>
        ) : null}

        <Stack direction="row" justifyContent="space-between" mt={4}>
          <Button disabled={active === 0} onClick={back}>
            Back
          </Button>
          {active < steps.length - 1 ? (
            <Button variant="contained" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button variant="contained" onClick={() => void submit()} disabled={loading}>
              {loading ? "Creating…" : "Create GeoAttend workspace"}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
