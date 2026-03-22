"use client";

import { Grid, Skeleton, Stack } from "@mui/material";

export function StatsRowSkeleton() {
  return (
    <Grid container spacing={2} mb={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Skeleton variant="rounded" height={104} />
        </Grid>
      ))}
    </Grid>
  );
}

export function CardSkeleton() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={320} />
      <Skeleton variant="rounded" height={200} />
    </Stack>
  );
}
