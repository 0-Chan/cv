import type { ResumeDisplay } from "../../models/presentation";
import type { ResumeData } from "../../models/resume";
import { ExperienceItem } from "./ExperienceItem";
import { ProfileHeader } from "./ProfileHeader";
import { ResumeSection } from "./ResumeSection";
import { SummaryBlock } from "./SummaryBlock";

export function ResumePage({
  resume,
  display,
}: {
  resume: ResumeData;
  display: ResumeDisplay;
}) {
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
          // 기술·학력·자격 화면은 다음 구현 단계다.
          default:
            return null;
        }
      })}
    </main>
  );
}
