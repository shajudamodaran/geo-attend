"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, Skeleton, Typography } from "@mui/material";
import type { MapPinItem } from "./LiveMapInner";

const Inner = dynamic(() => import("./LiveMapInner"), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={360} />,
});

export default function LiveMapWidget({ items }: { items: MapPinItem[] }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Live locations (Thrissur area)
        </Typography>
        <Inner items={items} />
      </CardContent>
    </Card>
  );
}
