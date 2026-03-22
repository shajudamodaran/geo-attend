"use client";

import { Box, Button, Divider, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
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
          Attendance that travels with your team
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, opacity: 0.9, maxWidth: 440, lineHeight: 1.65 }}>
          GeoAttend ties every check-in to a map pin and optional photo proof — for any business with people on the road, at job sites, or between branches. Works offline-first when signal drops.
        </Typography>
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 5, md: 8 },
          py: { xs: 5, sm: 6, md: 10 },
          bgcolor: "background.default",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5, md: 6 },
            width: "100%",
            maxWidth: 440,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 12px 40px rgba(17, 24, 39, 0.06)",
          }}
        >
          <Stack spacing={4} alignItems="stretch">
            <Stack spacing={1.25} alignItems="flex-start">
              <Typography
                variant="overline"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  lineHeight: 1.2,
                }}
              >
                Business owners
              </Typography>
              <Typography
                component="h1"
                variant="h4"
                fontWeight={800}
                sx={{
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                  fontSize: { xs: "1.65rem", sm: "2rem" },
                }}
              >
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, maxWidth: 360 }}>
                Use your work email to open the dashboard, maps, and exports.
              </Typography>
            </Stack>

            {googleEnabled ? (
              <Stack spacing={3}>
                <Button fullWidth variant="outlined" size="large" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
                  Continue with Google
                </Button>
                <Divider>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    or with email
                  </Typography>
                </Divider>
              </Stack>
            ) : null}

            <Box component="form" onSubmit={(e) => void onSubmit(e)} noValidate>
              <Stack spacing={2.5}>
                <TextField label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth autoComplete="email" />
                <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth autoComplete="current-password" />
                <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ py: 1.35, mt: 0.5 }}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </Stack>
            </Box>

            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Divider />
              <Stack spacing={1.5} alignItems="flex-start">
                <Button
                  component={Link}
                  href="/register"
                  variant="text"
                  color="secondary"
                  sx={{ alignSelf: "flex-start", p: 0, minWidth: 0, fontWeight: 700, fontSize: "0.9375rem" }}
                >
                  Create a business account
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  Forgot password?{" "}
                  <Box component="a" href="mailto:support@geoattend.in" sx={{ color: "primary.main", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                    support@geoattend.in
                  </Box>
                </Typography>
                <Button
                  component={Link}
                  href="/employee-login"
                  variant="text"
                  color="primary"
                  sx={{ alignSelf: "flex-start", p: 0, minWidth: 0, fontWeight: 700, fontSize: "0.9375rem", mt: 0.5 }}
                >
                  Employee login (PIN)
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
