"use client";

import {
  AppBar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { Building2, LogOut, MoreVertical } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { clearEmployeeDevicePrefs } from "@/lib/employee-storage";

export default function EmployeeTopBar() {
  const { data: session, status } = useSession();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  const closeMenu = () => setAnchor(null);

  const switchWorkplace = async () => {
    closeMenu();
    await signOut({ redirect: false });
    // Full navigation clears client session cache (avoids "session missing" on /checkin after re-login).
    window.location.assign("/employee-login?switch=1");
  };

  const logOut = async () => {
    closeMenu();
    clearEmployeeDevicePrefs();
    await signOut({ redirect: false });
    window.location.assign("/employee-login?logout=1");
  };

  const displayName = session?.user?.name ?? "Team member";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar variant="dense" sx={{ gap: 1, minHeight: { xs: 52, sm: 56 }, px: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={800} color="primary" noWrap>
            GeoAttend
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {status === "loading" ? "…" : displayName}
          </Typography>
        </Box>
        <IconButton
          aria-label="Account menu"
          aria-controls={open ? "employee-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={(e) => setAnchor(e.currentTarget)}
          size="small"
          sx={{ color: "text.primary" }}
        >
          <MoreVertical size={22} />
        </IconButton>
        <Menu
          id="employee-menu"
          anchorEl={anchor}
          open={open}
          onClose={closeMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: { sx: { minWidth: 220, borderRadius: 2 } },
          }}
        >
          <MenuItem onClick={() => void switchWorkplace()} dense>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Building2 size={18} />
            </ListItemIcon>
            <ListItemText
              primary="Switch workplace"
              secondary="Same mobile — enter PIN again"
              secondaryTypographyProps={{ variant: "caption", sx: { opacity: 0.85 } }}
            />
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => void logOut()} dense>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <LogOut size={18} />
            </ListItemIcon>
            <ListItemText
              primary="Log out"
              secondary="Clear session and saved number"
              secondaryTypographyProps={{ variant: "caption", sx: { opacity: 0.85 } }}
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
