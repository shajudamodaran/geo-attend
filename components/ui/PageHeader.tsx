"use client";

import { Stack, Typography } from "@mui/material";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" mb={3}>
      <div>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </Stack>
  );
}
