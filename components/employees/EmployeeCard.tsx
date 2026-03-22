"use client";

import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";
import StatusBadge from "@/components/attendance/StatusBadge";
import EmployeeAvatar from "@/components/employees/EmployeeAvatar";
import type { AttendanceStatus } from "@/types";

export type EmployeeCardProps = {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  avatar?: string | null;
  todayStatus?: AttendanceStatus | "none";
};

const roleLabel: Record<string, string> = {
  field_agent: "Field",
  shop_staff: "Shop",
  manager: "Manager",
};

export default function EmployeeCard(e: EmployeeCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <EmployeeAvatar name={e.name} src={e.avatar ?? undefined} />
          <Box flex={1}>
            <Typography fontWeight={800}>{e.name}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              <Chip size="small" label={roleLabel[e.role] ?? e.role} color="secondary" variant="outlined" />
              <Typography variant="caption" color="text.secondary">
                {e.department}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {e.phone}
            </Typography>
            <Box mt={2}>
              {e.todayStatus && e.todayStatus !== "none" ? (
                <StatusBadge status={e.todayStatus} />
              ) : (
                <Chip size="small" label="No check-in today" variant="outlined" />
              )}
            </Box>
            <Button component={Link} href={`/employees/${e.id}`} variant="contained" size="small" sx={{ mt: 2 }}>
              View
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
