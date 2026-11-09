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
    <section className="grid min-w-0 gap-inline">
      <h5 className="text-issue font-bold leading-heading">
        {labels.issue}
        {number}. {issue.title}
      </h5>
      <RichText content={issue.description} compact />
      <div className="grid gap-compact">
        <h6 className="text-meta font-semibold text-muted">
          {labels.approach}
        </h6>
        <Highlights items={issue.approach} ordered compact />
      </div>
      <div className="grid gap-compact">
        <h6 className="text-meta font-semibold text-muted">
          {labels.outcomes}
        </h6>
        <Highlights items={issue.outcomes} compact />
      </div>
    </section>
  );
}
