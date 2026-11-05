import type { Project } from "../../models/resume";
import { Highlights } from "./Highlights";
import { RichText } from "./RichText";

export function ProjectItem({
  project,
  roleLabel,
}: {
  project: Project;
  roleLabel: string;
}) {
  return (
    <article className="grid min-w-0 gap-content border-t border-rule pt-content">
      <h4 className="text-project font-semibold leading-heading">
        {project.title}
      </h4>
      <RichText content={project.description} />
      {project.role && (
        <div className="grid gap-inline">
          <p className="text-meta font-medium text-muted">{roleLabel}</p>
          <RichText content={project.role} />
        </div>
      )}
      <Highlights items={project.highlights} />
      {project.technologies.length > 0 && (
        <ul className="flex flex-wrap gap-inline text-tag text-muted">
          {project.technologies.map((technology, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 기술 목록이다.
            <li key={index} className="bg-surface px-inline">
              {technology.label}
            </li>
          ))}
        </ul>
      )}
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
