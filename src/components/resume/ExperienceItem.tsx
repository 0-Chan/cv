import type { ResumeDisplay } from "../../models/presentation";
import type { Experience } from "../../models/resume";
import { assetUrl } from "./asset-url";
import { Highlights } from "./Highlights";
import { ProjectItem } from "./ProjectItem";

export function ExperienceItem({
  experience,
  labels,
}: {
  experience: Experience;
  labels: ResumeDisplay["labels"];
}) {
  const end = experience.isCurrent ? labels.current : experience.endDate;
  return (
    <article className="grid min-w-0 gap-section-content border-rule not-first:border-t not-first:pt-company-half">
      <header className="grid gap-inline">
        <div className="grid min-w-0 gap-compact">
          <div className="flex min-w-0 items-center gap-inline">
            <h3 className="text-company font-bold leading-heading text-heading">
              {experience.company.name}
            </h3>
            {experience.company.logo && (
              <img
                src={assetUrl(experience.company.logo.src)}
                alt={experience.company.logo.alt}
                width={32}
                height={32}
                className="resume-brand-image size-company-logo shrink-0 object-contain"
                loading="lazy"
              />
            )}
          </div>
          <p className="font-medium">{experience.role}</p>
          {(experience.startDate || end) && (
            <p className="text-meta text-muted">
              {experience.startDate && (
                <time dateTime={experience.startDate}>
                  {experience.startDate}
                </time>
              )}
              {experience.startDate && end && " ~ "}
              {experience.isCurrent
                ? labels.current
                : experience.endDate && (
                    <time dateTime={experience.endDate}>
                      {experience.endDate}
                    </time>
                  )}
            </p>
          )}
        </div>
        {experience.tags.length > 0 && (
          <ul className="flex flex-wrap gap-inline text-tag text-muted">
            {experience.tags.map((tag, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 태그 목록이다.
              <li key={index} className="bg-tag-surface px-inline">
                {tag.label}
              </li>
            ))}
          </ul>
        )}
      </header>
      {(experience.highlights.length > 0 || experience.projects.length > 0) && (
        <div className="grid min-w-0 gap-project-half">
          <Highlights items={experience.highlights} />
          {experience.projects.map((project, index) => (
            <ProjectItem
              // biome-ignore lint/suspicious/noArrayIndexKey: 상태 없는 정적 프로젝트 목록이며 콘텐츠 ID를 요구하지 않는다.
              key={index}
              project={project}
              labels={labels}
            />
          ))}
        </div>
      )}
    </article>
  );
}
