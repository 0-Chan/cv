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
  let summary: ResumeInput["summary"];
  if (typeof data.summary === "string") {
    summary = {
      format: "paragraphs",
      items: markdown(data.summary, "summary").map((paragraph) => ({
        content: [paragraph],
      })),
    };
  } else if (data.summary === undefined || Array.isArray(data.summary)) {
    summary = {
      format: "list",
      items: sentences(data.summary ?? [], "summary"),
    };
  } else {
    summary = {
      ...(data.summary.lead === undefined
        ? {}
        : { lead: markdown(data.summary.lead, "summary.lead") }),
      format: "list",
      items: sentences(data.summary.items, "summary.items"),
    };
  }
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
              issues,
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
              role: markdown(role, `${path}.role`),
              issues: issues.map((issue, issueIndex) => {
                const issuePath = `${path}.issues.${issueIndex}`;
                return {
                  title: issue.title,
                  description: markdown(
                    issue.description,
                    `${issuePath}.description`,
                  ),
                  approach: sentences(issue.approach, `${issuePath}.approach`),
                  outcomes: sentences(issue.outcomes, `${issuePath}.outcomes`),
                };
              }),
              technologies: labels(technologies),
              links: links(projectLinks),
            };
          },
        ),
      }),
    ),
    skills: Object.entries(data.skills).map(([category, items]) => ({
      category,
      items: sentences(items, `skills.${category}`),
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
