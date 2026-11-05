import { z } from "zod";
import { richTextSchema } from "./rich-text";
import { contactUrlSchema } from "./urls";

export { richTextSchema } from "./rich-text";

// Validate without trimming: rich-text segments may contain meaningful spaces.
export const textSchema = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: "빈 문자열이나 공백만 있는 값은 사용할 수 없습니다.",
  });

export const textItemSchema = z.strictObject({
  content: richTextSchema,
});
export const labelSchema = z.strictObject({
  label: textSchema,
});

export const dateSchema = z
  .string()
  .regex(
    /^(?!0000)\d{4}(?:-(?:0[1-9]|1[0-2]))?$/,
    "날짜는 YYYY 또는 YYYY-MM 형식이어야 합니다.",
  );

export function isReversedPeriod(start?: string, end?: string): boolean {
  if (!start || !end) return false;
  // Compare precision intervals; do not manufacture dates in the output.
  return (
    `${start.slice(0, 4)}-${start.slice(5) || "01"}` >
    `${end.slice(0, 4)}-${end.slice(5) || "12"}`
  );
}

export function validatePeriod(
  start: string | undefined,
  end: string | undefined,
  context: z.RefinementCtx,
  endField: string,
) {
  if (isReversedPeriod(start, end)) {
    context.addIssue({
      code: "custom",
      path: [endField],
      message: "종료 시점이 시작 시점보다 앞섭니다.",
    });
  }
}

export const webLinkSchema = z.strictObject({
  label: textSchema,
  href: z.httpUrl(),
});
export const contactLinkSchema = webLinkSchema.extend({
  href: contactUrlSchema,
});
export const imageSchema = z.strictObject({
  src: textSchema.refine(
    (value) =>
      /^\/(?!\/)[^\s\\?#]+$/.test(value) ||
      z.httpUrl().safeParse(value).success,
    "이미지는 루트 상대 경로나 HTTP(S) 주소여야 합니다.",
  ),
  alt: textSchema,
});
