"use client";

import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MapPinned,
  FileBarChart,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Team", icon: Users },
  { href: "/attendance", label: "Attendance", icon: ClipboardList },
  { href: "/attendance/live", label: "Live map", icon: MapPinned },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const open = useAppStore((s) => s.mobileNavOpen);
  const setOpen = useAppStore((s) => s.setMobileNavOpen);
  const pathname = usePathname();
  return (
    <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: "16px 16px 0 0" } }}>
      <Box p={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Navigate
        </Typography>
      </Box>
      <List sx={{ pb: 2 }}>
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <ListItemButton
              key={l.href}
              component={Link}
              href={l.href}
              selected={active}
              onClick={() => setOpen(false)}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText primary={l.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
