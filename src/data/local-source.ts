import { resumeConfig } from "../config/resume";

// Replace only this supplier when an external API becomes available.
export async function readResumeSource(): Promise<unknown> {
  return resumeConfig;
}
