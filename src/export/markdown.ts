import type { BlockContent, PhrasingContent, Root } from "mdast";
import { toMarkdown } from "mdast-util-to-markdown";
import type { ResumeDisplay } from "../models/presentation";
import type { ResumeData } from "../models/resume";
import type { InlineNode, RichText } from "../models/rich-text";
import {
  formatPeriod,
  getProfileDetails,
  getVisibleResumeSections,
} from "../presentation/resume";

function inline(node: InlineNode): PhrasingContent {
  switch (node.type) {
    case "text":
      return { type: "text", value: node.text };
    case "code":
      return { type: "inlineCode", value: node.text };
    case "break":
      return { type: "break" };
    case "strong":
    case "emphasis":
      return { type: node.type, children: node.children.map(inline) };
    case "link":
      return {
        type: "link",
        url: node.href,
        title: node.title,
        children: node.children.map(inline),
      };
  }
}

const paragraphs = (content: RichText): BlockContent[] =>
  content.map((paragraph) => ({
    type: "paragraph",
    children: paragraph.children.map(inline),
  }));
const text = (value: string): PhrasingContent => ({ type: "text", value });
const labeledParagraphs = (label: string, content: RichText): BlockContent[] =>
  content.map((item, index) => ({
    type: "paragraph",
    children: [
      ...(index === 0
        ? [
            { type: "strong" as const, children: [text(`${label}:`)] },
            text(" "),
          ]
        : []),
      ...item.children.map(inline),
    ],
  }));
const paragraph = (value: string): BlockContent => ({
  type: "paragraph",
  children: [text(value)],
});
const heading = (
  depth: 1 | 2 | 3 | 4 | 5 | 6,
  value: string,
): BlockContent => ({
  type: "heading",
  depth,
  children: [text(value)],
});
const linkParagraph = (label: string, url: string): BlockContent => ({
  type: "paragraph",
  children: [{ type: "link", url, children: [text(label)] }],
});

function highlights(
  items: { content: RichText }[],
  ordered = false,
): BlockContent[] {
  return items.length
    ? [
        {
          type: "list",
          ordered,
          spread: false,
          children: items.map((item) => ({
            type: "listItem",
            spread: item.content.length > 1,
            children: paragraphs(item.content),
          })),
        },
      ]
    : [];
}

export function renderResumeMarkdown(
  resume: ResumeData,
  display: ResumeDisplay,
): string {
  const children: BlockContent[] = [
    heading(1, resume.profile.name),
    paragraph(resume.profile.role),
    ...getProfileDetails(resume.profile).map((detail) =>
      detail.href
        ? linkParagraph(detail.label, detail.href)
        : paragraph(detail.label),
    ),
  ];
  for (const section of getVisibleResumeSections(resume, display)) {
    children.push(heading(2, section.title));
    switch (section.id) {
      case "summary":
        children.push(
          ...(section.content.format === "list"
            ? highlights(section.content.items)
            : section.content.items.flatMap((item) =>
                paragraphs(item.content),
              )),
        );
        break;
      case "experiences":
        for (const experience of section.content) {
          children.push(
            heading(3, experience.company.name),
            paragraph(experience.role),
          );
          const period = formatPeriod(
            experience.startDate,
            experience.isCurrent ? display.labels.current : experience.endDate,
          );
          if (period) children.push(paragraph(period));
          if (experience.tags.length) {
            children.push(
              paragraph(experience.tags.map((tag) => tag.label).join(" · ")),
            );
          }
          children.push(...highlights(experience.highlights));
          for (const project of experience.projects) {
            children.push(
              heading(4, project.title),
              ...labeledParagraphs(
                display.labels.projectDescription,
                project.description,
              ),
            );
            if (project.technologies.length) {
              children.push(
                paragraph(
                  `${display.labels.projectTechnologies}: ${project.technologies.map((item) => item.label).join(", ")}`,
                ),
              );
            }
            children.push(
              ...labeledParagraphs(display.labels.projectRole, project.role),
            );
            project.issues.forEach((issue, index) => {
              children.push(
                heading(
                  5,
                  `${display.labels.issue}${index + 1}. ${issue.title}`,
                ),
                ...paragraphs(issue.description),
                heading(6, display.labels.approach),
                ...highlights(issue.approach, true),
                heading(6, display.labels.outcomes),
                ...highlights(issue.outcomes),
              );
            });
            children.push(
              ...project.links.map((link) =>
                linkParagraph(link.label, link.href),
              ),
            );
          }
        }
        break;
      case "skills":
        for (const group of section.content) {
          children.push(heading(3, group.category), ...highlights(group.items));
        }
        break;
      case "education":
        for (const item of section.content) {
          children.push(heading(3, item.institution), paragraph(item.program));
          const period = formatPeriod(item.startDate, item.endDate);
          if (period) children.push(paragraph(period));
          if (item.description) children.push(...paragraphs(item.description));
        }
        break;
      case "certifications":
        for (const item of section.content) {
          children.push(heading(3, item.name), paragraph(item.issuer));
          if (item.issuedAt)
            children.push(
              paragraph(`${display.labels.issuedAt} ${item.issuedAt}`),
            );
          if (item.verificationLink) {
            children.push(
              linkParagraph(
                item.verificationLink.label,
                item.verificationLink.href,
              ),
            );
          }
        }
        break;
    }
  }
  const document: Root = { type: "root", children };
  return toMarkdown(document, { bullet: "-", emphasis: "*", strong: "*" });
}
