import { LineCounter, parseDocument } from "yaml";
import { resumeAuthoringSchema } from "../models/authoring";
import type { ResumeInput } from "../models/resume";
import { parseResumeMarkdown } from "./markdown";
import { parseConfig, ResumeValidationError } from "./validation";

export function parseResumeYaml(
  source: string,
  filename = "resume.yaml",
): ResumeInput {
  const lineCounter = new LineCounter();
  const document = parseDocument(source, {
    lineCounter,
    prettyErrors: false,
    uniqueKeys: true,
  });
  const problems = [...document.errors, ...document.warnings];
  if (problems.length) {
    throw new ResumeValidationError(
      problems.map((problem) => {
        const { line, col } = lineCounter.linePos(problem.pos[0]);
        return {
          path: `${filename}:${line}:${col}`,
          message: `YAML 문법을 확인하세요 (${problem.code}).`,
        };
      }),
    );
  }
  let raw: unknown;
  try {
    raw = document.toJS();
  } catch {
    throw new ResumeValidationError([
      {
        path: filename,
        message:
          "YAML 문서를 변환할 수 없습니다. 참조와 자료 구조를 확인하세요.",
      },
    ]);
  }
  const data = parseConfig(resumeAuthoringSchema, raw, filename);
  const markdown = (value: string, path: string) =>
    parseResumeMarkdown(value, `${filename}.${path}`);
  const sentences = (values: string[], path: string) =>
    values.map((value, index) => ({
      content: markdown(value, `${path}.${index}`),
    }));
  const labels = (values: string[]) => values.map((label) => ({ label }));
  const links = (values: Record<string, string>) =>
    Object.entries(values).map(([label, href]) => ({ label, href }));
  const summary: ResumeInput["summary"] =
    typeof data.summary === "string"
      ? {
          format: "paragraphs",
          items: markdown(data.summary, "summary").map((paragraph) => ({
            content: [paragraph],
          })),
        }
      : { format: "list", items: sentences(data.summary ?? [], "summary") };
  return {
    profile: {
      ...data.profile,
      contacts: Object.entries(data.profile.contacts).map(([label, value]) => ({
        label,
        value,
      })),
      links: links(data.profile.links),
    },
    summary,
    experiences: data.experiences.map(
      ({ company, logo, highlights, tags, projects, ...entry }, index) => ({
        ...entry,
        company: { name: company, ...(logo ? { logo } : {}) },
        tags: labels(tags),
        highlights: sentences(highlights, `experiences.${index}.highlights`),
        projects: projects.map(
          (
            {
              description,
              role,
              highlights,
              technologies,
              links: projectLinks,
              ...project
            },
            projectIndex,
          ) => {
            const path = `experiences.${index}.projects.${projectIndex}`;
            return {
              ...project,
              description: markdown(description, `${path}.description`),
              ...(role === undefined
                ? {}
                : { role: markdown(role, `${path}.role`) }),
              highlights: sentences(highlights, `${path}.highlights`),
              technologies: labels(technologies),
              links: links(projectLinks),
            };
          },
        ),
      }),
    ),
    skills: Object.entries(data.skills).map(([category, items]) => ({
      category,
      items: labels(items),
    })),
    education: data.education.map(({ description, ...entry }, index) => ({
      ...entry,
      ...(description === undefined
        ? {}
        : {
            description: markdown(
              description,
              `education.${index}.description`,
            ),
          }),
    })),
    certifications: data.certifications.map(
      ({ verificationLink, ...entry }) => ({
        ...entry,
        ...(verificationLink === undefined
          ? {}
          : { verificationLink: links(verificationLink)[0] }),
      }),
    ),
  };
}
