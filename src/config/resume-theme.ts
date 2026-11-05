import type { ResumeTheme } from "../models/presentation";

export const resumeThemeConfig = {
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
  fontSizes: {
    name: 36,
    role: 20,
    section: 18,
    company: 22,
    project: 18,
    body: 16,
    meta: 14,
    tag: 13,
  },
  fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { heading: 1.35, body: 1.75 },
  spacing: {
    pageXMobile: 20,
    pageXDesktop: 40,
    pageYMobile: 32,
    pageYDesktop: 64,
    section: 48,
    item: 32,
    content: 16,
    inline: 8,
    listIndent: 12,
  },
  widths: { content: 960, sectionLabel: 96, certificationBadge: 160 },
  colors: {
    background: "#ffffff",
    surface: "#f5f5f5",
    text: "#171717",
    muted: "#525252",
    border: "#d4d4d4",
    link: "#404040",
    focus: "#1d4ed8",
  },
} satisfies ResumeTheme;
