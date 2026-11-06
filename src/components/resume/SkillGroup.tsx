import type { ResumeData } from "../../models/resume";
import { Highlights } from "./Highlights";

export function SkillGroup({ group }: { group: ResumeData["skills"][number] }) {
  if (group.items.length === 0) return null;

  return (
    <div className="grid min-w-0 gap-inline">
      <h3 className="text-project font-bold leading-heading">
        {group.category}
      </h3>
      <Highlights items={group.items} />
    </div>
  );
}
