import type { ResumeDisplay } from "../../models/presentation";
import type { ProjectIssue } from "../../models/resume";
import { Highlights } from "./Highlights";
import { RichText } from "./RichText";

export function IssueItem({
  issue,
  number,
  labels,
}: {
  issue: ProjectIssue;
  number: number;
  labels: ResumeDisplay["labels"];
}) {
  return (
    <section className="grid min-w-0 gap-content">
      <h5 className="font-bold leading-heading">
        {labels.issue} {number} — {issue.title}
      </h5>
      <RichText content={issue.description} />
      <div className="grid gap-inline">
        <p className="font-semibold">{labels.approach}</p>
        <Highlights items={issue.approach} ordered />
      </div>
      <div className="grid gap-inline">
        <p className="font-semibold">{labels.outcomes}</p>
        <Highlights items={issue.outcomes} />
      </div>
    </section>
  );
}
