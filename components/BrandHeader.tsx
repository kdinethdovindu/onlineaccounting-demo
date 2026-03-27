"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const mainTabs = [
  "HOME",
  "COURSES",
  "SUCCESS STORIES",
  "MEDIA",
  "ABOUT",
  "CONTACT US",
];

export default function BrandHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isPortalActive =
    pathname === "/portal" ||
    pathname === "/student-login" ||
    pathname === "/lecturer-login" ||
    pathname === "/student-dashboard" ||
    pathname === "/lecturer-dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08111d]/95 text-white backdrop-blur">
      <div className="h-[3px] w-full bg-gradient-to-r from-[#2b67ff] via-[#44c7ff] to-[#9ae22d]" />

      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/portal" className="flex items-center gap-3">
            <img
              src="https://static.onlineaccounting.lk/images/online-accounting-logo.png"
              alt="Online Accounting"
              className="h-12 w-auto sm:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {mainTabs.map((item) => (
              <span
                key={item}
                className="cursor-default text-sm font-medium tracking-wide text-white/85"
              >
                {item}
              </span>
            ))}

            <Link
              href="/portal"
              className={`rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition ${
                isPortalActive
                  ? "bg-[#9ae22d] text-[#07111d]"
                  : "border border-[#9ae22d]/50 text-[#9ae22d] hover:bg-[#9ae22d] hover:text-[#07111d]"
              }`}
            >
              ANSWER SHEET PORTAL
            </Link>
          </nav>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9ae22d] text-[#0a1320] shadow-lg shadow-lime-500/20">
            🛒
          </div>

          <div className="text-sm font-semibold tracking-[0.18em] text-[#9ae22d]">
            LOGIN | REGISTER
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white lg:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#0b1625] lg:hidden">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col px-4 py-4 sm:px-6">
            {mainTabs.map((item) => (
              <div
                key={item}
                className="rounded-lg px-3 py-3 text-sm font-medium tracking-wide text-white/85"
              >
                {item}
              </div>
            ))}

            <Link
              href="/portal"
              onClick={() => setOpen(false)}
              className={`mt-2 rounded-lg px-3 py-3 text-sm font-semibold tracking-wide transition ${
                isPortalActive
                  ? "bg-[#9ae22d] text-[#07111d]"
                  : "border border-[#9ae22d]/40 text-[#9ae22d]"
              }`}
            >
              ANSWER SHEET PORTAL
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}