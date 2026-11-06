import { z } from "zod";
import {
  contactLinkSchema,
  dateSchema,
  imageSchema,
  labelSchema,
  richTextSchema,
  textItemSchema,
  textSchema,
  validatePeriod,
  webLinkSchema,
} from "./shared";

export const projectSchema = z.strictObject({
  title: textSchema,
  description: richTextSchema,
  role: richTextSchema.optional(),
  highlights: z.array(textItemSchema).default([]),
  technologies: z.array(labelSchema).default([]),
  links: z.array(webLinkSchema).default([]),
});

export const experienceSchema = z
  .strictObject({
    company: z.strictObject({ name: textSchema, logo: imageSchema.optional() }),
    role: textSchema,
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
    isCurrent: z.boolean(),
    tags: z.array(labelSchema).default([]),
    highlights: z.array(textItemSchema).default([]),
    projects: z.array(projectSchema).default([]),
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
    contacts: z
      .array(z.strictObject({ label: textSchema, value: textSchema }))
      .default([]),
    links: z.array(contactLinkSchema).default([]),
  }),
  summary: z.strictObject({
    format: z.enum(["paragraphs", "list"]),
    items: z.array(textItemSchema),
  }),
  experiences: z.array(experienceSchema),
  skills: z.array(
    z.strictObject({
      category: textSchema,
      items: z.array(textItemSchema),
    }),
  ),
  education: z.array(educationSchema),
  certifications: z.array(certificationSchema),
});

export type ResumeInput = z.input<typeof resumeSchema>;
export type ResumeData = z.output<typeof resumeSchema>;
export type Experience = z.output<typeof experienceSchema>;
export type Project = z.output<typeof projectSchema>;
