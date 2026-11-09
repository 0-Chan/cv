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
      <header className="grid gap-compact">
        <p className="text-meta font-medium leading-heading text-muted">
          {labels.issue} {number}
        </p>
        <h5 className="text-issue font-bold leading-heading">{issue.title}</h5>
      </header>
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
