import type { ResumeDisplay } from "../models/presentation";
import type { ResumeData } from "../models/resume";

export type VisibleResumeSection = {
  [Id in ResumeDisplay["sections"][number]["id"]]: {
    id: Id;
    title: string;
    showTitle: boolean;
    content: ResumeData[Id];
  };
}[ResumeDisplay["sections"][number]["id"]];

/** 화면과 내보내기에서 같은 순서·숨김·빈 목록 규칙을 사용한다. */
export function getVisibleResumeSections(
  resume: ResumeData,
  display: ResumeDisplay,
): VisibleResumeSection[] {
  const result: VisibleResumeSection[] = [];
  for (const { id, title, visible, showTitle = true } of display.sections) {
    if (!visible) continue;
    switch (id) {
      case "summary":
        if (resume.summary.items.length) {
          result.push({ id, title, showTitle, content: resume.summary });
        }
        break;
      case "skills": {
        const content = resume.skills.filter((group) => group.items.length);
        if (content.length) result.push({ id, title, showTitle, content });
        break;
      }
      case "experiences":
        if (resume.experiences.length) {
          result.push({ id, title, showTitle, content: resume.experiences });
        }
        break;
      case "education":
        if (resume.education.length) {
          result.push({ id, title, showTitle, content: resume.education });
        }
        break;
      case "certifications":
        if (resume.certifications.length) {
          result.push({ id, title, showTitle, content: resume.certifications });
        }
        break;
    }
  }
  return result;
}

export function getVisibleSummaryLead(
  resume: ResumeData,
  display: ResumeDisplay,
) {
  return display.sections.some(
    (section) => section.id === "summary" && section.visible,
  )
    ? resume.summary.lead
    : undefined;
}

export function getProfileDetails(profile: ResumeData["profile"]) {
  const links = profile.links.map((link) => ({
    ...link,
    protocol: new URL(link.href).protocol,
  }));
  return [
    ...links.filter(
      (link) => link.protocol === "http:" || link.protocol === "https:",
    ),
    ...(profile.contacts.length
      ? [
          {
            label: profile.contacts.map((contact) => contact.value).join(" / "),
            href: undefined,
          },
        ]
      : []),
    ...links.filter((link) => link.protocol === "tel:"),
    ...links.filter((link) => link.protocol === "mailto:"),
  ];
}

export function formatPeriod(start?: string, end?: string): string {
  return [start, end].filter(Boolean).join(" ~ ");
}

export function resumeDownloadName(name: string, extension: "pdf" | "md") {
  return `${name.replace(/[\\/:*?"<>|\p{Cc}]/gu, "_")}-이력서.${extension}`;
}
