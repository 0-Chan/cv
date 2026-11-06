import type { ResumeData } from "../../models/resume";
import { Highlights } from "./Highlights";
import { RichText } from "./RichText";
import { ResumeSection } from "./ResumeSection";

export function SummaryBlock({
  summary,
  title,
}: {
  summary: ResumeData["summary"];
  title: string;
}) {
  if (summary.items.length === 0) return null;
  return (
    <ResumeSection id="summary" title={title}>
      {summary.format === "list" ? (
        <Highlights items={summary.items} />
      ) : (
        summary.items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 전용 소개 문단이다.
          <RichText key={index} content={item.content} />
        ))
      )}
    </ResumeSection>
  );
}
