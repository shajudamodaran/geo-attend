"use client";

import { IconButton, Stack, Typography } from "@mui/material";
import { Menu } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function Topbar({ title }: { title: string }) {
  const setOpen = useAppStore((s) => s.setMobileNavOpen);
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        height: 64,
        px: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton sx={{ display: { md: "none" } }} onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
    </Stack>
  );
}
