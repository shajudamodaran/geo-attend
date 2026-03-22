"use client";

import { Box } from "@mui/material";
import MobileNav from "@/components/layout/MobileNav";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />
      <Box component="main" sx={{ flex: 1, minWidth: 0, pb: { xs: 10, md: 0 } }}>
        {children}
      </Box>
      <MobileNav />
    </Box>
  );
}
