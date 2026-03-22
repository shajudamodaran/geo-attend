"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MapPinned,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Team", icon: Users },
  { href: "/attendance", label: "Attendance log", icon: ClipboardList },
  { href: "/attendance/live", label: "Live map", icon: MapPinned },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <Box
      component="aside"
      sx={{
        width: 260,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <Stack spacing={0.5} p={2} pb={1}>
        <Typography variant="h6" fontWeight={800} color="primary">
          GeoAttend
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Kerala&apos;s most trusted geo-attendance tool
        </Typography>
      </Stack>
      <Stack spacing={0.5} px={1} flex={1}>
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          const Icon = l.icon;
          return (
            <Button
              key={l.href}
              component={Link}
              href={l.href}
              startIcon={<Icon size={18} />}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                borderRadius: 2,
                fontWeight: 600,
                color: active ? "primary.contrastText" : "text.primary",
                bgcolor: active ? "primary.main" : "transparent",
                "&:hover": {
                  bgcolor: active ? "primary.dark" : "action.hover",
                },
              }}
            >
              {l.label}
            </Button>
          );
        })}
      </Stack>
      <Box p={2}>
        <Button
          color="inherit"
          fullWidth
          startIcon={<LogOut size={18} />}
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{ justifyContent: "flex-start" }}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
}
