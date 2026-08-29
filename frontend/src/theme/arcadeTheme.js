import { createTheme } from "@mui/material";

// Mirrors the tailwind tokens so MUI surfaces (data grids, dialogs, popovers,
// snackbars) sit in the same chassis as the hand-built markup.
//
// Unlike the Tailwind/CSS side, these can't be var(--color-x) strings: MUI
// components frequently run theme.palette.<color>.main through alpha()/
// lighten()/darken()/getContrastText() at both construction time (building
// the primary/secondary/etc. palette objects) and render time (Slider's
// focus ring, LinearProgress's track, etc.) — all of which need to parse an
// actual color, not a CSS variable the browser hasn't resolved yet. So the
// theme is built fresh per mode from literal hex, mirroring the values in
// src/index.css's :root / [data-theme="light"] blocks — keep the two in sync
// by hand if either changes.
const RAW = {
  dark: {
    void: "#06070a",
    chassis: "#0b0c0f",
    panel: "#0f1116",
    well: "#14161b",
    line: "#2a2e37",
    seam: "#1c2027",
    edge: "#4a505c",
    muted: "#5d636e",
    dim: "#8b919c",
    ink: "#f2f3f5",
    acid: "#ccff00",
    acidHi: "#e4ff6b",
    magenta: "#ff2e6b",
    amber: "#ffb020",
  },
  light: {
    void: "#f4f5f7",
    chassis: "#ffffff",
    panel: "#ffffff",
    well: "#e7e9ec",
    line: "#d3d6db",
    seam: "#e2e4e8",
    edge: "#aab0ba",
    muted: "#6b7280",
    dim: "#4b5563",
    ink: "#0f1116",
    acid: "#5c7a00",
    acidHi: "#7a9e00",
    magenta: "#c41752",
    amber: "#9c6300",
  },
};

const mono = "'IBM Plex Mono', monospace";
const sans = "'Space Grotesk', system-ui, sans-serif";
const display = "'Chakra Petch', sans-serif";

