import type { ResumeTheme } from "../models/presentation";

export function themeVariables(theme: ResumeTheme): Record<string, string> {
  const variables: Record<string, string> = {
    "--resume-font": theme.fontFamily,
  };
  for (const [group, values, unit] of [
    ["size", theme.fontSizes, "px"],
    ["weight", theme.fontWeights, ""],
    ["leading", theme.lineHeights, ""],
    ["space", theme.spacing, "px"],
    ["width", theme.widths, "px"],
    ["color", theme.colors, ""],
  ] as const) {
    for (const [key, value] of Object.entries(values)) {
      variables[`--resume-${group}-${key}`] = `${value}${unit}`;
    }
  }
  return variables;
}
