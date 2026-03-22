"use client";

import { Card, CardContent, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AttendanceChart({
  data,
}: {
  data: { date: string; present: number }[];
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, height: 320 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Last 14 days on the floor
        </Typography>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={2} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip />
              <Bar dataKey="present" fill="#1B4332" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
