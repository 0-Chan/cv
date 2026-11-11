import { toast } from "sonner";

const toastOptions = {
  id: "resume-export",
  description: undefined,
  duration: 3000,
  closeButton: true,
  dismissible: true,
};

export function initializeResumeExport(root: HTMLElement): () => void {
  const menu = root.querySelector<HTMLDetailsElement>(
    "[data-resume-export-menu]",
  );
  if (!menu) return () => {};

  const trigger = menu.querySelector("summary");
  const copyButton =
    menu.querySelector<HTMLButtonElement>("[data-resume-copy]");
  const markdown = root.querySelector<HTMLTextAreaElement>(
    "[data-resume-markdown]",
  );
  const controller = new AbortController();
  const { signal } = controller;
  const desktop = window.matchMedia("(min-width: 1024px)");
  let copying = false;
  let failedCopy = false;
  let operation = 0;
  let printFrame: number | undefined;
  let printOperation: number | undefined;

  const clearPrintFrame = () => {
    if (printFrame !== undefined) cancelAnimationFrame(printFrame);
    printFrame = undefined;
  };
  const beginOperation = () => {
    clearPrintFrame();
    failedCopy = false;
    return ++operation;
  };
  const isCurrent = (current: number) =>
    !signal.aborted && desktop.matches && current === operation;
  const dismiss = () => toast.dismiss(toastOptions.id);
  const close = (restoreFocus = false) => {
    menu.open = false;
    if (restoreFocus) trigger?.focus();
  };

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && menu.open) {
        event.preventDefault();
        close(true);
      }
    },
    { signal },
  );
  document.addEventListener(
    "click",
    (event) => {
      if (event.target instanceof Node && !menu.contains(event.target)) close();
    },
    { signal },
  );
  menu.addEventListener(
    "toggle",
    () => {
      if (menu.open && !copying && failedCopy) {
        failedCopy = false;
        dismiss();
      }
    },
    { signal },
  );
  menu.addEventListener(
    "click",
    async (event) => {
      if (!(event.target instanceof Element) || !desktop.matches) return;
      if (event.target.closest("[data-resume-copy]")) {
        if (copying || !copyButton || !markdown) return;
        const current = beginOperation();
        copying = true;
        copyButton.setAttribute("aria-disabled", "true");
        try {
          if (!navigator.clipboard?.writeText)
            throw new Error("Clipboard unavailable");
          // 사용자 클릭의 권한을 유지하도록 다른 비동기 작업보다 먼저 호출한다.
          const result = navigator.clipboard.writeText(markdown.value);
          toast.loading("Markdown 포맷으로 복사합니다.", {
            ...toastOptions,
            duration: Number.POSITIVE_INFINITY,
            closeButton: false,
            dismissible: false,
          });
          await result;
          if (!isCurrent(current)) return;
          close(menu.open && menu.contains(document.activeElement));
          toast.success("Markdown 포맷으로 복사합니다.", toastOptions);
        } catch {
          if (!isCurrent(current)) return;
          failedCopy = true;
          toast.error("MD를 복사하지 못했습니다", {
            ...toastOptions,
            description: "클립보드 권한을 확인해 주세요.",
            duration: Number.POSITIVE_INFINITY,
          });
        } finally {
          copying = false;
          copyButton.removeAttribute("aria-disabled");
        }
      } else if (event.target.closest("[data-resume-print]")) {
        const current = beginOperation();
        close(true);
        toast.info("인쇄창을 엽니다", toastOptions);
        // 알림을 그린 뒤 인쇄창을 연다. 인쇄 문서에서는 CSS로 알림을 숨긴다.
        printFrame = requestAnimationFrame(() => {
          printFrame = requestAnimationFrame(() => {
            printFrame = undefined;
            if (!isCurrent(current)) return;
            printOperation = current;
            try {
              window.print();
            } catch {
              printOperation = undefined;
              toast.error("인쇄창을 열지 못했습니다", {
                ...toastOptions,
                description: "브라우저 설정을 확인한 뒤 다시 시도해 주세요.",
                duration: Number.POSITIVE_INFINITY,
              });
            }
          });
        });
      } else if (event.target.closest("a[download]")) {
        beginOperation();
        close(true);
        toast.info("PDF 다운로드를 시작합니다", toastOptions);
      }
    },
    { signal },
  );
  menu.addEventListener(
    "focusout",
    (event) => {
      if (
        !(event.relatedTarget instanceof Node) ||
        !menu.contains(event.relatedTarget)
      ) {
        close();
      }
    },
    { signal },
  );
  window.addEventListener(
    "afterprint",
    () => {
      if (printOperation !== undefined && isCurrent(printOperation)) dismiss();
      printOperation = undefined;
    },
    { signal },
  );
  desktop.addEventListener(
    "change",
    (event) => {
      if (!event.matches) {
        beginOperation();
        close();
        dismiss();
      }
    },
    { signal },
  );

  return () => {
    controller.abort();
    clearPrintFrame();
    copyButton?.removeAttribute("aria-disabled");
    close();
    dismiss();
  };
}
