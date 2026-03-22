"use client";

import { Button } from "@mui/material";
import { Download } from "lucide-react";

export default function ExportButton({ href, label }: { href: string; label: string }) {
  return (
    <Button component="a" href={href} variant="outlined" startIcon={<Download size={18} />} download>
      {label}
    </Button>
  );
}
