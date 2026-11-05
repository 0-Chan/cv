import type { ResumeDisplay } from "../../models/presentation";
import type { ResumeData } from "../../models/resume";
import { ProfileHeader } from "./ProfileHeader";

export function ResumePage({
  resume,
}: {
  resume: ResumeData;
  display: ResumeDisplay;
}) {
  return (
    <main className="mx-auto grid max-w-content gap-section px-page-mobile py-page-mobile md:px-page-desktop md:py-page-desktop">
      <ProfileHeader profile={resume.profile} />
    </main>
  );
}
