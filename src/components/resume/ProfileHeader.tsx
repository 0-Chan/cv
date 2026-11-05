import type { ResumeData } from "../../models/resume";

export function ProfileHeader({ profile }: { profile: ResumeData["profile"] }) {
  return (
    <header className="grid gap-content">
      <div className="flex flex-wrap items-baseline gap-content">
        <h1 className="text-name font-bold leading-heading">{profile.name}</h1>
        <p className="text-role text-muted">{profile.role}</p>
      </div>
      {(profile.contacts.length > 0 || profile.links.length > 0) && (
        <ul className="flex flex-wrap gap-x-content gap-y-inline text-meta text-muted">
          {profile.contacts.map((contact, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 정적 목록이며 클라이언트 상태가 없다.
            <li key={index}>
              {contact.label}: {contact.value}
            </li>
          ))}
          {profile.links.map((link, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 정적 목록이며 클라이언트 상태가 없다.
            <li key={index}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
