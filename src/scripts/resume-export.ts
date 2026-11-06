const menu = document.querySelector<HTMLDetailsElement>(".resume-export");

if (menu) {
  const trigger = menu.querySelector("summary");
  const close = (restoreFocus = false) => {
    menu.open = false;
    if (restoreFocus) trigger?.focus();
  };
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      event.preventDefault();
      close(true);
    }
  });
  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !menu.contains(event.target)) close();
  });
  menu.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-resume-print]")) {
      close(true);
      window.print();
    } else if (event.target.closest("a[download]")) {
      close(true);
    }
  });
  menu.addEventListener("focusout", (event) => {
    if (
      !(event.relatedTarget instanceof Node) ||
      !menu.contains(event.relatedTarget)
    ) {
      close();
    }
  });
  window
    .matchMedia("(min-width: 1024px)")
    .addEventListener("change", (event) => {
      if (!event.matches) close();
    });
}
