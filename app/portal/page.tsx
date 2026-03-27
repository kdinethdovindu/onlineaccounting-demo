import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

const features = [
  "Student answer sheet upload",
  "Lecturer review and marking",
  "Submission status tracking",
  "Marks and comments release",
  "Notification updates to students",
  "Role-based access control",
];

const steps = [
  "Student logs in using a pre-created account",
  "Student selects the paper and uploads the answer sheet",
  "Lecturer opens the submission and reviews it",
  "Marks and comments are entered by the lecturer",
  "Status is updated and feedback is released to the student",
];

export default function PortalPage() {
  return (
    <main className="min-h-screen bg-[#f3f5f8] text-slate-900">
      <BrandHeader />

      <section className="bg-[linear-gradient(135deg,#08111d_0%,#10233a_55%,#13263e_100%)] text-white">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-[#9ae22d]">
              NEW SOLUTION MODULE
            </p>

            <h1 className="mt-4 text-4xl font-extrabold uppercase leading-tight sm:text-5xl lg:text-6xl">
              Answer Sheet Upload & Marking Portal
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75 sm:text-base lg:text-lg">
              This module is presented as an extension to the Online Accounting
              platform. It allows students to upload answer sheets digitally and
              gives lecturers a structured area to review submissions, assign
              marks, add comments, and release feedback.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/student-login"
                className="inline-flex items-center justify-center rounded-xl bg-[#9ae22d] px-6 py-3 text-sm font-bold tracking-wide text-[#07111d] transition hover:brightness-95"
              >
                STUDENT LOGIN
              </Link>

              <Link
                href="/lecturer-login"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-white/10"
              >
                LECTURER LOGIN
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1150px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#2b67ff]" />
          <h2 className="text-center text-3xl font-extrabold uppercase tracking-tight text-[#2b67ff] sm:text-4xl">
            Portal Access
          </h2>
          <div className="h-px flex-1 bg-[#2b67ff]" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] bg-white p-8 shadow-lg shadow-slate-300/25">
            <p className="text-sm font-semibold tracking-[0.18em] text-[#2b67ff]">
              STUDENT SIDE
            </p>
            <h3 className="mt-4 text-3xl font-extrabold uppercase text-slate-900">
              Upload and track
            </h3>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Students can log in, choose a paper, upload PDF or image answer
              sheets, track submission progress, and later view released marks
              and comments.
            </p>

            <Link
              href="/student-login"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#2b67ff] px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#1e57ec]"
            >
              OPEN STUDENT PORTAL
            </Link>
          </div>

          <div className="rounded-[28px] bg-white p-8 shadow-lg shadow-slate-300/25">
            <p className="text-sm font-semibold tracking-[0.18em] text-[#9ae22d]">
              LECTURER SIDE
            </p>
            <h3 className="mt-4 text-3xl font-extrabold uppercase text-slate-900">
              Review and release
            </h3>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Lecturers can log in, open uploaded files, update status, add marks,
              write comments, and release final feedback to students through the
              same system.
            </p>

            <Link
              href="/lecturer-login"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#9ae22d] px-6 py-3 text-sm font-bold tracking-wide text-[#07111d] transition hover:brightness-95"
            >
              OPEN LECTURER PORTAL
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1150px] gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8 lg:pb-16">
        <div className="rounded-[28px] bg-white p-8 shadow-lg shadow-slate-300/25">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#2b67ff]" />
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#2b67ff]">
              Key Features
            </h2>
          </div>

          <div className="space-y-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-[linear-gradient(135deg,#08111d_0%,#10233a_55%,#13263e_100%)] p-8 text-white shadow-2xl shadow-slate-400/25">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#9ae22d]" />
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#9ae22d]">
              Workflow
            </h2>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <p className="text-xs font-semibold tracking-[0.18em] text-[#9ae22d]">
                  STEP {index + 1}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/85">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#08111d] text-white">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-8 text-sm text-white/70 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Presented as a proposed feature extension for Online Accounting</p>
          <p className="font-semibold tracking-[0.18em] text-[#9ae22d]">
            STUDENT · LECTURER · MARKING · FEEDBACK
          </p>
        </div>
      </footer>
    </main>
  );
}