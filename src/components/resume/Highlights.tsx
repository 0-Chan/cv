import type { Experience } from "../../models/resume";
import { RichText } from "./RichText";

export function Highlights({
  items,
  ordered = false,
  compact = false,
}: {
  items: Experience["highlights"];
  ordered?: boolean;
  compact?: boolean;
}) {
  if (items.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <List
      className={[
        "resume-highlights grid ps-list-indent",
        ordered ? "list-decimal" : "list-disc",
        compact ? "gap-compact" : "gap-inline",
      ].join(" ")}
    >
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 목록이며 클라이언트 상태가 없다.
        <li key={index}>
          <RichText content={item.content} compact={compact} />
        </li>
      ))}
    </List>
  );
}
