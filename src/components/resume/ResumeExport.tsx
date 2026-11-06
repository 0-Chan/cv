import { resumeDownloadName } from "../../presentation/resume";
import { assetUrl } from "./asset-url";

export function ResumeExport({ name }: { name: string }) {
  return (
    <details className="resume-export relative z-10 hidden shrink-0 text-meta lg:block">
      <summary className="cursor-pointer list-none rounded border border-rule bg-surface px-content py-inline font-medium text-ink">
        Export <span aria-hidden="true">▾</span>
      </summary>
      <ul className="absolute right-0 mt-inline grid w-max gap-compact rounded border border-rule bg-white p-inline shadow-sm">
        <li>
          <a
            className="resume-export-action"
            href={assetUrl("/resume.pdf")}
            download={resumeDownloadName(name, "pdf")}
          >
            PDF 다운로드
          </a>
        </li>
        <li>
          <a
            className="resume-export-action"
            href={assetUrl("/resume.md")}
            download={resumeDownloadName(name, "md")}
          >
            Markdown 다운로드
          </a>
        </li>
        <li>
          <button
            className="resume-export-action w-full cursor-pointer text-left"
            type="button"
            data-resume-print
          >
            프린터 출력
          </button>
        </li>
      </ul>
    </details>
  );
}
