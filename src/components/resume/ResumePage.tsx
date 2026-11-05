import type { ResumeDisplay } from "../../models/presentation";
import type { ResumeData } from "../../models/resume";
import { ProfileHeader } from "./ProfileHeader";
import { SummaryBlock } from "./SummaryBlock";

export function ResumePage({
  resume,
  display,
}: {
  resume: ResumeData;
  display: ResumeDisplay;
}) {
  return (
    <main className="mx-auto grid max-w-content gap-section px-page-mobile py-page-mobile md:px-page-desktop md:py-page-desktop">
      <ProfileHeader profile={resume.profile} />
      {display.sections.map((section) =>
        section.visible && section.id === "summary" ? (
          <SummaryBlock
            key={section.id}
            summary={resume.summary}
            title={section.title}
          />
        ) : null,
      )}
    </main>
  );
}
