import type { ReactNode } from "react";
import type { ResumeDisplay } from "../../models/presentation";

export function ResumeSection({
  id,
  title,
  children,
}: {
  id: ResumeDisplay["sections"][number]["id"];
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid min-w-0 gap-x-inline gap-y-content border-t border-rule pt-item md:grid-cols-[var(--resume-width-sectionLabel)_minmax(0,1fr)]"
    >
      <h2 id={id} className="text-section font-semibold leading-heading">
        {title}
      </h2>
      <div className="grid min-w-0 gap-item">{children}</div>
    </section>
  );
}
