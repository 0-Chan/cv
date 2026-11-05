import { z } from "zod";
import { dateSchema, imageSchema, textSchema, validatePeriod } from "./shared";
import { contactUrlSchema } from "./urls";

const strings = z.array(textSchema);
const webLinks = z.record(textSchema, z.httpUrl());
const project = z.strictObject({
  title: textSchema,
  description: textSchema,
  role: textSchema.optional(),
  highlights: strings.default([]),
  technologies: strings.default([]),
  links: webLinks.default({}),
});
const experience = z
  .strictObject({
    company: textSchema,
    logo: imageSchema.optional(),
    role: textSchema,
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    isCurrent: z.boolean(),
    tags: strings.default([]),
    highlights: strings.default([]),
    projects: z.array(project).default([]),
  })
  .superRefine((entry, context) => {
    validatePeriod(entry.startDate, entry.endDate, context, "endDate");
    if (entry.isCurrent && entry.endDate !== undefined) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "현재 재직 중인 경력에는 종료일을 지정할 수 없습니다.",
      });
    }
  });
const education = z
  .strictObject({
    institution: textSchema,
    program: textSchema,
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    description: textSchema.optional(),
  })
  .superRefine((entry, context) =>
    validatePeriod(entry.startDate, entry.endDate, context, "endDate"),
  );
const certification = z
  .strictObject({
    name: textSchema,
    issuer: textSchema,
    issuedAt: dateSchema.optional(),
    expiresAt: dateSchema.optional(),
    badge: imageSchema.optional(),
    verificationLink: webLinks
      .refine(
        (links) => Object.keys(links).length === 1,
        "확인 링크는 이름과 주소 한 쌍으로 작성합니다.",
      )
      .optional(),
  })
  .superRefine((entry, context) =>
    validatePeriod(entry.issuedAt, entry.expiresAt, context, "expiresAt"),
  );

export const resumeAuthoringSchema = z.strictObject({
  profile: z.strictObject({
    name: textSchema,
    role: textSchema,
    contacts: z.record(textSchema, textSchema).default({}),
    links: z.record(textSchema, contactUrlSchema).default({}),
  }),
  summary: z.union([textSchema, strings]).optional(),
  experiences: z.array(experience).default([]),
  skills: z.record(textSchema, strings).default({}),
  education: z.array(education).default([]),
  certifications: z.array(certification).default([]),
});
export type ResumeAuthoringInput = z.input<typeof resumeAuthoringSchema>;
