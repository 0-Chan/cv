import type { ResumeDisplay } from "../../models/presentation";
import type { Project } from "../../models/resume";
import { IssueItem } from "./IssueItem";
import { RichText } from "./RichText";

export function ProjectItem({
  project,
  labels,
}: {
  project: Project;
  labels: ResumeDisplay["labels"];
}) {
  return (
    <article className="resume-project grid min-w-0 gap-content">
      <header className="grid min-w-0 gap-inline">
        <div className="grid min-w-0 gap-compact">
          <h4 className="text-project font-bold leading-heading text-shadow-project-title print:text-shadow-none forced-colors:text-shadow-none">
            {project.title}
          </h4>
          <div className="text-meta text-muted">
            <RichText content={project.description} compact />
          </div>
        </div>
        <dl className="grid min-w-0 grid-cols-1 gap-x-inline gap-y-compact text-meta sm:grid-cols-[max-content_minmax(0,1fr)]">
          <dt className="font-medium text-muted">{labels.projectRole}:</dt>
          <dd className="min-w-0 text-muted">
            <RichText content={project.role} compact />
          </dd>
        </dl>
      </header>
      <div className="grid min-w-0 gap-issue">
        {project.issues.map((issue, index) => (
          <IssueItem
            // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 이슈 목록이며 번호는 표시 순서다.
            key={index}
            issue={issue}
            number={index + 1}
            labels={labels}
          />
        ))}
      </div>
      {project.links.length > 0 && (
        <ul className="flex flex-wrap gap-content text-meta">
          {project.links.map((link, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 링크 목록이다.
            <li key={index}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
