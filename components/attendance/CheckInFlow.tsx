"use client";

import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCamera } from "@/hooks/useCamera";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useOfflineSync } from "@/hooks/useOfflineSync";

type Step = 1 | 2 | 3 | 4 | 5;

export default function CheckInFlow({
  todayAttendanceId,
  hasOpenCheckIn,
  onCompleted,
}: {
  todayAttendanceId?: string | null;
  hasOpenCheckIn: boolean;
  onCompleted: () => void;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const employeeId = session?.user?.employeeId;
  const { getPosition, loading: geoLoading } = useGeolocation();
  const { startPreview, stopPreview, capturePhoto, error: camError } = useCamera();
  const { online, enqueue } = useOfflineSync();

  const [step, setStep] = useState<Step>(1);
  const [geo, setGeo] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [geoErr, setGeoErr] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  const deviceInfo = useMemo(() => {
    if (typeof navigator === "undefined") return "";
    return `${navigator.userAgent} | ${navigator.platform}`;
  }, []);

  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  const runGeo = useCallback(async () => {
    setGeoErr(null);
    const res = await getPosition();
    if ("error" in res && res.error) {
      setGeoErr(res.error);
      setGeo(null);
      return;
    }
    if ("lat" in res && res.lat != null && res.lng != null) {
      setGeo({ lat: res.lat, lng: res.lng, accuracy: res.accuracy ?? 0 });
      setStep(3);
    }
  }, [getPosition]);

  useEffect(() => {
    if (step === 2 && !geo && !geoErr) {
      void runGeo();
    }
  }, [step, geo, geoErr, runGeo]);

  useEffect(() => {
    if (step === 3 && videoEl) {
      void startPreview(videoEl);
    }
    if (step !== 3) {
      stopPreview();
    }
  }, [step, videoEl, startPreview, stopPreview]);

  const submitCheckIn = async () => {
    if (!employeeId || !geo) return;
    setSubmitting(true);
    const payload = {
      employeeId,
      lat: geo.lat,
      lng: geo.lng,
      accuracy: geo.accuracy,
      address: "GPS capture",
      photoDataUrl: photo ?? undefined,
      deviceInfo,
    };
    try {
      if (!online) {
        await enqueue(payload);
        toast.success("Saved offline — GeoAttend will sync when you are back online.");
        setStep(5);
        onCompleted();
        return;
      }
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(typeof j.error === "string" ? j.error : "Check-in failed");
      }
      toast.success("You are checked in on the GeoAttend map.");
      setStep(5);
      onCompleted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Check-in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCheckOut = async () => {
    if (!todayAttendanceId || !geo) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attendance/${todayAttendanceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: geo.lat,
          lng: geo.lng,
          accuracy: geo.accuracy,
          address: "GPS capture",
          deviceInfo,
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(typeof j.error === "string" ? j.error : "Check-out failed");
      }
      toast.success("Shift closed — see you tomorrow.");
      onCompleted();
      setStep(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Check-out failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionStatus === "loading") {
    return (
      <Box sx={{ py: 5, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress color="primary" aria-label="Loading session" />
      </Box>
    );
  }

  if (sessionStatus === "unauthenticated" || !employeeId) {
    return <Alert severity="error">Session missing — open Employee login and sign in again.</Alert>;
  }

  if (hasOpenCheckIn && todayAttendanceId) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800}>
            You are still checked in
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Tap check-out when you leave the site or finish your route so hours stay accurate for payroll.
          </Typography>
          <Stack spacing={2} mt={2}>
            {!geo ? (
              <>
                {geoErr ? <Alert severity="warning">{geoErr}</Alert> : null}
                <Button variant="contained" disabled={geoLoading} onClick={() => void runGeo()} startIcon={geoLoading ? <CircularProgress size={16} color="inherit" /> : null}>
                  Capture GPS for check-out
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                disabled={submitting}
                onClick={() => void submitCheckOut()}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                Check out now
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {!online ? (
        <Alert severity="warning">
          No internet — will sync when connected. GeoAttend stores this check-in securely on your phone.
        </Alert>
      ) : null}
      {step === 1 ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={900}>
              Ready when you are
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" })}
            </Typography>
            <Button variant="contained" size="large" fullWidth sx={{ mt: 3, py: 1.5 }} onClick={() => setStep(2)}>
              Check in
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography fontWeight={800}>Pinpointing your location</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Hold steady — we use GPS so owners know you are at the real counter or client visit, not a proxy pin.
            </Typography>
            {geoErr ? (
              <Alert sx={{ mt: 2 }} severity="warning" action={<Button onClick={() => void runGeo()}>Retry</Button>}>
                {geoErr}
              </Alert>
            ) : null}
            <Button
              sx={{ mt: 2 }}
              variant="outlined"
              disabled={geoLoading}
              onClick={() => void runGeo()}
              startIcon={geoLoading ? <CircularProgress size={16} /> : null}
            >
              Refresh GPS
            </Button>
            {geo ? (
              <Typography variant="caption" display="block" mt={2} color="text.secondary">
                Accuracy ~{Math.round(geo.accuracy)} m
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography fontWeight={800}>Photo proof</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              A quick selfie at the vehicle, site, or branch keeps a clear record for managers and audits.
            </Typography>
            {camError ? <Alert severity="warning">{camError}</Alert> : null}
            <Box
              sx={{
                mt: 2,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "black",
                aspectRatio: "3/4",
                maxHeight: 360,
              }}
            >
              <video ref={setVideoEl} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            <Stack direction="row" spacing={1} mt={2}>
              <Button
                variant="contained"
                onClick={async () => {
                  const p = await capturePhoto();
                  setPhoto(p);
                  setStep(4);
                }}
              >
                Capture
              </Button>
              <Button variant="text" onClick={() => setStep(2)}>
                Back
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography fontWeight={800}>Confirm</Typography>
            <Typography variant="body2" mt={1}>
              Location: {geo ? `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}` : "—"}
            </Typography>
            {photo ? (
              <Box component="img" src={photo} alt="Preview" sx={{ width: "100%", borderRadius: 2, mt: 2 }} />
            ) : null}
            <Stack direction="row" spacing={1} mt={2}>
              <Button
                variant="contained"
                disabled={submitting}
                onClick={() => void submitCheckIn()}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                Submit check-in
              </Button>
              <Button variant="text" onClick={() => setStep(3)}>
                Retake photo
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {step === 5 ? (
        <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "success.main" }}>
          <CardContent>
            <Typography variant="h5" fontWeight={900} color="success.main">
              You&apos;re checked in!
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Your owner dashboard updates instantly with your map pin and photo trail.
            </Typography>
            <Button sx={{ mt: 2 }} variant="contained" onClick={() => setStep(1)}>
              Done
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}
