import { z } from "zod";
import { contactUrlSchema } from "./urls";

export type InlineNode =
  | { type: "text" | "code"; text: string }
  | { type: "strong" | "emphasis" | "mark"; children: InlineNode[] }
  | { type: "link"; href: string; title?: string; children: InlineNode[] }
  | { type: "break" };

export const inlineNodeSchema: z.ZodType<InlineNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.strictObject({ type: z.literal("text"), text: z.string().min(1) }),
    z.strictObject({ type: z.literal("code"), text: z.string().min(1) }),
    z.strictObject({
      type: z.literal("strong"),
      children: z.array(inlineNodeSchema).min(1),
    }),
    z.strictObject({
      type: z.literal("emphasis"),
      children: z.array(inlineNodeSchema).min(1),
    }),
    z.strictObject({
      type: z.literal("mark"),
      children: z.array(inlineNodeSchema).min(1),
    }),
    z.strictObject({
      type: z.literal("link"),
      href: contactUrlSchema,
      title: z.string().optional(),
      children: z.array(inlineNodeSchema).min(1),
    }),
    z.strictObject({ type: z.literal("break") }),
  ]),
);

function hasText(nodes: InlineNode[]): boolean {
  return nodes.some((node) =>
    "text" in node
      ? node.text.trim().length > 0
      : "children" in node && hasText(node.children),
  );
}

export const paragraphSchema = z.strictObject({
  type: z.literal("paragraph"),
  children: z
    .array(inlineNodeSchema)
    .min(1)
    .refine(hasText, "문단에는 공백 이외의 내용이 필요합니다."),
});
export const richTextSchema = z.array(paragraphSchema).min(1);
export type RichText = z.infer<typeof richTextSchema>;
