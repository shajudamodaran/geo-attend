"use client";

import { Avatar } from "@mui/material";
import Image from "next/image";

export default function EmployeeAvatar({ name, src }: { name: string; src?: string | null }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (src) {
    return (
      <Avatar sx={{ width: 40, height: 40 }}>
        <Image src={src} alt={name} width={40} height={40} style={{ objectFit: "cover" }} />
      </Avatar>
    );
  }
  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", color: "primary.contrastText" }}>
      {initial}
    </Avatar>
  );
}
