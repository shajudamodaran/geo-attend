"use client";

import { Alert, Box, Button, Divider, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("owner-credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Those details do not match a GeoAttend owner account.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          p: 6,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="h3" fontWeight={900}>
          Trusted by Kerala&apos;s gold traders
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, opacity: 0.9, maxWidth: 420 }}>
          GeoAttend pins every check-in to a real map coordinate with a photo receipt — built for jewellery showrooms, bullion counters, and field sales routes.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
        <Paper elevation={0} sx={{ p: 4, width: "100%", maxWidth: 440, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h5" fontWeight={800}>
            Sign in to GeoAttend
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Demo owner: <strong>demo@geoattend.in</strong> / <strong>Demo@1234</strong> after running the seed script.
          </Typography>
          {googleEnabled ? (
            <>
              <Button fullWidth variant="outlined" sx={{ mt: 3 }} onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                Continue with Google
              </Button>
              <Divider sx={{ my: 3 }}>or</Divider>
            </>
          ) : null}
          <Box component="form" onSubmit={(e) => void onSubmit(e)}>
            <Stack spacing={2}>
              <TextField label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth autoComplete="email" />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth autoComplete="current-password" />
              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </Box>
          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Typography variant="body2" component={Link} href="/register" sx={{ color: "secondary.dark", fontWeight: 700 }}>
              Create business
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Forgot password? Email support@geoattend.in
            </Typography>
          </Stack>
          <Alert severity="info" sx={{ mt: 3 }}>
            Team members should use the dedicated employee login to open the mobile check-in PWA.
          </Alert>
        </Paper>
      </Grid>
    </Grid>
  );
}
