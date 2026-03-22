import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1B4332", contrastText: "#ffffff" },
    secondary: { main: "#D4AF37", contrastText: "#111827" },
    error: { main: "#DC2626" },
    success: { main: "#16A34A" },
    warning: { main: "#D97706" },
    background: { default: "#F8F9FA", paper: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#6B7280" },
    divider: "#E9ECEF",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
        },
      },
    },
  },
});

export default theme;
