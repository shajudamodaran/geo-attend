"use client";

import { Box, Typography } from "@mui/material";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Button } from "@mui/material";

export type MapPinItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  checkedIn: boolean;
  timeLabel?: string;
  photoThumb?: string;
};

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

export default function LiveMapInner({ items }: { items: MapPinItem[] }) {
  const center: [number, number] =
    items[0] != null ? [items[0].lat, items[0].lng] : [10.5276, 76.2144];
  return (
    <Box sx={{ height: 360, width: "100%", borderRadius: 2, overflow: "hidden" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {items.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={pin(m.checkedIn)}>
            <Popup>
              <Typography variant="subtitle2" fontWeight={700}>
                {m.name}
              </Typography>
              <Typography variant="caption" display="block">
                {m.checkedIn ? `Checked in ${m.timeLabel ?? ""}` : "Not checked in yet"}
              </Typography>
              <Button component={Link} href={`/employees/${m.id}`} size="small" sx={{ mt: 1 }}>
                View profile
              </Button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
