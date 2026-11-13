import type { APIRoute } from "astro";
import { getResumePageData } from "../data/resume";
import { renderResumeMarkdown } from "../export/markdown";

export const GET: APIRoute = async () => {
  const { resume, display } = await getResumePageData();
  return new Response(renderResumeMarkdown(resume, display), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
