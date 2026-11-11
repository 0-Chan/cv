import type { Nodes } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmTableFromMarkdown } from "mdast-util-gfm-table";
import { highlightMarkFromMarkdown } from "mdast-util-highlight-mark";
import { gfmTable } from "micromark-extension-gfm-table";
import { highlightMark } from "micromark-extension-highlight-mark";
import type { InlineNode, RichText } from "../models/rich-text";
import { contactUrlSchema } from "../models/urls";
import { ResumeValidationError } from "./validation";

export function parseResumeMarkdown(value: string, path: string): RichText {
  const root = fromMarkdown(value, {
    extensions: [gfmTable(), highlightMark()],
    mdastExtensions: [gfmTableFromMarkdown(), highlightMarkFromMarkdown],
  });
  function fail(message: string): never {
    throw new ResumeValidationError([{ path, message }]);
  }
  // Accept only explicitly supported nodes; never generate raw HTML.
  function inline(node: Nodes): InlineNode {
    switch (node.type) {
      case "text":
        return { type: "text", text: node.value };
      case "inlineCode":
        return { type: "code", text: node.value };
      case "break":
        return { type: "break" };
      case "strong":
      case "emphasis":
        return { type: node.type, children: node.children.map(inline) };
      case "highlight":
        return { type: "mark", children: node.children.map(inline) };
      case "link": {
        if (!contactUrlSchema.safeParse(node.url).success)
          fail("문장 안 링크는 HTTP(S), mailto 또는 tel 주소여야 합니다.");
        return {
          type: "link",
          href: node.url,
          ...(node.title === null || node.title === undefined
            ? {}
            : { title: node.title }),
          children: node.children.map(inline),
        };
      }
      default:
        return fail(
          "지원하지 않는 Markdown 문법입니다. 문장에는 굵은 강조·배경 강조·기울임·인라인 코드·직접 링크만 사용하고 목록은 YAML로 작성하세요.",
        );
    }
  }
  if (root.children.length === 0) fail("빈 문장은 사용할 수 없습니다.");
  return root.children.map((node) => {
    if (node.type !== "paragraph")
      fail(
        "제목·목록·표·이미지·코드 블록·HTML은 지원하지 않습니다. 목록은 YAML로 작성하세요.",
      );
    return { type: "paragraph", children: node.children.map(inline) };
  });
}
