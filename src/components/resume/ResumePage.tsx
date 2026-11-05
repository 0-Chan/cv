import type { ResumeDisplay } from "../../models/presentation";
import type { ResumeData } from "../../models/resume";
import { CertificationItem } from "./CertificationItem";
import { EducationItem } from "./EducationItem";
import { ExperienceItem } from "./ExperienceItem";
import { ProfileHeader } from "./ProfileHeader";
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
  const skillGroups = resume.skills.filter((group) => group.items.length > 0);
  return (
    <main className="mx-auto grid max-w-content gap-section px-page-x-mobile py-page-y-mobile md:px-page-x-desktop md:py-page-y-desktop">
      <ProfileHeader profile={resume.profile} />
      {display.sections.map((section) => {
        if (!section.visible) return null;
        switch (section.id) {
          case "summary":
            return (
              <SummaryBlock
                key={section.id}
                summary={resume.summary}
                title={section.title}
              />
            );
          case "experiences":
            return (
              resume.experiences.length > 0 && (
                <ResumeSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                >
                  {resume.experiences.map((experience, index) => (
                    <ExperienceItem
                      // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 경력 목록이며 콘텐츠 ID를 요구하지 않는다.
                      key={index}
                      experience={experience}
                      labels={display.labels}
                    />
                  ))}
                </ResumeSection>
              )
            );
          case "skills":
            return (
              skillGroups.length > 0 && (
                <ResumeSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                >
                  {skillGroups.map((group, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 기술 분류 목록이다.
                    <SkillGroup key={index} group={group} />
                  ))}
                </ResumeSection>
              )
            );
          case "education":
            return (
              resume.education.length > 0 && (
                <ResumeSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                >
                  {resume.education.map((education, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: 상태 없는 정적 학력 목록이며 콘텐츠 ID를 요구하지 않는다.
                    <EducationItem key={index} education={education} />
                  ))}
                </ResumeSection>
              )
            );
          case "certifications":
            return (
              resume.certifications.length > 0 && (
                <ResumeSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                >
                  {resume.certifications.map((certification, index) => (
                    <CertificationItem
                      // biome-ignore lint/suspicious/noArrayIndexKey: 상태 없는 정적 자격 목록이며 콘텐츠 ID를 요구하지 않는다.
                      key={index}
                      certification={certification}
                      labels={display.labels}
                    />
                  ))}
                </ResumeSection>
              )
            );
          default:
            return null;
        }
      })}
    </main>
  );
}
