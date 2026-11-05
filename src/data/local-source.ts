import resumeYaml from "../config/resume.yaml?raw";
import { parseResumeYaml } from "./yaml-source";

// An API supplier can replace this module while retaining the common model.
export async function readResumeSource(): Promise<unknown> {
  return parseResumeYaml(resumeYaml, "src/config/resume.yaml");
}
