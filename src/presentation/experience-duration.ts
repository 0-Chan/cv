import type { ResumeDisplay } from "../models/presentation";
import type { Experience } from "../models/resume";

function getReferenceMonth(): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month)
    throw new Error("근속 기간의 기준 연월을 확인할 수 없습니다.");
  return `${year}-${month}`;
}

// 정적 빌드의 웹·PDF·Markdown이 모듈을 공유하며 같은 서울 기준월을 사용한다.
const referenceMonth = getReferenceMonth();

function monthIndex(value?: string): number | undefined {
  const match = value?.match(/^(?!0000)(\d{4})-(0[1-9]|1[0-2])$/);
  return match ? Number(match[1]) * 12 + Number(match[2]) - 1 : undefined;
}

/** 입·퇴사월을 포함한다. 연도만 있거나 필요한 날짜가 없으면 추정하지 않는다. */
export function formatExperienceDuration(
  experience: Pick<Experience, "startDate" | "endDate" | "isCurrent">,
  labels: Pick<ResumeDisplay["labels"], "durationYear" | "durationMonth">,
  currentMonth = referenceMonth,
): string | undefined {
  const start = monthIndex(experience.startDate);
  const end = monthIndex(
    experience.isCurrent ? currentMonth : experience.endDate,
  );
  if (start === undefined || end === undefined || end < start) return undefined;

  const totalMonths = end - start + 1;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return [
    years ? `${years}${labels.durationYear}` : undefined,
    months ? `${months}${labels.durationMonth}` : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}
