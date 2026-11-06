import { renderToBuffer } from "@react-pdf/renderer";
import type { APIRoute } from "astro";
import { getResumePageData } from "../data/resume";
import { ResumePdfDocument } from "../export/ResumePdfDocument";

export const GET: APIRoute = async () => {
  const data = await getResumePageData();
  const pdf = await renderToBuffer(ResumePdfDocument(data));
  return new Response(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf" },
  });
};
