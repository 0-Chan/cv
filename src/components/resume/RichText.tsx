import type { RichText as Content } from "../../models/rich-text";
import { InlineContent } from "./InlineContent";

export function RichText({
  content,
  compact = false,
}: {
  content: Content;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "grid gap-inline" : "grid gap-content"}>
      {content.map((paragraph, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 정적 문단에는 클라이언트 상태가 없다.
        <p key={index} className="whitespace-pre-line">
          <InlineContent nodes={paragraph.children} />
        </p>
      ))}
    </div>
  );
}
