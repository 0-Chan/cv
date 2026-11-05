import { z } from "zod";
import {
  contactLinkSchema,
  dateSchema,
  imageSchema,
  labelSchema,
  richTextSchema,
  textItemSchema,
  textSchema,
  uniqueList,
  validatePeriod,
  webLinkSchema,
} from "./shared";

export const projectSchema = z.strictObject({
  id: textSchema,
  title: textSchema,
  description: richTextSchema,
  role: richTextSchema.optional(),
  highlights: uniqueList(textItemSchema).default([]),
  technologies: uniqueList(labelSchema).default([]),
  links: uniqueList(webLinkSchema).default([]),
});

export const experienceSchema = z
  .strictObject({
    id: textSchema,
    company: z.strictObject({ name: textSchema, logo: imageSchema.optional() }),
    role: textSchema,
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    isCurrent: z.boolean(),
    tags: uniqueList(labelSchema).default([]),
    highlights: uniqueList(textItemSchema).default([]),
    projects: uniqueList(projectSchema).default([]),
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

export const educationSchema = z
  .strictObject({
    id: textSchema,
    institution: textSchema,
    program: textSchema,
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    description: richTextSchema.optional(),
  })
  .superRefine((entry, context) =>
    validatePeriod(entry.startDate, entry.endDate, context, "endDate"),
  );

export const certificationSchema = z
  .strictObject({
    id: textSchema,
    name: textSchema,
    issuer: textSchema,
    issuedAt: dateSchema.optional(),
    expiresAt: dateSchema.optional(),
    badge: imageSchema.optional(),
    verificationLink: webLinkSchema.optional(),
  })
  .superRefine((entry, context) =>
    validatePeriod(entry.issuedAt, entry.expiresAt, context, "expiresAt"),
  );

export const resumeSchema = z.strictObject({
  profile: z.strictObject({
    name: textSchema,
    role: textSchema,
    contacts: uniqueList(
      z.strictObject({ id: textSchema, label: textSchema, value: textSchema }),
    ).default([]),
    links: uniqueList(contactLinkSchema).default([]),
  }),
  summary: z.strictObject({
    format: z.enum(["paragraphs", "list"]),
    items: uniqueList(textItemSchema),
  }),
  experiences: uniqueList(experienceSchema),
  skills: uniqueList(
    z.strictObject({
      id: textSchema,
      category: textSchema,
      items: uniqueList(labelSchema),
    }),
  ),
  education: uniqueList(educationSchema),
  certifications: uniqueList(certificationSchema),
});

export type ResumeInput = z.input<typeof resumeSchema>;
export type ResumeData = z.output<typeof resumeSchema>;
export type Experience = z.output<typeof experienceSchema>;
export type Project = z.output<typeof projectSchema>;
