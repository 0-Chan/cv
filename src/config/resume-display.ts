import type { ResumeDisplay } from "../models/presentation";

export const resumeDisplayConfig = {
  sections: [
    { id: "summary", title: "소개", visible: true },
    { id: "experiences", title: "경력", visible: true },
    { id: "skills", title: "기술", visible: true },
    { id: "education", title: "학력", visible: true },
    { id: "certifications", title: "자격", visible: true },
  ],
  labels: {
    current: "현재",
    projectRole: "담당 역할",
    issuedAt: "취득",
    expiresAt: "만료",
  },
} satisfies ResumeDisplay;
