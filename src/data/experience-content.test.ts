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
        issues:
          - title: 이슈 A
            description: 문제 상황입니다.
            approach:
              - 해결 방향입니다.
            outcomes:
              - 성과입니다.
`;

const companyHighlights = [
  { content: paragraph("회사 전체 업무 요약입니다.") },
];

const expectedProject = {
  title: "프로젝트 A",
  description: paragraph("제품·서비스 소개입니다."),
  role: paragraph("프로젝트 담당 범위입니다."),
  issues: [
    {
      title: "이슈 A",
      description: paragraph("문제 상황입니다."),
      approach: [{ content: paragraph("해결 방향입니다.") }],
      outcomes: [{ content: paragraph("성과입니다.") }],
    },
  ],
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

  it("두 이슈의 설명·해결 방향·성과를 각 이슈에 속한 순서대로 보존한다", () => {
    const result = resumeSchema.parse(
      parseResumeYaml(
        baseYaml +
          projectYaml +
          `
          - title: 이슈 B
            description: 둘째 문제입니다.
            approach:
              - 둘째 해결입니다.
            outcomes:
              - 둘째 성과입니다.
`,
      ),
    );

    expect(result.experiences[0].projects[0].issues).toEqual([
      ...expectedProject.issues,
      {
        title: "이슈 B",
        description: paragraph("둘째 문제입니다."),
        approach: [{ content: paragraph("둘째 해결입니다.") }],
        outcomes: [{ content: paragraph("둘째 성과입니다.") }],
      },
    ]);
  });

  it("이슈 해결 방향에 HTML을 쓰면 해당 목록 항목의 작성 위치를 알린다", () => {
    expect(() =>
      parseResumeYaml(
        (baseYaml + projectYaml).replace(
          "해결 방향입니다.",
          "<span>해결</span>",
        ),
      ),
    ).toThrow("resume.yaml.experiences.0.projects.0.issues.0.approach.0");
  });
});
