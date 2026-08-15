import { createTheme } from "@mui/material";

// Mirrors the tailwind tokens so MUI surfaces (data grids, dialogs, popovers,
// snackbars) sit in the same chassis as the hand-built markup.
export const palette = {
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

const arcadeTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: palette.acid, dark: palette.acidHi, contrastText: palette.void },
    secondary: { main: palette.magenta, contrastText: "#ffffff" },
    error: { main: palette.magenta },
    warning: { main: palette.amber },
    success: { main: palette.acid },
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

export default arcadeTheme;
