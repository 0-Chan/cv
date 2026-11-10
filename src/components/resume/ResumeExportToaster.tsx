import { useEffect } from "react";
import { Toaster } from "sonner";
import { initializeResumeExport } from "../../scripts/resume-export";

export function ResumeExportToaster() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".resume-export");
    if (root) return initializeResumeExport(root);
  }, []);

  return (
    <div className="resume-export-notifications hidden lg:block">
      <Toaster
        position="top-right"
        offset={16}
        theme="light"
        duration={3000}
        visibleToasts={1}
        closeButton
        containerAriaLabel="내보내기 알림"
        customAriaLabel="내보내기 알림"
        toastOptions={{
          closeButtonAriaLabel: "알림 닫기",
          style: {
            fontFamily: "var(--resume-font)",
            fontSize: "var(--resume-size-meta)",
            color: "var(--resume-color-text)",
            borderColor: "var(--resume-color-border)",
          },
        }}
      />
    </div>
  );
}
