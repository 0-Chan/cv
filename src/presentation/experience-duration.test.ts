import { expect, it } from "vitest";
import { formatExperienceDuration } from "./experience-duration";

const labels = { durationYear: "년", durationMonth: "개월" };

it("2021-01부터 2022-06까지 입·퇴사월을 포함해 1년 6개월로 표시한다", () => {
  expect(
    formatExperienceDuration(
      { startDate: "2021-01", endDate: "2022-06", isCurrent: false },
      labels,
      "2026-11",
    ),
  ).toBe("1년 6개월");
});

it("현재 재직은 기준월이 다음 해 1월이 되면 한 달 증가하고 0개월을 생략한다", () => {
  const experience = { startDate: "2023-02", isCurrent: true };

  expect(formatExperienceDuration(experience, labels, "2026-12")).toBe(
    "3년 11개월",
  );

  expect(formatExperienceDuration(experience, labels, "2027-01")).toBe("4년");
});

it("입사월과 퇴사월이 같으면 1개월로 표시한다", () => {
  expect(
    formatExperienceDuration(
      { startDate: "2024-01", endDate: "2024-01", isCurrent: false },
      labels,
      "2026-11",
    ),
  ).toBe("1개월");
});

it("시작일이 연도만 있으면 월을 추정하지 않고 근속 기간을 생략한다", () => {
  expect(
    formatExperienceDuration(
      { startDate: "2021", endDate: "2022-06", isCurrent: false },
      labels,
      "2026-11",
    ),
  ).toBeUndefined();
});

it("현재 재직이 아니면서 종료일이 없으면 현재 월로 대신 계산하지 않는다", () => {
  expect(
    formatExperienceDuration(
      { startDate: "2023-02", isCurrent: false },
      labels,
      "2026-11",
    ),
  ).toBeUndefined();
});
