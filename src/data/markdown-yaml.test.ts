import { describe, expect, it } from "vitest";
import { stringify } from "yaml";
import { resumeSchema } from "../models/resume";
import type { RichText } from "../models/rich-text";
import { parseResumeMarkdown } from "./markdown";
import { ResumeValidationError } from "./validation";
import { parseResumeYaml } from "./yaml-source";

const profile = { name: "이름", role: "직무" };

function paragraph(text: string): RichText[number] {
  return {
    type: "paragraph",
    children: [{ type: "text", text }],
  };
}

describe("Markdown과 YAML 콘텐츠 변환", () => {
  it("강조의 중첩 구조와 코드·링크·문장 사이 공백을 보존한다", () => {
    const result = parseResumeMarkdown(
      "**강조 *중첩***와 `코드`, [안내](https://example.com)",
      "resume.yaml.summary",
    );

    expect(result).toEqual([
      {
        type: "paragraph",
        children: [
          {
            type: "strong",
            children: [
              { type: "text", text: "강조 " },
              {
                type: "emphasis",
                children: [{ type: "text", text: "중첩" }],
              },
            ],
          },
          { type: "text", text: "와 " },
          { type: "code", text: "코드" },
          { type: "text", text: ", " },
          {
            type: "link",
            href: "https://example.com",
            children: [{ type: "text", text: "안내" }],
          },
        ],
      },
    ]);
  });

  it.each([
    {
      reason: "문자열 소개는 문단별 항목으로 변환한다",
      summary: "첫 문단\n\n둘째 문단",
      expected: {
        format: "paragraphs",
        items: [
          { content: [paragraph("첫 문단")] },
          { content: [paragraph("둘째 문단")] },
        ],
      },
    },
    {
      reason: "목록 소개는 항목 순서와 항목 안의 문단 묶음을 유지한다",
      summary: ["첫 항목\n\n보충 문단", "둘째 항목"],
      expected: {
        format: "list",
        items: [
          { content: [paragraph("첫 항목"), paragraph("보충 문단")] },
          { content: [paragraph("둘째 항목")] },
        ],
      },
    },
  ])("$reason", ({ summary, expected }) => {
    const result = resumeSchema.parse(
      parseResumeYaml(stringify({ profile, summary })),
    );

    expect(result.summary).toEqual(expected);
  });

  it.each([
    ["HTML", "<span>소개</span>"],
    ["표", "| 제목 |\n| --- |\n| 내용 |"],
    ["실행 URL", "[안내](javascript:alert)"],
  ])(
    "제품 소개에 %s를 쓰면 해당 프로젝트의 작성 위치를 알린다",
    (_kind, description) => {
      const source = stringify({
        profile,
        experiences: [
          {
            company: "회사 A",
            role: "직무",
            isCurrent: false,
            projects: [{ title: "프로젝트 A", description }],
          },
        ],
      });
      const parse = () => parseResumeYaml(source);

      expect(parse).toThrow(ResumeValidationError);
      expect(parse).toThrow("resume.yaml.experiences.0.projects.0.description");
    },
  );

  it("연락처 매핑의 이름·값·순서를 목록에 보존한다", () => {
    const result = resumeSchema.parse(
      parseResumeYaml(
        stringify({
          profile: {
            ...profile,
            contacts: { 지역: "지역 이름", 전화: "010-0000-0000" },
          },
        }),
      ),
    );

    expect(result.profile.contacts).toEqual([
      { label: "지역", value: "지역 이름" },
      { label: "전화", value: "010-0000-0000" },
    ]);
  });
});
