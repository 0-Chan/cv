import type { ResumeInput } from "../models/resume";

export const resumeConfig = {
  profile: { name: "이름", role: "직무" },
  summary: {
    format: "paragraphs",
    items: [{ id: "intro-01", content: [{ text: "소개 문장입니다." }] }],
  },
  experiences: [
    {
      id: "experience-01",
      company: { name: "회사 A" },
      role: "직무",
      isCurrent: false,
      projects: [
        {
          id: "project-01",
          title: "프로젝트 A",
          description: [{ text: "제품·서비스 소개입니다." }],
          highlights: [
            { id: "highlight-01", content: [{ text: "수행 내용입니다." }] },
          ],
        },
      ],
    },
  ],
  skills: [],
  education: [],
  certifications: [],
} satisfies ResumeInput;
