import { describe, expect, it } from "vitest";
import { stringify } from "yaml";
import { resumeSchema } from "../models/resume";
import { ResumeValidationError } from "./validation";
import { parseResumeYaml } from "./yaml-source";

const profile = { name: "이름", role: "직무" };
const experience = {
  company: "회사 A",
  role: "직무",
  isCurrent: false,
};
const issue = {
  title: "이슈 A",
  description: "문제 상황입니다.",
  approach: ["해결 방향입니다."],
  outcomes: ["성과입니다."],
};
const project = {
  title: "프로젝트 A",
  description: "제품·서비스 소개입니다.",
  role: "핵심 역할입니다.",
  issues: [issue],
};
const certification = { name: "자격 A", issuer: "발급 기관 A" };

function projectInput(change: Record<string, unknown>) {
  return {
    experiences: [{ ...experience, projects: [{ ...project, ...change }] }],
  };
}

function parseInput(change: Record<string, unknown>) {
  return parseResumeYaml(stringify({ profile, ...change }));
}

function expectInputError(change: Record<string, unknown>, path: string) {
  let caught: unknown;

  try {
    parseInput(change);
  } catch (error) {
    caught = error;
  }

  expect(caught).toBeInstanceOf(ResumeValidationError);
  expect(caught).toMatchObject({
    issues: expect.arrayContaining([
      {
        path: `resume.yaml.${path}`,
        message: expect.any(String),
      },
    ]),
  });
}

describe("필수 콘텐츠 입력", () => {
  it.each([
    ["프로필 이름", { profile: { role: "직무" } }, "profile.name"],
    ["프로필 직무", { profile: { name: "이름" } }, "profile.role"],
    [
      "회사명",
      { experiences: [{ role: "직무", isCurrent: false }] },
      "experiences.0.company",
    ],
    [
      "회사 직무",
      { experiences: [{ company: "회사 A", isCurrent: false }] },
      "experiences.0.role",
    ],
    [
      "프로젝트 제목",
      {
        experiences: [
          { ...experience, projects: [{ description: "제품 소개입니다." }] },
        ],
      },
      "experiences.0.projects.0.title",
    ],
    [
      "프로젝트 제품 소개",
      {
        experiences: [{ ...experience, projects: [{ title: "프로젝트 A" }] }],
      },
      "experiences.0.projects.0.description",
    ],
    [
      "프로젝트 핵심 역할",
      projectInput({ role: undefined }),
      "experiences.0.projects.0.role",
    ],
    [
      "학력 기관명",
      { education: [{ program: "과정 A" }] },
      "education.0.institution",
    ],
    [
      "학력 과정",
      { education: [{ institution: "기관 A" }] },
      "education.0.program",
    ],
    [
      "자격명",
      { certifications: [{ issuer: "발급 기관 A" }] },
      "certifications.0.name",
    ],
    [
      "자격 발급 기관",
      { certifications: [{ name: "자격 A" }] },
      "certifications.0.issuer",
    ],
  ] as const)(
    "%s을 생략하면 수정할 필드 경로를 포함한 오류가 발생한다",
    (_label, input, path) => {
      expectInputError(input, path);
    },
  );
});

describe("빈 콘텐츠 입력", () => {
  it.each([
    [
      "소개에 공백만 작성하면 소개 필드의 오류를 알린다",
      { summary: " \t\n " },
      "summary",
    ],
    [
      "프로젝트 핵심 역할이 빈 문자열이면 해당 필드의 오류를 알린다",
      projectInput({ role: "" }),
      "experiences.0.projects.0.role",
    ],
    [
      "프로젝트 핵심 역할에 null을 작성하면 해당 필드의 오류를 알린다",
      projectInput({ role: null }),
      "experiences.0.projects.0.role",
    ],
    [
      "이슈 성과에 공백뿐인 문장을 넣으면 해당 항목의 오류를 알린다",
      projectInput({ issues: [{ ...issue, outcomes: [" "] }] }),
      "experiences.0.projects.0.issues.0.outcomes.0",
    ],
    [
      "이슈 목록이 비어 있으면 프로젝트의 이슈 필드 오류를 알린다",
      projectInput({ issues: [] }),
      "experiences.0.projects.0.issues",
    ],
    [
      "해결 방향이 비어 있으면 해당 이슈의 해결 방향 오류를 알린다",
      projectInput({ issues: [{ ...issue, approach: [] }] }),
      "experiences.0.projects.0.issues.0.approach",
    ],
    [
      "성과가 비어 있으면 해당 이슈의 성과 오류를 알린다",
      projectInput({ issues: [{ ...issue, outcomes: [] }] }),
      "experiences.0.projects.0.issues.0.outcomes",
    ],
    [
      "기술 목록에 빈 문자열을 넣으면 해당 항목의 오류를 알린다",
      { skills: { "기술 분류": [""] } },
      "skills.기술 분류.0",
    ],
    [
      "연락처 이름이 공백뿐이면 해당 매핑 키의 오류를 알린다",
      { profile: { ...profile, contacts: { " ": "연락처 값" } } },
      "profile.contacts. ",
    ],
    [
      "기술 분류 이름이 공백뿐이면 해당 매핑 키의 오류를 알린다",
      { skills: { " ": ["Astro"] } },
      "skills. ",
    ],
  ] as const)("%s", (_reason, input, path) => {
    expectInputError(input, path);
  });
});

