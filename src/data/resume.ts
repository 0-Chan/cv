import type { z } from "zod";
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

export interface ValidationIssue {
  path: string;
  message: string;
}

export class ResumeValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
    this.name = "ResumeValidationError";
  }
}

function parseConfig<T>(schema: z.ZodType<T>, input: unknown, root: string): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ResumeValidationError(
      result.error.issues.map((issue) => ({
        path: [root, ...issue.path].join("."),
        // Zod messages for unknown keys/enums may include input. Report only paths.
        message:
          issue.code === "custom"
            ? issue.message
            : "설정 형식 또는 값이 올바르지 않습니다.",
      })),
    );
  }
  return result.data;
}

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
