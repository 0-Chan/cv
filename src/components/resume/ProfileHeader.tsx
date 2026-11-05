import type { ResumeData } from "../../models/resume";

export function ProfileHeader({ profile }: { profile: ResumeData["profile"] }) {
  const links = profile.links.map((link) => ({
    ...link,
    protocol: new URL(link.href).protocol,
  }));
  const details = [
    ...links.filter(
      (link) => link.protocol === "http:" || link.protocol === "https:",
    ),
    ...profile.contacts.map((contact) => ({
      label: contact.value,
      href: undefined,
    })),
    ...links.filter((link) => link.protocol === "tel:"),
    ...links.filter((link) => link.protocol === "mailto:"),
  ];

  return (
    <header className="grid gap-content">
      <div className="flex flex-wrap items-baseline gap-content">
        <h1 className="text-name font-bold leading-heading">{profile.name}</h1>
        <p className="text-role text-muted">{profile.role}</p>
      </div>
      {details.length > 0 && (
        <ul className="grid min-w-0 grid-cols-1 gap-inline text-meta text-muted">
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
