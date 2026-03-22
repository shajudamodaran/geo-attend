"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import theme from "@/lib/theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      </ThemeProvider>
    </SessionProvider>
  );
}
