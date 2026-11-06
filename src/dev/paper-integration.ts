import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

export function paperDevTools(): AstroIntegration {
  return {
    name: "cv-paper-tools",
    hooks: {
      "astro:config:setup"({ command, injectScript }) {
        if (command !== "dev") return;
        const entry = fileURLToPath(
          new URL("./paper-entry.tsx", import.meta.url),
        );
        injectScript(
          "page",
          `import "@vitejs/plugin-react/preamble"; if (import.meta.env.DEV) { import(${JSON.stringify(entry)}); }`,
        );
      },
    },
  };
}
