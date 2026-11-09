import type { ResumeData } from "../../models/resume";
import { getProfileDetails } from "../../presentation/resume";
import { RichText } from "./RichText";

export function ProfileHeader({
  profile,
  summaryLead,
}: {
  profile: ResumeData["profile"];
  summaryLead?: ResumeData["summary"]["lead"];
}) {
  const details = getProfileDetails(profile);

  return (
    <header className="grid min-w-0 flex-1 gap-content">
      <div className="flex flex-wrap items-baseline gap-content">
        <h1 className="text-name font-bold leading-heading">{profile.name}</h1>
        <p className="text-role text-muted">{profile.role}</p>
      </div>
      {summaryLead && (
        <div className="resume-lead-callout text-summary-lead">
          <RichText content={summaryLead} />
        </div>
      )}
      {details.length > 0 && (
        <ul className="grid min-w-0 grid-cols-1 gap-compact text-meta text-muted">
          {details.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 정적 목록이며 클라이언트 상태가 없다.
            <li key={index} className="min-w-0">
              {item.href ? <a href={item.href}>{item.label}</a> : item.label}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
