"use client";

import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import EmployeeTopBar from "@/components/layout/EmployeeTopBar";
import { ClipboardCheck, History as HistoryIcon } from "lucide-react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const value = pathname.startsWith("/history") ? "/history" : "/checkin";

  return (
    <div className="min-h-screen pb-20">
      <EmployeeTopBar />
      {children}
      <Paper elevation={8} sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation value={value} showLabels>
          <BottomNavigationAction
            label="Check-in"
            icon={<ClipboardCheck size={20} />}
            component={Link}
            href="/checkin"
            value="/checkin"
          />
          <BottomNavigationAction
            label="History"
            icon={<HistoryIcon size={20} />}
            component={Link}
            href="/history"
            value="/history"
          />
        </BottomNavigation>
      </Paper>
    </div>
  );
}
