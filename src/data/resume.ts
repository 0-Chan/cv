import { resumeDisplayConfig } from "../config/resume-display";
import { resumeThemeConfig } from "../config/resume-theme";
import {
  displaySchema,
  type ResumeDisplay,
  type ResumeTheme,
  themeSchema,
} from "../models/presentation";
import { type ResumeData, resumeSchema } from "../models/resume";
import { readResumeSource } from "./local-source";
import { parseConfig } from "./validation";

export { ResumeValidationError, type ValidationIssue } from "./validation";

export async function getResumeData(): Promise<ResumeData> {
  return parseConfig(resumeSchema, await readResumeSource(), "resume");
}

export async function getResumePageData(): Promise<{
  resume: ResumeData;
  display: ResumeDisplay;
  theme: ResumeTheme;
}> {
  return {
    resume: await getResumeData(),
    display: parseConfig(displaySchema, resumeDisplayConfig, "display"),
    theme: parseConfig(themeSchema, resumeThemeConfig, "theme"),
  };
}
