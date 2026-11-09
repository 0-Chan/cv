import type { ResumeDisplay } from "../../models/presentation";
import type { ResumeData } from "../../models/resume";
import { assetUrl } from "./asset-url";
import { RichText } from "./RichText";

export function CertificationItem({
  certification,
  labels,
}: {
  certification: ResumeData["certifications"][number];
  labels: Pick<ResumeDisplay["labels"], "issuedAt" | "certificationReason">;
}) {
  return (
    <article className="flex min-w-0 items-start gap-content border-rule not-first:border-t not-first:pt-divided-item-half">
      {certification.badge && (
        <img
          src={assetUrl(certification.badge.src)}
          alt={certification.badge.alt}
          className="resume-brand-image size-certification-badge max-w-full shrink-0 object-contain object-top"
          loading="lazy"
        />
      )}
      <div className="grid min-w-0 flex-1 gap-inline">
        <h3 className="text-certification font-bold leading-heading">
          {certification.name}
        </h3>
        <p>{certification.issuer}</p>
        {certification.issuedAt && (
          <dl className="flex flex-wrap gap-x-content gap-y-inline text-meta text-muted">
            <div className="flex flex-wrap gap-inline">
              <dt>{labels.issuedAt}</dt>
              <dd>{certification.issuedAt}</dd>
            </div>
          </dl>
        )}
        {certification.verificationLink && (
          <p className="text-meta">
            <a href={certification.verificationLink.href}>
              {certification.verificationLink.label}
            </a>
          </p>
        )}
        {certification.reason && (
          <dl className="grid min-w-0 grid-cols-[max-content_minmax(0,1fr)] gap-compact text-meta text-muted">
            <dt>{labels.certificationReason}:</dt>
            <dd className="min-w-0">
              <RichText content={certification.reason} compact />
            </dd>
          </dl>
        )}
      </div>
    </article>
  );
}
