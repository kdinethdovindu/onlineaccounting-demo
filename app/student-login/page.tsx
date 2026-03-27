"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandHeader from "@/components/BrandHeader";
import PortalSubHero from "@/components/PortalSubHero";
import { supabase } from "@/lib/supabase/client";

export default function StudentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("student1@demo.com");
  const [password, setPassword] = useState("Demo12345");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setErrorMessage("Login failed. No user account was returned.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setErrorMessage("Profile not found in profiles table.");
      setLoading(false);
      return;
    }

    if (profile.role !== "student") {
      await supabase.auth.signOut();
      setErrorMessage("This account is not a student account.");
      setLoading(false);
      return;
    }

    router.push("/student-dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f3f5f8]">
      <BrandHeader />

      <PortalSubHero
        eyebrow="ANSWER SHEET PORTAL"
        title="Student Login"
        description="Use your student access to enter the portal, upload answer sheets, track submission progress, and view marks and lecturer feedback after release."
        accent="blue"
      />

      <section className="mx-auto w-full max-w-[1150px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] bg-white p-7 shadow-lg shadow-slate-300/25 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-xl">
                🎓
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-[#2b67ff]">
                  STUDENT ACCESS
                </p>
                <h2 className="text-2xl font-extrabold uppercase text-slate-900">
                  Sign in to continue
                </h2>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Student Email
                </label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#2b67ff] focus:ring-2 focus:ring-[#dbe8ff]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#2b67ff] focus:ring-2 focus:ring-[#dbe8ff]"
                />
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#2b67ff] px-4 py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-[#1e57ec] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "LOGGING IN..." : "LOGIN AS STUDENT"}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/portal"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                ← BACK TO PORTAL
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[28px] bg-[linear-gradient(135deg,#08111d_0%,#10233a_55%,#13263e_100%)] p-8 text-white shadow-2xl shadow-slate-400/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold tracking-[0.18em] text-[#9ae22d]">
                    DEMO ACCOUNT
                  </p>
                  <h3 className="mt-3 text-3xl font-extrabold uppercase">
                    Ready to test
                  </h3>
                </div>
                <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/80">
                  PRE-CREATED USER
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#9ae22d]">
                    EMAIL
                  </p>
                  <p className="mt-3 break-all text-base font-bold text-white">
                    student1@demo.com
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#9ae22d]">
                    PASSWORD
                  </p>
                  <p className="mt-3 text-base font-bold text-white">
                    Demo12345
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
                <p className="text-sm font-semibold tracking-[0.18em] text-[#2b67ff]">
                  STUDENT FEATURES
                </p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
                  <li>• Select a paper before submission</li>
                  <li>• Upload PDF or image answer sheets</li>
                  <li>• Track current submission status</li>
                  <li>• Open previously uploaded files</li>
                </ul>
              </div>

              <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
                <p className="text-sm font-semibold tracking-[0.18em] text-[#9ae22d]">
                  FEEDBACK FLOW
                </p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
                  <li>• Lecturer reviews the uploaded file</li>
                  <li>• Marks and comments are entered</li>
                  <li>• Feedback is released later</li>
                  <li>• Notifications appear in dashboard</li>
                </ul>
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
              <p className="text-sm font-semibold tracking-[0.18em] text-slate-500">
                PORTAL NOTE
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This student login is presented as part of the proposed Answer Sheet
                Portal extension for the Online Accounting platform, not as a
                separate standalone system.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}