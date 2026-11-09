import { resolve } from "node:path";
import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { Fragment, type ReactNode } from "react";
import type { ResumeDisplay, ResumeTheme } from "../models/presentation";
import type { ResumeData } from "../models/resume";
import type { InlineNode, RichText } from "../models/rich-text";
import {
  formatPeriod,
  getProfileDetails,
  getVisibleResumeSections,
} from "../presentation/resume";

Font.register({
  family: "ResumeKorean",
  fonts: [
    {
      src: resolve("assets/fonts/nanum-gothic/NanumGothic-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: resolve("assets/fonts/nanum-gothic/NanumGothic-Bold.ttf"),
      fontWeight: 700,
    },
  ],
});

// 한국어 어절 중간에 불필요한 하이픈이 삽입되지 않게 한다.
Font.registerHyphenationCallback((word) => [word]);

function imageSource(src: string) {
  return src.startsWith("/") && !src.startsWith("//")
    ? resolve("public", src.slice(1))
    : src;
}

/** PDF의 pt 단위에 맞춰 웹 테마의 px 값을 변환한다. */
function createStyles(theme: ResumeTheme) {
  const pt = (px: number) => px * 0.75;
  const { colors, spacing, fontSizes, lineHeights, widths } = theme;
  return StyleSheet.create({
    page: {
      backgroundColor: "#ffffff",
      color: colors.text,
      fontFamily: "ResumeKorean",
      fontSize: pt(fontSizes.body),
      lineHeight: lineHeights.body,
      paddingVertical: 36,
      paddingHorizontal: 40,
    },
    profile: { marginBottom: pt(spacing.profile) },
    profileTitle: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: pt(spacing.content),
      marginBottom: pt(spacing.content),
    },
    name: {
      fontSize: pt(fontSizes.name),
      fontWeight: 700,
      lineHeight: lineHeights.heading,
    },
    role: { fontSize: pt(fontSizes.role), color: colors.muted },
    contact: { fontSize: pt(fontSizes.meta) },
    contactGap: { marginBottom: pt(spacing.compact) },
    section: { marginTop: pt(spacing.section) },
    sectionTitle: {
      fontSize: pt(fontSizes.section),
      fontWeight: 700,
      lineHeight: lineHeights.heading,
      color: colors.headingStart,
      paddingBottom: pt(spacing.content),
      borderBottomWidth: 0.75,
      borderBottomColor: colors.border,
    },
    accent: {
      width: pt(widths.sectionAccent),
      height: 0.75,
      backgroundColor: colors.accent,
      marginTop: -0.75,
      marginBottom: pt(spacing.sectionContent),
    },
    company: {
      fontSize: pt(fontSizes.company),
      fontWeight: 700,
      color: colors.headingStart,
      lineHeight: lineHeights.heading,
      flexShrink: 1,
    },
    title: {
      fontSize: pt(fontSizes.project),
      fontWeight: 700,
      lineHeight: lineHeights.heading,
      marginBottom: pt(spacing.inline),
    },
    issueTitle: {
      fontSize: pt(fontSizes.issue),
      fontWeight: 700,
      color: colors.issueHeading,
      lineHeight: lineHeights.heading,
      marginBottom: pt(spacing.compact),
    },
    issueHeading: { marginTop: pt(spacing.issue) },
    firstIssueHeading: { marginTop: pt(spacing.content) },
    stage: {
      fontSize: pt(fontSizes.body),
      fontWeight: 700,
      color: colors.text,
      lineHeight: lineHeights.heading,
      marginTop: pt(spacing.inline),
    },
    label: { fontWeight: 500 },
    companyHeading: {
      flexDirection: "row",
      alignItems: "center",
      gap: pt(spacing.inline),
      marginBottom: pt(spacing.compact),
    },
    logo: {
      width: pt(widths.companyLogo),
      height: pt(widths.companyLogo),
      objectFit: "contain",
    },
    badge: {
      width: pt(widths.certificationBadge),
      height: pt(widths.certificationBadge),
      objectFit: "contain",
      objectPositionY: "top",
    },
    certification: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: pt(spacing.content),
    },
    certificationText: { flex: 1, minWidth: 0 },
    companyDivider: {
      borderTopWidth: 0.75,
      borderTopColor: colors.border,
      marginVertical: pt(spacing.company / 2),
    },
    itemDivider: {
      borderTopWidth: 0.75,
      borderTopColor: colors.border,
      marginVertical: pt(spacing.dividedItem / 2),
    },
    item: { marginTop: pt(spacing.item) },
    project: { marginTop: pt(spacing.sectionContent) },
    projectDivider: {
      borderTopWidth: 0.75,
      borderTopColor: colors.border,
      marginVertical: pt(spacing.project / 2),
    },
    content: { marginTop: pt(spacing.content) },
    paragraph: { marginBottom: pt(spacing.content) },
    compactParagraph: { marginBottom: pt(spacing.inline) },
    inline: { marginTop: pt(spacing.inline) },
    compact: { marginTop: pt(spacing.compact) },
    meta: { fontSize: pt(fontSizes.meta), color: colors.muted },
    link: { color: colors.link, textDecoration: "underline" },
    bold: { fontWeight: 700 },
    emphasis: { textDecoration: "underline" },
    code: { backgroundColor: colors.surface },
    bullet: {
      paddingLeft: pt(spacing.listIndent),
    },
    numberedBullet: {
      paddingLeft: pt(spacing.listIndent + spacing.inline),
    },
    bulletGap: { marginBottom: pt(spacing.inline) },
    compactBulletGap: { marginBottom: pt(spacing.compact) },
    // PDF 문단의 첫 인라인 조각에 걸린 들여쓰기만 적용된다.
    marker: {
      textIndent: -pt(spacing.listIndent),
    },
    numberedMarker: { textIndent: -pt(spacing.listIndent + spacing.inline) },
    tags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: pt(spacing.inline),
      marginTop: pt(spacing.inline),
    },
    tag: {
      fontSize: pt(fontSizes.tag),
      color: colors.muted,
      backgroundColor: colors.tagBackground,
      paddingHorizontal: pt(spacing.inline),
    },
  });
}

