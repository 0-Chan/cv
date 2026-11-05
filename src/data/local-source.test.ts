import { expect, it, vi } from "vitest";
import { readResumeSource } from "./local-source";
import { ResumeValidationError } from "./validation";

vi.mock("../config/resume.yaml?raw", () => ({ default: "" }));

it("빈 YAML 파일은 정상 빈 이력서로 바꾸지 않고 파일 위치의 오류를 알린다", async () => {
  const result = readResumeSource();

  await expect(result).rejects.toBeInstanceOf(ResumeValidationError);
  await expect(result).rejects.toMatchObject({
    issues: [{ path: "src/config/resume.yaml" }],
  });
});
