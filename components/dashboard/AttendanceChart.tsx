"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_H = 240;

export default function AttendanceChart({
  data,
}: {
  data: { date: string; present: number }[];
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, minWidth: 0 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, pb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Last 14 days on the floor
        </Typography>
        <Box sx={{ width: "100%", minWidth: 0, height: CHART_H }}>
          <ResponsiveContainer width="100%" height={CHART_H}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip />
              <Bar dataKey="present" fill="#1B4332" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
