"use client";

import { BottomNavigation, BottomNavigationAction, Box, Button, Paper } from "@mui/material";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardCheck, History as HistoryIcon } from "lucide-react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const value = pathname.startsWith("/history") ? "/history" : "/checkin";

  const switchWorkplace = async () => {
    await signOut({ redirect: false });
    router.push("/employee-login");
    router.refresh();
  };

  return (
    <div className="min-h-screen pb-20">
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Button size="small" variant="text" color="primary" onClick={() => void switchWorkplace()} sx={{ fontWeight: 600 }}>
          Switch workplace
        </Button>
      </Box>
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