type PdfStyles = ReturnType<typeof createStyles>;

function Inline({ nodes, styles }: { nodes: InlineNode[]; styles: PdfStyles }) {
  return nodes.map((node, index) => {
    let content: ReactNode;
    switch (node.type) {
      case "text":
        content = node.text;
        break;
      case "break":
        content = "\n";
        break;
      case "code":
        content = <Text style={styles.code}>{node.text}</Text>;
        break;
      case "strong":
        content = (
          <Text style={styles.bold}>
            <Inline styles={styles} nodes={node.children} />
          </Text>
        );
        break;
      // 나눔고딕은 기울임체가 없어 밑줄로 강조를 유지한다.
      case "emphasis":
        content = (
          <Text style={styles.emphasis}>
            <Inline styles={styles} nodes={node.children} />
          </Text>
        );
        break;
      case "link":
        content = (
          <Link src={node.href} style={styles.link}>
            <Inline styles={styles} nodes={node.children} />
          </Link>
        );
        break;
    }
    // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 시 PDF 인라인 목록이며 상태가 없다.
    return <Text key={index}>{content}</Text>;
  });
}
function Rich({
  content,
  secondary = false,
  compact = false,
  styles,
}: {
  content: RichText;
  secondary?: boolean;
  compact?: boolean;
  styles: PdfStyles;
}) {
  return content.map((paragraph, index) => (
    <Text
      // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 시 PDF 문단 목록이다.
      key={index}
      style={[
        ...(index < content.length - 1
          ? [compact ? styles.compactParagraph : styles.paragraph]
          : []),
        ...(secondary ? [styles.meta] : []),
      ]}
      orphans={2}
      widows={2}
    >
      <Inline styles={styles} nodes={paragraph.children} />
    </Text>
  ));
}
function List({
  items,
  styles,
  ordered = false,
  compact = false,
}: {
  items: { content: RichText }[];
  styles: PdfStyles;
  ordered?: boolean;
  compact?: boolean;
}) {
  return (
    items.length > 0 && (
      <View style={compact ? styles.compact : styles.content}>
        {items.map((item, index) => (
          <View
            // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 PDF 성과·기술 목록이다.
            key={index}
            style={[
              ...(index < items.length - 1
                ? [compact ? styles.compactBulletGap : styles.bulletGap]
                : []),
            ]}
          >
            {item.content.map((paragraph, paragraphIndex) => (
              <Text
                // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 시 목록 문단이다.
                key={paragraphIndex}
                style={[
                  styles.bullet,
                  ...(ordered ? [styles.numberedBullet] : []),
                  ...(paragraphIndex < item.content.length - 1
                    ? [compact ? styles.compactParagraph : styles.paragraph]
                    : []),
                ]}
                orphans={2}
                widows={2}
              >
                {paragraphIndex === 0 && (
                  <Text
                    style={[
                      styles.marker,
                      ...(ordered ? [styles.numberedMarker] : []),
                    ]}
                  >
                    {ordered ? `${index + 1}.\u00a0\u00a0` : "•\u00a0"}
                  </Text>
                )}
                <Inline styles={styles} nodes={paragraph.children} />
              </Text>
            ))}
          </View>
        ))}
      </View>
    )
  );
}

