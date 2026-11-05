import { describe, expect, it } from "vitest";
import { resumeSchema } from "../models/resume";
import { parseResumeYaml } from "./yaml-source";

describe("YAML 이력서 작성", () => {
  it("연락처·기술을 간단한 매핑으로 작성하고 빈 섹션은 생략할 수 있다", () => {
    const result = resumeSchema.parse(
      parseResumeYaml(`
profile:
  name: 이름
  role: 직무
  links:
    이메일: mailto:name@example.com
skills:
  기술 분류:
    - Astro
    - TypeScript
`),
    );

    expect(result.profile).toEqual({
      name: "이름",
      role: "직무",
      contacts: [],
      links: [{ label: "이메일", href: "mailto:name@example.com" }],
    });
    expect(result.skills).toEqual([
      {
        category: "기술 분류",
        items: [{ label: "Astro" }, { label: "TypeScript" }],
      },
    ]);
    expect(result.experiences).toEqual([]);
    expect(result.education).toEqual([]);
    expect(result.certifications).toEqual([]);
  });

  it("이름이 빈 문자열이면 작성 파일의 해당 필드 위치를 알린다", () => {
    expect(() =>
      parseResumeYaml(`
profile:
  name: ""
  role: 직무
`),
    ).toThrow("resume.yaml.profile.name");
  });

  it("같은 YAML 키를 두 번 쓰면 덮어쓰지 않고 오류 위치를 알린다", () => {
    const source = [
      "profile:",
      "  name: 이름",
      "  name: 중복 이름",
      "  role: 직무",
    ].join("\n");

    expect(() => parseResumeYaml(source)).toThrow(
      /resume\.yaml:\d+:\d+.*DUPLICATE_KEY/,
    );
  });
});