// The uppercase mono label that every button, tab and table header shares.
const telemetry = {
  fontFamily: mono,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

export function createArcadeTheme(mode) {
  const palette = RAW[mode] ?? RAW.dark;

  return createTheme({
    palette: {
      mode: mode === "light" ? "light" : "dark",
      // Every one of light/dark/contrastText is supplied explicitly so MUI's
      // augmentColor() never needs to derive one via lighten()/darken() —
      // every component below styles itself explicitly from `palette.x`
      // anyway, so these derived shades are never actually rendered.
      primary: { main: palette.acid, light: palette.acidHi, dark: palette.acid, contrastText: palette.void },
      secondary: { main: palette.magenta, light: palette.magenta, dark: palette.magenta, contrastText: "#ffffff" },
      error: { main: palette.magenta, light: palette.magenta, dark: palette.magenta, contrastText: "#ffffff" },
      warning: { main: palette.amber, light: palette.amber, dark: palette.amber, contrastText: palette.void },
      success: { main: palette.acid, light: palette.acidHi, dark: palette.acid, contrastText: palette.void },
      divider: palette.line,
      background: { default: palette.void, paper: palette.panel },
      text: { primary: palette.ink, secondary: palette.dim, disabled: palette.muted },
    },
    shape: { borderRadius: 0 },
    typography: {
      fontFamily: sans,
      h1: { fontFamily: display },
      h2: { fontFamily: display },
      h3: { fontFamily: display },
      h4: { fontFamily: display },
      h5: { fontFamily: display },
      h6: { fontFamily: display },
      button: { ...telemetry, fontSize: 11 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: true },
        styleOverrides: {
          root: { borderRadius: 0, minHeight: 40, paddingInline: 20 },
          contained: {
            "&:hover": { backgroundColor: palette.acidHi },
          },
          outlined: {
            borderColor: palette.edge,
            color: palette.ink,
            "&:hover": { borderColor: palette.acid, color: palette.acid, background: "transparent" },
          },
          text: { color: palette.acid },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          outlined: { borderColor: palette.line },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            background: palette.panel,
            border: `1px solid ${palette.acid}`,
            boxShadow: "6px 6px 0 rgba(0,0,0,.5)",
            padding: 4,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: palette.panel,
            border: `1px solid ${palette.line}`,
            boxShadow: "8px 8px 0 rgba(0,0,0,.55)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: { fontFamily: display, textTransform: "uppercase", letterSpacing: "0.02em" },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 0, fontFamily: sans, alignItems: "center" },
          filledSuccess: { background: palette.acid, color: palette.void, fontWeight: 600 },
          filledError: { background: palette.magenta, color: "#fff", fontWeight: 600 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            background: palette.void,
            "& fieldset": { borderColor: palette.line },
            "&:hover fieldset": { borderColor: palette.edge },
            "&.Mui-focused fieldset": { borderColor: palette.acid, borderWidth: 1 },
          },
          input: { fontFamily: sans },
        },
      },
      MuiInput: {
        styleOverrides: {
          root: {
            "&:before": { borderBottomColor: palette.line },
            "&:hover:not(.Mui-disabled):before": { borderBottomColor: palette.edge },
            "&:after": { borderBottomColor: palette.acid },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { color: palette.dim, "&.Mui-focused": { color: palette.acid } },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: sans,
            fontSize: 13,
            "&.Mui-selected": { background: palette.acid, color: palette.void },
            "&.Mui-selected:hover": { background: palette.acidHi, color: palette.void },
          },
        },
      },
      MuiRating: {
        styleOverrides: {
          iconFilled: { color: palette.acid },
          iconEmpty: { color: palette.line },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 2, background: palette.line },
          bar: { background: palette.acid },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            fontFamily: mono,
            fontWeight: 600,
            border: `1px solid ${palette.line}`,
            color: palette.dim,
            "&.Mui-selected": {
              background: palette.acid,
              color: palette.void,
              borderColor: palette.acid,
            },
            "&.Mui-selected:hover": { background: palette.acidHi },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 0,
            background: palette.panel,
            border: `1px solid ${palette.line}`,
            fontFamily: mono,
            fontSize: 11,
          },
        },
      },
      // Admin tables keep DataGrid's editing/sorting behaviour and take on the
      // hairline-grid look from screens 09-11.
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${palette.line}`,
            borderRadius: 0,
            background: palette.chassis,
            color: palette.ink,
            fontFamily: sans,
            fontSize: 13,
            "--DataGrid-rowBorderColor": palette.seam,
            "--DataGrid-containerBackground": palette.panel,
          },
          columnHeaders: { borderBottom: `1px solid ${palette.line}` },
          columnHeader: {
            background: palette.panel,
            "&:focus, &:focus-within": { outline: "none" },
          },
          columnHeaderTitle: {
            ...telemetry,
            fontSize: 10,
            letterSpacing: "0.12em",
            color: palette.muted,
          },
          columnSeparator: { color: palette.line },
          cell: {
            borderBottom: `1px solid ${palette.seam}`,
            "&:focus, &:focus-within": { outline: `1px solid ${palette.acid}` },
          },
          row: {
            "&:hover": { background: palette.panel },
            "&.Mui-selected": { background: palette.well },
            "&.Mui-selected:hover": { background: palette.well },
          },
          "row--editing": {
            boxShadow: "none",
            background: palette.well,
            "& .MuiDataGrid-cell": { background: palette.well },
          },
          footerContainer: {
            borderTop: `1px solid ${palette.line}`,
            background: palette.panel,
          },
          toolbarContainer: {
            padding: "10px 12px",
            borderBottom: `1px solid ${palette.line}`,
            background: palette.panel,
          },
          overlay: { background: palette.chassis, color: palette.dim },
          menu: { "& .MuiPaper-root": { border: `1px solid ${palette.line}` } },
        },
      },
    },
  });
}
