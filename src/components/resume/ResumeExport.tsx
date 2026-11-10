import {
  IconFileExport,
  IconFileTypePdf,
  IconMarkdown,
  IconPrinter,
} from "@tabler/icons-react";
import { resumeDownloadName } from "../../presentation/resume";
import { assetUrl } from "./asset-url";

export function ResumeExport({
  name,
  markdown,
}: {
  name: string;
  markdown: string;
}) {
  return (
    <div className="resume-export relative z-10 hidden shrink-0 text-meta lg:block">
      <details data-resume-export-menu>
        <summary className="flex cursor-pointer list-none items-center gap-inline rounded border border-rule bg-surface px-content py-inline font-medium text-ink">
          <IconFileExport
            size={18}
            stroke={1.75}
            aria-hidden="true"
            focusable="false"
          />
          Export <span aria-hidden="true">▾</span>
        </summary>
        <div
          data-resume-export-actions
          className="absolute right-0 mt-inline grid w-max gap-compact rounded border border-rule bg-white p-inline shadow-sm"
        >
          <ul className="grid gap-compact">
            <li>
              <a
                className="resume-export-action"
                href={assetUrl("/resume.pdf")}
                download={resumeDownloadName(name, "pdf")}
              >
                <IconFileTypePdf
                  size={18}
                  stroke={1.75}
                  aria-hidden="true"
                  focusable="false"
                />
                PDF 다운로드
              </a>
            </li>
            <li>
              <button
                className="resume-export-action w-full cursor-pointer text-left"
                type="button"
                data-resume-print
              >
                <IconPrinter
                  size={18}
                  stroke={1.75}
                  aria-hidden="true"
                  focusable="false"
                />
                프린터 출력
              </button>
            </li>
          </ul>
          <hr className="my-compact border-rule" />
          <button
            className="resume-export-action w-full cursor-pointer text-left"
            type="button"
            data-resume-copy
          >
            <IconMarkdown
              size={18}
              stroke={1.75}
              aria-hidden="true"
              focusable="false"
            />
            MD 복사하기
          </button>
        </div>
      </details>
      <textarea hidden readOnly data-resume-markdown defaultValue={markdown} />
    </div>
  );
}
