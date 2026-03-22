"use client";

import { Button, Stack, Typography } from "@mui/material";
import { Users } from "lucide-react";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        py: 8,
        px: 2,
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Users size={40} color="#D4AF37" />
      <Typography variant="h6" fontWeight={700} textAlign="center">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={420}>
        {description}
      </Typography>
      {actionLabel && onAction ? (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
