import type { z } from "zod";

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

export function parseConfig<T>(
  schema: z.ZodType<T>,
  input: unknown,
  root: string,
): T {
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
