import { createRoot } from "react-dom/client";
import { resumeThemeConfig } from "../config/resume-theme";
import { paperSchema } from "../models/paper";
import { paperCssVars } from "../styles/paper-texture";
import { PaperTexturePanel } from "./PaperTexturePanel";

const params = paperSchema.parse(resumeThemeConfig.paper);
const host = document.createElement("div");
host.id = "paper-texture-dev";
const shadow = host.attachShadow({ mode: "open" });
const mount = document.createElement("div");
const grid = document.createElement("div");
grid.className = "tile-grid";
grid.setAttribute("aria-hidden", "true");
grid.style.display = "none";
shadow.append(mount, grid);
document.body.append(host);

const moveGrid = () => {
  grid.style.backgroundPosition = `0px ${-window.scrollY}px`;
};
const showGrid = (visible: boolean) => {
  grid.style.display = visible ? "" : "none";
  moveGrid();
};
window.addEventListener("scroll", moveGrid, { passive: true });
const root = createRoot(mount);
root.render(
  <PaperTexturePanel initialParams={params} onGridChange={showGrid} />,
);

import.meta.hot?.dispose(() => {
  root.unmount();
  window.removeEventListener("scroll", moveGrid);
  host.remove();
  for (const key of Object.keys(paperCssVars(params))) {
    document.documentElement.style.removeProperty(key);
  }
});
