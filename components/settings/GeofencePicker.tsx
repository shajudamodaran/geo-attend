"use client";

import { Box, Typography } from "@mui/material";
import { Circle, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function GeofencePicker({
  center,
  radius,
  onCenterChange,
}: {
  center: { lat: number; lng: number };
  radius: number;
  onCenterChange: (lat: number, lng: number) => void;
}) {
  const key = useMemo(() => `${center.lat.toFixed(4)}-${center.lng.toFixed(4)}-${radius}`, [center.lat, center.lng, radius]);
  return (
    <Box sx={{ height: 320, borderRadius: 2, overflow: "hidden" }}>
      <MapContainer key={key} center={[center.lat, center.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Circle
          center={[center.lat, center.lng]}
          radius={radius}
          pathOptions={{ color: "#1B4332", fillColor: "#D4AF37", fillOpacity: 0.15 }}
        />
        <ClickHandler onPick={onCenterChange} />
      </MapContainer>
      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        Tap the map to move the geofence centre. Staff must check in inside this circle.
      </Typography>
    </Box>
  );
}
