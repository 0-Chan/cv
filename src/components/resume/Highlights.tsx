import type { Experience } from "../../models/resume";
import { RichText } from "./RichText";

export function Highlights({
  items,
  ordered = false,
}: {
  items: Experience["highlights"];
  ordered?: boolean;
}) {
  if (items.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <List
      className={
        ordered
          ? "resume-highlights grid list-decimal gap-inline ps-list-indent"
          : "resume-highlights grid list-disc gap-inline ps-list-indent"
      }
    >
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 목록이며 클라이언트 상태가 없다.
        <li key={index}>
          <RichText content={item.content} />
        </li>
      ))}
    </List>
  );
}
