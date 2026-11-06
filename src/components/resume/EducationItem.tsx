import type { ResumeData } from "../../models/resume";
import { RichText } from "./RichText";

export function EducationItem({
  education,
}: {
  education: ResumeData["education"][number];
}) {
  return (
    <article className="grid min-w-0 gap-content border-rule not-first:border-t not-first:pt-item">
      <header className="grid gap-inline">
        <h3 className="text-project font-semibold leading-heading">
          {education.institution}
        </h3>
        <p>{education.program}</p>
        {(education.startDate || education.endDate) && (
          <p className="text-meta text-muted">
            {education.startDate}
            {education.startDate && education.endDate && " ~ "}
            {education.endDate}
          </p>
        )}
      </header>
      {education.description && <RichText content={education.description} />}
    </article>
  );
}
