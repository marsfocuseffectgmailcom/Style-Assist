export const C = {
  bgBase:     "#1F2A37",
  bgElevated: "#2A3645",
  bgCard:     "#243140",
  bgDeep:     "#1C2A37",

  accent:     "#3F6F73",
  accentSoft: "#7FA9A3",
  gold:       "#C8A96A",
  success:    "#5F8F7F",
  error:      "#B86B6B",

  textPrimary:   "#F5F5F5",
  textSecondary: "#A8B0B8",
  textMuted:     "#9CA3AF",
  textDim:       "#6B8490",

  border:     "rgba(255,255,255,0.06)",
  borderSoft: "rgba(255,255,255,0.08)",
} as const

export const SHADOW = {
  card:   "0 8px 24px rgba(0,0,0,0.14)",
  hero:   "0 16px 40px rgba(0,0,0,0.20)",
  button: "0 8px 20px rgba(63,111,115,0.24)",
  float:  "0 12px 32px rgba(63,111,115,0.30)",
} as const

export const RADIUS = {
  chip:   "12px",
  button: "18px",
  card:   "24px",
  hero:   "28px",
  panel:  "32px",
} as const

export const SPACING = {
  pagePx:    "20px",
  pagePt:    "24px",
  pagePb:    "32px",
  sectionGap:"24px",
  cardGap:   "16px",
} as const

export const ANIM = {
  default: "160ms ease",
} as const

export const BADGE = {
  high: {
    label: "High match",
    color: "#5F8F7F",
    bg:    "rgba(95,143,127,0.18)",
  },
  safe: {
    label: "Safe",
    color: "#A8B0B8",
    bg:    "rgba(168,176,184,0.16)",
  },
  experimental: {
    label: "Bold pick",
    color: "#C8A96A",
    bg:    "rgba(200,169,106,0.18)",
  },
} as const
