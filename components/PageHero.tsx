import Link from "next/link";
import { ReactNode } from "react";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  children?: ReactNode;
};

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(43,103,255,0.22),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(154,226,45,0.14),_transparent_24%),linear-gradient(135deg,#08111d_0%,#10233a_60%,#13263e_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-20" />

      <div className="relative mx-auto grid w-full max-w-[1400px] gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
        <div className="space-y-6">
          {eyebrow ? (
            <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.22em] text-[#9ae22d]">
              {eyebrow}
            </div>
          ) : null}

          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base lg:text-lg">
              {subtitle}
            </p>
          </div>

          {(primaryActionLabel || secondaryActionLabel) && (
            <div className="flex flex-col gap-3 sm:flex-row">
              {primaryActionLabel && primaryActionHref ? (
                <Link
                  href={primaryActionHref}
                  className="inline-flex items-center justify-center rounded-xl bg-[#9ae22d] px-6 py-3 text-sm font-bold tracking-wide text-[#07111d] transition hover:brightness-95"
                >
                  {primaryActionLabel}
                </Link>
              ) : null}

              {secondaryActionLabel && secondaryActionHref ? (
                <Link
                  href={secondaryActionHref}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-white/10"
                >
                  {secondaryActionLabel}
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">{children}</div>
      </div>
    </section>
  );
}