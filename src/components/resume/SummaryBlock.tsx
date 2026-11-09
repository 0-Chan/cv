import type { ResumeData } from "../../models/resume";
import { Highlights } from "./Highlights";
import { RichText } from "./RichText";
import { ResumeSection } from "./ResumeSection";

export function SummaryBlock({
  summary,
  title,
  showTitle = true,
}: {
  summary: ResumeData["summary"];
  title: string;
  showTitle?: boolean;
}) {
  if (summary.items.length === 0) return null;
  return (
    <ResumeSection id="summary" title={title} showTitle={showTitle}>
      {summary.format === "list" ? (
        <Highlights items={summary.items} />
      ) : (
        <div className="grid min-w-0 gap-content">
          {summary.items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 소개 문단이다.
            <RichText key={index} content={item.content} />
          ))}
        </div>
      )}
    </ResumeSection>
  );
}
