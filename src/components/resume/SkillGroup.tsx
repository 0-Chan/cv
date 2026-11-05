import type { ResumeData } from "../../models/resume";

export function SkillGroup({ group }: { group: ResumeData["skills"][number] }) {
  if (group.items.length === 0) return null;

  return (
    <div className="grid min-w-0 gap-inline">
      <h3 className="text-project font-semibold leading-heading">
        {group.category}
      </h3>
      <ul className="flex flex-wrap gap-x-content gap-y-inline">
        {group.items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 기술 목록이며 클라이언트 상태가 없다.
          <li key={index}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}
