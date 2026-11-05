import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resumeDisplayConfig } from "../config/resume-display";
import { resumeThemeConfig } from "../config/resume-theme";
import type { ResumeDisplay, ResumeTheme } from "../models/presentation";
import type { ResumeInput } from "../models/resume";

const readResumeSource = vi.fn<() => Promise<unknown>>();
let display: ResumeDisplay;
let theme: ResumeTheme;
let resume: ResumeInput;
let loader: typeof import("./resume");

beforeEach(async () => {
  vi.resetModules();
  display = structuredClone(resumeDisplayConfig);
  theme = structuredClone(resumeThemeConfig);
  resume = {
    profile: { name: "검증 이름", role: "검증 직무" },
    summary: { format: "list", items: [] },
    experiences: [],
    skills: [],
    education: [],
    certifications: [],
  };
  readResumeSource.mockReset().mockResolvedValue(resume);

  vi.doMock("./local-source", () => ({ readResumeSource }));
  vi.doMock("../config/resume-display", () => ({
    resumeDisplayConfig: display,
  }));
  vi.doMock("../config/resume-theme", () => ({
    resumeThemeConfig: theme,
  }));
  loader = await import("./resume");
});

afterEach(() => {
  vi.doUnmock("./local-source");
  vi.doUnmock("../config/resume-display");
  vi.doUnmock("../config/resume-theme");
  vi.resetModules();
});

describe("페이지 데이터 로더", () => {
  it("콘텐츠·표시·테마 변경을 보존하고 생략한 선택 목록을 채운다", async () => {
    display.sections.reverse();
    display.sections[0].title = "검증 제목";
    display.sections[0].visible = false;
    theme.fontFamily = "serif";
    theme.fontSizes.body = 18;
    theme.spacing.inline = 0;

    const expected = {
      resume: {
        ...resume,
        profile: { ...resume.profile, contacts: [], links: [] },
      },
      display: structuredClone(display),
      theme: structuredClone(theme),
    };

    await expect(loader.getResumePageData()).resolves.toEqual(expected);
  });

  it.each([
    {
      reason: "섹션 키가 중복되면 두 번째 항목의 오류를 알린다",
      change: () => {
        display.sections[1].id = display.sections[0].id;
      },
      path: "display.sections.1.id",
    },
    {
      reason: "필수 섹션을 빼면 섹션 목록의 오류를 알린다",
      change: () => {
        display.sections.pop();
      },
      path: "display.sections",
    },
    {
      reason: "본문 글자 크기가 0이면 해당 크기 설정의 오류를 알린다",
      change: () => {
        theme.fontSizes.body = 0;
      },
      path: "theme.fontSizes.body",
    },
    {
      reason: "간격이 음수이면 해당 간격 설정의 오류를 알린다",
      change: () => {
        theme.spacing.inline = -1;
      },
      path: "theme.spacing.inline",
    },
    {
      reason: "글자 굵기가 900을 넘으면 해당 굵기 설정의 오류를 알린다",
      change: () => {
        theme.fontWeights.regular = 901;
      },
      path: "theme.fontWeights.regular",
    },
    {
      reason: "색상이 #RRGGBB 형식이 아니면 해당 색상 설정의 오류를 알린다",
      change: () => {
        theme.colors.text = "red";
      },
      path: "theme.colors.text",
    },
  ])("$reason", async ({ change, path }) => {
    change();
    const result = loader.getResumePageData();

    await expect(result).rejects.toBeInstanceOf(loader.ResumeValidationError);
    await expect(result).rejects.toMatchObject({
      issues: [{ path }],
    });
  });

  it("공급된 콘텐츠의 타입 오류는 필드 위치를 알리고 원본 값은 숨긴다", async () => {
    const marker = "오류 메시지에 노출하지 않을 원문";
    readResumeSource.mockResolvedValue({
      ...resume,
      profile: { ...resume.profile, name: { value: marker } },
    });
    const result = loader.getResumePageData();

    await expect(result).rejects.toBeInstanceOf(loader.ResumeValidationError);
    await expect(result).rejects.toMatchObject({
      issues: [{ path: "resume.profile.name" }],
      message: expect.not.stringContaining(marker),
    });
  });

  it("공급 실패를 정상 데이터로 대체하지 않고 원래 오류를 전달한다", async () => {
    const error = new Error("콘텐츠 공급 실패");
    readResumeSource.mockRejectedValue(error);

    await expect(loader.getResumePageData()).rejects.toBe(error);
  });
});
