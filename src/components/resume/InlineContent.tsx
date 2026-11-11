import { Fragment, type ReactNode } from "react";
import type { InlineNode } from "../../models/rich-text";

export function InlineContent({ nodes }: { nodes: InlineNode[] }) {
  return nodes.map((node, index) => {
    let content: ReactNode;
    switch (node.type) {
      case "text":
        content = node.text;
        break;
      case "code":
        content = <code>{node.text}</code>;
        break;
      case "break":
        content = <br />;
        break;
      case "strong":
        content = (
          <strong>
            <InlineContent nodes={node.children} />
          </strong>
        );
        break;
      case "emphasis":
        content = (
          <em>
            <InlineContent nodes={node.children} />
          </em>
        );
        break;
      case "mark":
        content = (
          <mark className="resume-mark">
            <InlineContent nodes={node.children} />
          </mark>
        );
        break;
      case "link":
        content = (
          <a href={node.href} title={node.title}>
            <InlineContent nodes={node.children} />
          </a>
        );
        break;
    }
    // biome-ignore lint/suspicious/noArrayIndexKey: 정적 문장 렌더링이며 클라이언트 재정렬이나 상태가 없다.
    return <Fragment key={index}>{content}</Fragment>;
  });
}
