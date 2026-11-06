import { writeFile } from "node:fs/promises";
import { resumeThemeConfig } from "../src/config/resume-theme.ts";
import { paperSchema } from "../src/models/paper.ts";
import { paperCssVars } from "../src/styles/paper-texture.ts";

const params = paperSchema.parse(resumeThemeConfig.paper);
const declarations = Object.entries(paperCssVars(params))
  .map(([name, value]) => `  ${name}: ${value};`)
  .join("\n");

await writeFile(
  new URL("../src/styles/paper.generated.css", import.meta.url),
  `/* npm run paper:generate로 생성합니다. 원본 설정: src/config/resume-theme.ts */\n:root {\n${declarations}\n}\n`,
);