describe("링크 입력", () => {
  it.each(["http://example.com/project", "https://example.com/project"])(
    "프로젝트·자격의 HTTP(S) 링크는 이름과 주소를 보존한다 — %s",
    (href) => {
      const result = resumeSchema.parse(
        parseInput({
          ...projectInput({ links: { 소개: href } }),
          certifications: [
            { ...certification, verificationLink: { 확인: href } },
          ],
        }),
      );

      expect(result.experiences[0].projects[0].links).toEqual([
        { label: "소개", href },
      ]);
      expect(result.certifications[0].verificationLink).toEqual({
        label: "확인",
        href,
      });
    },
  );

  it("프로필 전화 링크는 tel 주소와 표시 이름을 보존한다", () => {
    const result = resumeSchema.parse(
      parseInput({
        profile: {
          ...profile,
          links: { 전화: "tel:+82-10-0000-0000" },
        },
      }),
    );

    expect(result.profile.links).toEqual([
      { label: "전화", href: "tel:+82-10-0000-0000" },
    ]);
  });

  it.each([
    ["JavaScript 실행 주소", "javascript:alert(1)"],
    ["데이터 URL", "data:text/plain,sample"],
    ["사용자 이름이 없는 이메일 주소", "mailto:@example.com"],
    ["번호 대신 문자가 들어간 전화 주소", "tel:phone"],
    ["호스트가 없는 웹 주소", "https://"],
  ])("프로필에 %s를 넣으면 링크 작성 위치의 오류를 알린다", (_reason, href) => {
    expectInputError(
      { profile: { ...profile, links: { 연락: href } } },
      "profile.links.연락",
    );
  });

  it("프로젝트 링크에 상대 경로를 넣으면 해당 링크의 오류를 알린다", () => {
    expectInputError(
      projectInput({ links: { 소개: "/project" } }),
      "experiences.0.projects.0.links.소개",
    );
  });

  it.each([
    [
      "프로젝트",
      projectInput({ links: { 이메일: "mailto:name@example.com" } }),
      "experiences.0.projects.0.links.이메일",
    ],
    [
      "자격 확인",
      {
        certifications: [
          {
            ...certification,
            verificationLink: { 이메일: "mailto:name@example.com" },
          },
        ],
      },
      "certifications.0.verificationLink.이메일",
    ],
  ] as const)(
    "%s 링크에 이메일 주소를 넣으면 HTTP(S) 전용 필드의 오류를 알린다",
    (_label, input, path) => {
      expectInputError(input, path);
    },
  );

  it.each([
    ["빈 매핑", {}],
    [
      "두 개의 링크",
      { 확인: "https://example.com/a", 추가: "https://example.com/b" },
    ],
  ] as const)(
    "자격 확인 링크를 %s으로 작성하면 한 쌍만 허용하는 필드의 오류를 알린다",
    (_reason, verificationLink) => {
      expectInputError(
        { certifications: [{ ...certification, verificationLink }] },
        "certifications.0.verificationLink",
      );
    },
  );
});

describe("회사 로고와 자격 배지 입력", () => {
  it.each([
    "/images/sample.png",
    "http://example.com/sample.png",
    "https://example.com/sample.png",
  ])(
    "지원하는 이미지 주소와 대체 텍스트를 로고·배지에 보존한다 — %s",
    (src) => {
      const logo = { src, alt: "회사 A 로고" };
      const badge = { src, alt: "자격 A 배지" };
      const result = resumeSchema.parse(
        parseInput({
          experiences: [{ ...experience, logo }],
          certifications: [{ ...certification, badge }],
        }),
      );

      expect(result.experiences[0].company.logo).toEqual(logo);
      expect(result.certifications[0].badge).toEqual(badge);
    },
  );

  it.each([
    ["이미지 주소를 생략하면", { alt: "회사 A 로고" }, "src"],
    [
      "상대 경로를 사용하면",
      { src: "images/logo.png", alt: "회사 A 로고" },
      "src",
    ],
    [
      "프로토콜을 생략한 외부 주소를 사용하면",
      { src: "//example.com/logo.png", alt: "회사 A 로고" },
      "src",
    ],
    [
      "데이터 URL을 사용하면",
      { src: "data:image/png;base64,AA==", alt: "회사 A 로고" },
      "src",
    ],
    ["대체 텍스트를 생략하면", { src: "/logo.png" }, "alt"],
    [
      "대체 텍스트를 빈 문자열로 작성하면",
      { src: "/logo.png", alt: "" },
      "alt",
    ],
    ["대체 텍스트에 공백만 작성하면", { src: "/logo.png", alt: " \t " }, "alt"],
  ] as const)(
    "회사 로고의 %s 해당 이미지 필드의 오류를 알린다",
    (_reason, logo, field) => {
      expectInputError(
        { experiences: [{ ...experience, logo }] },
        `experiences.0.logo.${field}`,
      );
    },
  );

  it("자격 배지도 대체 텍스트가 없으면 배지의 해당 필드 오류를 알린다", () => {
    expectInputError(
      {
        certifications: [{ ...certification, badge: { src: "/badge.png" } }],
      },
      "certifications.0.badge.alt",
    );
  });

  it("로고·배지·확인 링크를 생략하면 해당 필드를 생성하지 않는다", () => {
    const result = resumeSchema.parse(
      parseInput({
        experiences: [experience],
        certifications: [certification],
      }),
    );

    expect(result.experiences[0].company).not.toHaveProperty("logo");
    expect(result.certifications[0]).not.toHaveProperty("badge");
    expect(result.certifications[0]).not.toHaveProperty("verificationLink");
  });
});
