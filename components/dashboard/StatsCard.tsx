"use client";

import { Card, CardContent, Typography } from "@mui/material";

export default function StatsCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} mt={1}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
