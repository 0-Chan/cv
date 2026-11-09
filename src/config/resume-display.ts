import type { ResumeDisplay } from "../models/presentation";

export const resumeDisplayConfig = {
  sections: [
    { id: "summary", title: "소개", visible: true, showTitle: false },
    { id: "experiences", title: "경력", visible: true },
    { id: "skills", title: "기술", visible: true },
    { id: "education", title: "학력", visible: true },
    { id: "certifications", title: "자격", visible: true },
  ],
  labels: {
    current: "현재",
    durationYear: "년",
    durationMonth: "개월",
    issuedAt: "취득",
    certificationReason: "사유",
    projectTechnologies: "기술 스택",
    projectRole: "핵심 역할",
    issue: "이슈",
    approach: "해결 방향",
    outcomes: "성과",
  },
} satisfies ResumeDisplay;
