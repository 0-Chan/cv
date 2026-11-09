import type { ReactNode } from "react";
import type { ResumeDisplay } from "../../models/presentation";

export function ResumeSection({
  id,
  title,
  showTitle = true,
  children,
}: {
  id: ResumeDisplay["sections"][number]["id"];
  title: string;
  showTitle?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={showTitle ? undefined : id}
      aria-labelledby={showTitle ? id : undefined}
      aria-label={showTitle ? undefined : title}
      className="grid min-w-0 gap-section-content"
    >
      {showTitle && (
        <h2
          id={id}
          className="resume-section-title text-section font-bold leading-heading"
        >
          <span>{title}</span>
        </h2>
      )}
      <div
        className={
          id === "experiences"
            ? "grid min-w-0 gap-company-half"
            : id === "education" || id === "certifications"
              ? "grid min-w-0 gap-divided-item-half"
              : "grid min-w-0 gap-item"
        }
      >
        {children}
      </div>
    </section>
  );
}
