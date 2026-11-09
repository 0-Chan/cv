import type { ReactNode } from "react";
import type { ResumeDisplay } from "../../models/presentation";
import type { ResumeData } from "../../models/resume";
import {
  getVisibleResumeSections,
  getVisibleSummaryLead,
} from "../../presentation/resume";
import { CertificationItem } from "./CertificationItem";
import { EducationItem } from "./EducationItem";
import { ExperienceItem } from "./ExperienceItem";
import { ProfileHeader } from "./ProfileHeader";
import { ResumeExport } from "./ResumeExport";
import { ResumeSection } from "./ResumeSection";
import { SkillGroup } from "./SkillGroup";
import { SummaryBlock } from "./SummaryBlock";

export function ResumePage({
  resume,
  display,
}: {
  resume: ResumeData;
  display: ResumeDisplay;
}) {
  const sections = getVisibleResumeSections(resume, display);
  return (
    <main className="resume-page mx-auto grid w-full max-w-resume px-page-x-mobile py-page-y-mobile md:px-page-x-desktop md:py-page-y-desktop">
      <div className="flex min-w-0 items-start gap-content">
        <ProfileHeader
          profile={resume.profile}
          summaryLead={getVisibleSummaryLead(resume, display)}
        />
        <ResumeExport name={resume.profile.name} />
      </div>
      {sections.map((section) => {
        let content: ReactNode;
        switch (section.id) {
          case "summary":
            return (
              <SummaryBlock
                key={section.id}
                summary={section.content}
                title={section.title}
                showTitle={section.showTitle}
              />
            );
          case "experiences":
            content = section.content.map((experience, index) => (
              <ExperienceItem
                // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 경력 목록이며 콘텐츠 ID를 요구하지 않는다.
                key={index}
                experience={experience}
                labels={display.labels}
              />
            ));
            break;
          case "skills":
            content = section.content.map((group, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 기술 분류 목록이다.
              <SkillGroup key={index} group={group} />
            ));
            break;
          case "education":
            content = section.content.map((education, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 상태 없는 정적 학력 목록이다.
              <EducationItem key={index} education={education} />
            ));
            break;
          case "certifications":
            content = section.content.map((certification, index) => (
              <CertificationItem
                // biome-ignore lint/suspicious/noArrayIndexKey: 상태 없는 정적 자격 목록이다.
                key={index}
                certification={certification}
                labels={display.labels}
              />
            ));
            break;
        }
        return (
          <ResumeSection
            key={section.id}
            id={section.id}
            title={section.title}
            showTitle={section.showTitle}
          >
            {content}
          </ResumeSection>
        );
      })}
    </main>
  );
}
