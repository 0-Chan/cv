import { z } from "zod";
import { textSchema } from "./shared";

export const sectionIds = [
  "summary",
  "experiences",
  "skills",
  "education",
  "certifications",
] as const;
export const displaySchema = z.strictObject({
  sections: uniqueSections(
    z.strictObject({
      id: z.enum(sectionIds),
      title: textSchema,
      visible: z.boolean(),
    }),
  ).length(sectionIds.length),
  labels: z.strictObject({
    current: textSchema,
    projectRole: textSchema,
    issuedAt: textSchema,
  }),
});

const size = z.number().positive();
const space = z.number().nonnegative();
const weight = z.number().int().min(100).max(900);
const color = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "색상은 #RRGGBB 형식이어야 합니다.");

export const themeSchema = z.strictObject({
  fontFamily: textSchema,
  fontSizes: z.strictObject({
    name: size,
    role: size,
    section: size,
    company: size,
    project: size,
    body: size,
    meta: size,
    tag: size,
  }),
  fontWeights: z.strictObject({
    regular: weight,
    medium: weight,
    semibold: weight,
    bold: weight,
  }),
  lineHeights: z.strictObject({ heading: size, body: size }),
  spacing: z.strictObject({
    pageXMobile: space,
    pageXDesktop: space,
    pageYMobile: space,
    pageYDesktop: space,
    section: space,
    item: space,
    content: space,
    inline: space,
    listIndent: space,
  }),
  widths: z.strictObject({
    content: size,
    sectionLabel: size,
    certificationBadge: size,
  }),
  colors: z.strictObject({
    background: color,
    surface: color,
    text: color,
    muted: color,
    border: color,
    link: color,
    focus: color,
  }),
});

export type ResumeDisplay = z.infer<typeof displaySchema>;
export type ResumeTheme = z.infer<typeof themeSchema>;

function uniqueSections<T extends z.ZodType<{ id: string }>>(item: T) {
  return z.array(item).superRefine((items, context) => {
    const seen = new Set<string>();
    items.forEach((entry, index) => {
      if (seen.has(entry.id)) {
        context.addIssue({
          code: "custom",
          path: [index, "id"],
          message: "섹션 키는 중복될 수 없습니다.",
        });
      }
      seen.add(entry.id);
    });
  });
}
