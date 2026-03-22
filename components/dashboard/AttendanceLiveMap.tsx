"use client";

import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Button, Typography } from "@mui/material";
import { useState } from "react";
import type { MapPinItem } from "./LiveMapInner";

function pin(checkedIn: boolean) {
  return L.divIcon({
    className: "ga-leaflet-marker",
    html: `<div style="width:14px;height:14px;border-radius:999px;background:${
      checkedIn ? "#16A34A" : "#9CA3AF"
    };border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.25)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function AttendanceLiveMap({ items }: { items: MapPinItem[] }) {
  const [mode, setMode] = useState<"street" | "satellite">("street");
  const center: [number, number] =
    items[0] != null ? [items[0].lat, items[0].lng] : [10.5276, 76.2144];
  const url =
    mode === "street"
      ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  return (
    <Box>
      <ToggleButtonGroup
        size="small"
        exclusive
        value={mode}
        onChange={(_, v) => v && setMode(v)}
        sx={{ mb: 1 }}
      >
        <ToggleButton value="street">Street</ToggleButton>
        <ToggleButton value="satellite">Satellite</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ height: { xs: 360, md: 560 }, borderRadius: 2, overflow: "hidden" }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url={url} />
          {items.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={pin(m.checkedIn)}>
              <Popup>
                <Typography variant="subtitle2" fontWeight={700}>
                  {m.name}
                </Typography>
                <Typography variant="caption" display="block">
                  {m.checkedIn ? `Checked in ${m.timeLabel ?? ""}` : "Not checked in yet"}
                </Typography>
                {m.photoThumb ? (
                  <Box component="img" src={m.photoThumb} alt="" sx={{ width: "100%", mt: 1, borderRadius: 1 }} />
                ) : null}
                <Button component={Link} href={`/employees/${m.id}`} size="small" sx={{ mt: 1 }}>
                  View profile
                </Button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
}
