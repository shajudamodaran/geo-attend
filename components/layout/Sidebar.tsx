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

const SIDEBAR_WIDTH = 288;

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <Box
      component="aside"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
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
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight={800} color="primary" letterSpacing="-0.02em">
          GeoAttend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5, pr: 0.5 }}>
          Geo attendance for field &amp; floor teams
        </Typography>
      </Box>

      <Stack
        component="nav"
        aria-label="Main navigation"
        spacing={1}
        sx={{ flex: 1, px: 2, py: 2.5, overflowY: "auto" }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ px: 1.5, letterSpacing: "0.08em", fontWeight: 700 }}>
          Menu
        </Typography>
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          const Icon = l.icon;
          return (
            <Button
              key={l.href}
              component={Link}
              href={l.href}
              startIcon={<Icon size={20} strokeWidth={active ? 2.25 : 2} />}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                textAlign: "left",
                borderRadius: 2,
                py: 1.35,
                px: 1.75,
                minHeight: 48,
                fontWeight: 600,
                fontSize: "0.9375rem",
                gap: 1.25,
                color: active ? "primary.contrastText" : "text.primary",
                bgcolor: active ? "primary.main" : "transparent",
                "& .MuiButton-startIcon": { mr: 0.5, ml: 0 },
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

      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 3,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          color="inherit"
          variant="outlined"
          fullWidth
          startIcon={<LogOut size={20} />}
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{
            justifyContent: "flex-start",
            py: 1.25,
            px: 1.75,
            minHeight: 48,
            borderRadius: 2,
            borderColor: "divider",
            color: "text.secondary",
            fontWeight: 600,
            "&:hover": {
              borderColor: "text.secondary",
              bgcolor: "action.hover",
              color: "text.primary",
            },
          }}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
}
