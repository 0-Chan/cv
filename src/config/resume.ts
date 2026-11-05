import type { ResumeInput } from "../models/resume";

export const resumeConfig = {
  profile: { name: "이름", role: "직무" },
  summary: {
    format: "paragraphs",
    items: [{ content: [{ text: "소개 문장입니다." }] }],
  },
  experiences: [
    {
      company: { name: "회사 A" },
      role: "직무",
      isCurrent: false,
      projects: [
        {
          title: "프로젝트 A",
          description: [{ text: "제품·서비스 소개입니다." }],
          highlights: [{ content: [{ text: "수행 내용입니다." }] }],
        },
      ],
    },
  ],
  skills: [],
  education: [],
  certifications: [],
} satisfies ResumeInput;