function LabeledRich({
  label,
  content,
  styles,
}: {
  label: string;
  content: RichText;
  styles: PdfStyles;
}) {
  return content.map((paragraph, index) => (
    <Text
      // biome-ignore lint/suspicious/noArrayIndexKey: PDF의 정적인 메타 문단이다.
      key={index}
      style={[index === 0 ? styles.compact : styles.inline, styles.meta]}
      orphans={2}
      widows={2}
    >
      {index === 0 && (
        <Text style={[styles.meta, styles.label]}>{label}: </Text>
      )}
      <Inline nodes={paragraph.children} styles={styles} />
    </Text>
  ));
}
function Tags({
  items,
  styles,
}: {
  items: { label: string }[];
  styles: PdfStyles;
}) {
  return (
    items.length > 0 && (
      <View style={styles.tags}>
        {items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 PDF 태그 목록이다.
          <Text key={index} style={styles.tag}>
            {item.label}
          </Text>
        ))}
      </View>
    )
  );
}

export function ResumePdfDocument({
  resume,
  display,
  theme,
}: {
  resume: ResumeData;
  display: ResumeDisplay;
  theme: ResumeTheme;
}) {
  const styles = createStyles(theme);
  const sections = getVisibleResumeSections(resume, display);
  const details = getProfileDetails(resume.profile);
  return (
    <Document
      title={`${resume.profile.name} · ${resume.profile.role}`}
      author={resume.profile.name}
      language="ko"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.profile}>
          <View style={styles.profileTitle}>
            <Text style={styles.name}>{resume.profile.name}</Text>
            <Text style={styles.role}>{resume.profile.role}</Text>
          </View>
          {details.map((detail, index) => (
            <Text
              // biome-ignore lint/suspicious/noArrayIndexKey: 빌드 시 프로필 연락처 목록이다.
              key={index}
              style={[
                styles.contact,
                ...(index < details.length - 1 ? [styles.contactGap] : []),
              ]}
            >
              {detail.href ? (
                <Link src={detail.href} style={styles.link}>
                  {detail.label}
                </Link>
              ) : (
                detail.label
              )}
            </Text>
          ))}
        </View>
        {sections.map((section, sectionIndex) => {
          let content: ReactNode;
          switch (section.id) {
            case "summary":
              content = (
                <>
                  {section.content.lead && (
                    <Rich styles={styles} content={section.content.lead} />
                  )}
                  {section.content.format === "list" ? (
                    <List styles={styles} items={section.content.items} />
                  ) : (
                    section.content.items.map((item, index) => (
                      <View
                        // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 소개 문단이다.
                        key={index}
                        style={[
                          ...(section.content.lead && index === 0
                            ? [styles.content]
                            : []),
                          styles.paragraph,
                        ]}
                      >
                        <Rich styles={styles} content={item.content} />
                      </View>
                    ))
                  )}
                </>
              );
              break;
            case "experiences":
              content = section.content.map((experience, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 재직 이력 목록이다.
                <View key={index}>
                  {index > 0 && (
                    <View style={styles.companyDivider} minPresenceAhead={96} />
                  )}
                  <View wrap={false} minPresenceAhead={60}>
                    <View style={styles.companyHeading}>
                      <Text style={styles.company}>
                        {experience.company.name}
                      </Text>
                      {experience.company.logo && (
                        <Image
                          src={imageSource(experience.company.logo.src)}
                          style={styles.logo}
                        />
                      )}
                    </View>
                    <Text>{experience.role}</Text>
                    {(experience.startDate ||
                      experience.endDate ||
                      experience.isCurrent) && (
                      <Text style={styles.meta}>
                        {formatPeriod(
                          experience.startDate,
                          experience.isCurrent
                            ? display.labels.current
                            : experience.endDate,
                        )}
                      </Text>
                    )}
                    <Tags styles={styles} items={experience.tags} />
                  </View>
                  <List styles={styles} items={experience.highlights} />
                  {experience.projects.map((project, projectIndex) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 프로젝트 목록이다.
                    <Fragment key={projectIndex}>
                      {projectIndex > 0 && (
                        <View
                          style={styles.projectDivider}
                          minPresenceAhead={120}
                        />
                      )}
                      <Text
                        style={[
                          styles.title,
                          ...(projectIndex === 0 ? [styles.project] : []),
                        ]}
                        minPresenceAhead={96}
                      >
                        {project.title}
                      </Text>
                      <LabeledRich
                        label={display.labels.projectDescription}
                        styles={styles}
                        content={project.description}
                      />
                      {project.technologies.length > 0 && (
                        <Text style={[styles.compact, styles.meta]}>
                          <Text style={styles.label}>
                            {display.labels.projectTechnologies}:{" "}
                          </Text>
                          {project.technologies
                            .map((item) => item.label)
                            .join(", ")}
                        </Text>
                      )}
                      <LabeledRich
                        label={display.labels.projectRole}
                        styles={styles}
                        content={project.role}
                      />
                      {project.issues.map((issue, issueIndex) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: 이슈 번호는 빌드 시 표시 순서다.
                        <Fragment key={issueIndex}>
                          <View
                            style={
                              issueIndex === 0
                                ? styles.firstIssueHeading
                                : styles.issueHeading
                            }
                            wrap={false}
                            minPresenceAhead={54}
                          >
                            <Text style={styles.issueTitle}>
                              {display.labels.issue}
                              {issueIndex + 1}. {issue.title}
                            </Text>
                          </View>
                          <Rich
                            styles={styles}
                            content={issue.description}
                            compact
                            secondary
                          />
                          <Text style={styles.stage} minPresenceAhead={42}>
                            {display.labels.approach}
                          </Text>
                          <List
                            styles={styles}
                            items={issue.approach}
                            ordered
                            compact
                          />
                          <Text style={styles.stage} minPresenceAhead={42}>
                            {display.labels.outcomes}
                          </Text>
                          <List
                            styles={styles}
                            items={issue.outcomes}
                            compact
                          />
                        </Fragment>
                      ))}
                      {project.links.map((link, linkIndex) => (
                        <Text
                          // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 프로젝트 링크 목록이다.
                          key={linkIndex}
                          style={[styles.meta, styles.content]}
                        >
                          <Link src={link.href} style={styles.link}>
                            {link.label}
                          </Link>
                        </Text>
                      ))}
                    </Fragment>
                  ))}
                </View>
              ));
              break;
            case "skills":
              content = section.content.map((group, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 기술 분류 목록이다.
                <Fragment key={index}>
                  <Text
                    style={[styles.title, ...(index > 0 ? [styles.item] : [])]}
                    minPresenceAhead={60}
                  >
                    {group.category}
                  </Text>
                  <List styles={styles} items={group.items} />
                </Fragment>
              ));
              break;
            case "education":
              content = section.content.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 학력 목록이다.
                <View key={index}>
                  {index > 0 && <View style={styles.itemDivider} />}
                  <Text style={styles.title} minPresenceAhead={48}>
                    {item.institution}
                  </Text>
                  <Text>{item.program}</Text>
                  {(item.startDate || item.endDate) && (
                    <Text style={styles.meta}>
                      {formatPeriod(item.startDate, item.endDate)}
                    </Text>
                  )}
                  {item.description && (
                    <View style={styles.content}>
                      <Rich styles={styles} content={item.description} />
                    </View>
                  )}
                </View>
              ));
              break;
            case "certifications":
              content = section.content.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 정적인 자격 목록이다.
                <View key={index}>
                  {index > 0 && <View style={styles.itemDivider} />}
                  <View style={styles.certification} minPresenceAhead={96}>
                    {item.badge && (
                      <Image
                        src={imageSource(item.badge.src)}
                        style={styles.badge}
                      />
                    )}
                    <View style={styles.certificationText}>
                      <Text style={styles.title} minPresenceAhead={36}>
                        {item.name}
                      </Text>
                      <Text>{item.issuer}</Text>
                      {item.issuedAt && (
                        <Text style={styles.meta}>
                          {display.labels.issuedAt} {item.issuedAt}
                        </Text>
                      )}
                      {item.verificationLink && (
                        <Text style={styles.meta}>
                          <Link
                            src={item.verificationLink.href}
                            style={styles.link}
                          >
                            {item.verificationLink.label}
                          </Link>
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ));
              break;
          }
          if (!section.showTitle) {
            return (
              <View
                key={section.id}
                style={sectionIndex > 0 ? styles.section : undefined}
              >
                {content}
              </View>
            );
          }
          return (
            <Fragment key={section.id}>
              <Text
                style={[
                  styles.sectionTitle,
                  ...(sectionIndex > 0 ? [styles.section] : []),
                ]}
                minPresenceAhead={96}
              >
                {section.title}
              </Text>
              <View style={styles.accent} />
              {content}
            </Fragment>
          );
        })}
      </Page>
    </Document>
  );
}
