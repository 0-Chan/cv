import { IconArrowRight, IconCheck } from "@tabler/icons-react";
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
      <header className="grid min-w-0 gap-compact">
        <h5 className="text-issue font-bold leading-heading text-issue-heading">
          {labels.issue}
          {number}. {issue.title}
        </h5>
        <div className="text-meta text-muted">
          <RichText content={issue.description} compact />
        </div>
      </header>
      <div className="grid gap-inline pt-inline">
        <h6 className="flex items-center gap-inline text-body font-bold leading-heading text-ink">
          <IconArrowRight
            className="size-[1em] shrink-0"
            aria-hidden="true"
            focusable="false"
          />
          {labels.approach}
        </h6>
        <Highlights items={issue.approach} ordered compact />
      </div>
      <div className="grid gap-inline pt-inline">
        <h6 className="flex items-center gap-inline text-body font-bold leading-heading text-ink">
          <IconCheck
            className="size-[1em] shrink-0"
            aria-hidden="true"
            focusable="false"
          />
          {labels.outcomes}
        </h6>
        <Highlights items={issue.outcomes} compact />
      </div>
    </section>
  );
}
