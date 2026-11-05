import { describe, expect, it } from "vitest";
import { resumeSchema } from "../models/resume";
import type { RichText } from "../models/rich-text";
import { parseResumeYaml } from "./yaml-source";

function paragraph(text: string): RichText {
  return [
    {
      type: "paragraph",
      children: [{ type: "text", text }],
    },
  ];
}

const baseYaml = `
profile:
  name: 이름
  role: 직무
experiences:
  - company: 회사 A
    role: 회사에서의 직무
    isCurrent: false
`;

const companySummaryYaml = `
    highlights:
      - 회사 전체 업무 요약입니다.
`;

const projectYaml = `
    projects:
      - title: 프로젝트 A
        description: 제품·서비스 소개입니다.
        role: 프로젝트 담당 범위입니다.
        highlights:
          - 프로젝트 수행 내용입니다.
`;

const companyHighlights = [
  { content: paragraph("회사 전체 업무 요약입니다.") },
];

const expectedProject = {
  title: "프로젝트 A",
  description: paragraph("제품·서비스 소개입니다."),
  role: paragraph("프로젝트 담당 범위입니다."),
  highlights: [{ content: paragraph("프로젝트 수행 내용입니다.") }],
  technologies: [],
  links: [],
};

describe("YAML 경력 콘텐츠 변환", () => {
  it.each([
    {
      reason: "회사 요약만 작성하면 프로젝트를 생성하지 않는다",
      content: companySummaryYaml,
      expectedHighlights: companyHighlights,
      expectedProjects: [],
    },
    {
      reason: "프로젝트만 작성하면 회사 요약을 생성하지 않는다",
      content: projectYaml,
      expectedHighlights: [],
      expectedProjects: [expectedProject],
    },
    {
      reason:
        "회사 요약과 프로젝트를 함께 작성해도 내용을 서로 복사하지 않는다",
      content: companySummaryYaml + projectYaml,
      expectedHighlights: companyHighlights,
      expectedProjects: [expectedProject],
    },
  ])("$reason", ({ content, expectedHighlights, expectedProjects }) => {
    const result = resumeSchema.parse(parseResumeYaml(baseYaml + content));

    expect(result.experiences).toHaveLength(1);

    const experience = result.experiences[0];

    expect(experience.highlights).toEqual(expectedHighlights);
    expect(experience.projects).toEqual(expectedProjects);
  });

  it("담당 역할을 생략해도 제품 소개나 회사 직무를 역할로 복사하지 않는다", () => {
    const result = resumeSchema.parse(
      parseResumeYaml(
        baseYaml +
          `
    projects:
      - title: 프로젝트 A
        description: 제품·서비스 소개입니다.
`,
      ),
    );

    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].projects).toHaveLength(1);

    const project = result.experiences[0].projects[0];

    expect(project.description).toEqual(paragraph("제품·서비스 소개입니다."));
    expect(project).not.toHaveProperty("role");
  });
});
