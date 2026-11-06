import { describe, expect, it } from "vitest";
import { resumeSchema } from "../models/resume";
import { parseResumeYaml } from "./yaml-source";

describe("YAML 이력서 작성", () => {
  it("링크·기술 매핑의 값과 강조를 보존하고 빈 섹션은 빈 목록으로 만든다", () => {
    const result = resumeSchema.parse(
      parseResumeYaml(`
profile:
  name: 이름
  role: 직무
  links:
    이메일: mailto:name@example.com
skills:
  기술 분류:
    - "**Astro:** 정적 페이지를 만듭니다."
    - TypeScript
`),
    );

    expect(result.profile).toEqual({
      name: "이름",
      role: "직무",
      contacts: [],
      links: [{ label: "이메일", href: "mailto:name@example.com" }],
    });
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].category).toBe("기술 분류");
    expect(
      result.skills[0].items.map((item) => item.content[0].children),
    ).toEqual([
      [
        { type: "strong", children: [{ type: "text", text: "Astro:" }] },
        { type: "text", text: " 정적 페이지를 만듭니다." },
      ],
      [{ type: "text", text: "TypeScript" }],
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
      /resume\.yaml:3:3:.*DUPLICATE_KEY/,
    );
  });
});
