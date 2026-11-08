const root = document.querySelector<HTMLElement>(".resume-export");
const menu = root?.querySelector<HTMLDetailsElement>(
  "[data-resume-export-menu]",
);

if (root && menu) {
  const trigger = menu.querySelector("summary");
  const copyButton =
    menu.querySelector<HTMLButtonElement>("[data-resume-copy]");
  const actions = menu.querySelector<HTMLElement>(
    "[data-resume-export-actions]",
  );
  const markdown = root.querySelector<HTMLTextAreaElement>(
    "[data-resume-markdown]",
  );
  const status = root.querySelector<HTMLElement>("[role='status']");
  let copying = false;
  let statusTimeout: ReturnType<typeof setTimeout> | undefined;
  const clearStatus = () => {
    clearTimeout(statusTimeout);
    if (status) {
      status.textContent = "";
      status.style.top = "";
    }
  };
  const positionStatus = () => {
    if (status) {
      status.style.top =
        menu.open && actions
          ? `${actions.offsetTop + actions.offsetHeight}px`
          : "";
    }
  };
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
  menu.addEventListener("toggle", () => {
    if (menu.open && !copying) clearStatus();
    positionStatus();
  });
  window.addEventListener("resize", positionStatus);
  menu.addEventListener("click", async (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-resume-copy]")) {
      if (copying || !copyButton || !markdown || !status) return;
      copying = true;
      copyButton.setAttribute("aria-disabled", "true");
      clearStatus();
      try {
        if (!navigator.clipboard?.writeText)
          throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(markdown.value);
        close(menu.open && menu.contains(document.activeElement));
        status.textContent = "MD를 복사했습니다";
        statusTimeout = setTimeout(clearStatus, 3000);
      } catch {
        status.textContent =
          "복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.";
        positionStatus();
      } finally {
        copying = false;
        copyButton.removeAttribute("aria-disabled");
      }
    } else if (event.target.closest("[data-resume-print]")) {
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
