import type { Experience } from "../../models/resume";
import { RichText } from "./RichText";

export function Highlights({ items }: { items: Experience["highlights"] }) {
  if (items.length === 0) return null;
  return (
    <ul className="resume-highlights grid list-disc gap-inline ps-list-indent">
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 목록이며 클라이언트 상태가 없다.
        <li key={index}>
          <RichText content={item.content} />
        </li>
      ))}
    </ul>
  );
}
