import type { ResumeTheme } from "../models/presentation";
import { BAEKSANGJI } from "../styles/paper-texture.ts";

const paper = {
  ...BAEKSANGJI,
  freq: 0.019957572775684933,
  oct: 2,
  ss: 0.8,
  tile: 240,
};

export const resumeThemeConfig = {
  paper,
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
  fontSizes: {
    name: 40,
    role: 20,
    section: 32,
    company: 26,
    project: 22,
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
    section: 56,
    sectionContent: 24,
    company: 40,
    project: 28,
    item: 32,
    content: 12,
    inline: 8,
    compact: 4,
    listIndent: 12,
  },
  widths: {
    content: 840,
    companyLogo: 32,
    certificationBadge: 96,
    sectionAccent: 53,
  },
  colors: {
    background: paper.color,
    surface: "#f5f5f5",
    text: "#171717",
    muted: "#4b4b4b",
    border: "#d4d4d4",
    accent: "#ff7500",
    headingStart: "#a34200",
    headingEnd: "#b44900",
    link: "#7c3200",
    focus: "#1d4ed8",
  },
} satisfies ResumeTheme;
