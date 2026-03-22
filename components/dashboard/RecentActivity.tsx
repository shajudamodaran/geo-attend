"use client";

import { Avatar, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import StatusBadge from "@/components/attendance/StatusBadge";
import type { AttendanceStatus } from "@/types";

export type RecentRow = {
  id: string;
  name: string;
  avatar?: string;
  timeLabel: string;
  status: AttendanceStatus;
};

export default function RecentActivity({ items }: { items: RecentRow[] }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} mb={1}>
          Recent check-ins
        </Typography>
        <List dense disablePadding>
          {items.map((r) => (
            <ListItem key={r.id} alignItems="flex-start" sx={{ py: 1.25 }}>
              <ListItemAvatar>
                <Avatar src={r.avatar}>{r.name.charAt(0)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography fontWeight={700} variant="body2">
                    {r.name}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {r.timeLabel}
                    </Typography>
                    <StatusBadge status={r.status} />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
