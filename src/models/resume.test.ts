import { describe, expect, it } from "vitest";
import { experienceSchema } from "./resume";
import { dateSchema } from "./shared";

const experience = {
  id: "experience-01",
  company: { name: "회사 A" },
  role: "직무",
  isCurrent: false,
};

describe("날짜 입력 계약", () => {
  it.each(["2024", "2024-01", "2024-12"])(
    "%s의 입력 정밀도를 유지한다",
    (value) => {
      expect(dateSchema.parse(value)).toBe(value);
    },
  );

  it.each([
    { value: "", reason: "빈 문자열은 날짜로 사용할 수 없다" },
    { value: " ", reason: "공백만 있는 문자열은 날짜로 사용할 수 없다" },
    { value: "0000", reason: "연도는 0001 이상이어야 한다" },
    { value: "2024-00", reason: "월은 01 이상이어야 한다" },
    { value: "2024-13", reason: "월은 12 이하여야 한다" },
    { value: "2024-1", reason: "월은 두 자리로 입력해야 한다" },
    {
      value: "2024-01-01",
      reason: "일 단위 날짜는 지원하지 않고 연도 또는 연월만 허용한다",
    },
    {
      value: null,
      reason: "날짜가 없으면 필드를 생략해야 하며 null은 허용하지 않는다",
    },
  ])("$reason — 입력값: $value", ({ value }) => {
    expect(dateSchema.safeParse(value).success).toBe(false);
  });
});

describe("경력의 날짜와 재직 여부", () => {
  it("종료일이 없어도 현재 재직으로 바꾸지 않는다", () => {
    const result = experienceSchema.parse(experience);

    expect(result.isCurrent).toBe(false);
    expect(result).not.toHaveProperty("startDate");
    expect(result).not.toHaveProperty("endDate");
    expect(result.projects).toEqual([]);
    expect(result.highlights).toEqual([]);
  });

  it("종료일 없는 현재 재직을 허용한다", () => {
    const result = experienceSchema.parse({
      ...experience,
      isCurrent: true,
    });

    expect(result.isCurrent).toBe(true);
    expect(result).not.toHaveProperty("endDate");
  });

  it.each([
    { isCurrent: undefined },
    { endDate: "" },
    { endDate: " " },
    { endDate: null },
    { isCurrent: true, endDate: "2024" },
    { startDate: "2025", endDate: "2024-12" },
    { startDate: "2024-12", endDate: "2024-01" },
  ])("잘못된 기간 또는 재직 정보를 거부한다: %j", (change) => {
    expect(
      experienceSchema.safeParse({
        ...experience,
        ...change,
      }).success,
    ).toBe(false);
  });

  it("연·연월의 가능한 기간이 겹치면 허용한다", () => {
    const result = experienceSchema.parse({
      ...experience,
      startDate: "2024-12",
      endDate: "2024",
    });

    expect(result.startDate).toBe("2024-12");
    expect(result.endDate).toBe("2024");
  });
});
