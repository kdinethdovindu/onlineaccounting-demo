"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import PortalSubHero from "@/components/PortalSubHero";
import { supabase } from "@/lib/supabase/client";

type StudentProfile = {
  full_name: string;
  email: string;
  role: "student";
  student_code: string | null;
  batch: string | null;
};

type PaperItem = {
  id: number;
  paper_title: string;
  courses: {
    course_name: string;
  } | null;
};

type SubmissionItem = {
  id: number;
  status: string;
  submission_time: string | null;
  uploaded_file_url: string | null;
  marks: number | null;
  comments: string | null;
  papers: {
    paper_title: string;
    courses: {
      course_name: string;
    } | null;
  } | null;
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string | null;
};

type PaperRow = {
  id: number;
  paper_title: string;
  courses: Array<{
    course_name: string;
  }> | null;
};

type SubmissionRow = {
  id: number;
  status: string;
  submission_time: string | null;
  uploaded_file_url: string | null;
  marks: number | null;
  comments: string | null;
  papers: Array<{
    paper_title: string;
    courses: Array<{
      course_name: string;
    }> | null;
  }> | null;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPaperId, setSelectedPaperId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/student-login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, role, student_code, batch")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData || profileData.role !== "student") {
        await supabase.auth.signOut();
        router.replace("/student-login");
        return;
      }

      setProfile(profileData as StudentProfile);

      const { data: papersData, error: papersError } = await supabase
        .from("papers")
        .select(`
          id,
          paper_title,
          courses (
            course_name
          )
        `)
        .order("id", { ascending: true });

      if (!papersError && papersData) {
        const normalizedPapers: PaperItem[] = (papersData as PaperRow[]).map((paper) => ({
          id: paper.id,
          paper_title: paper.paper_title,
          courses:
            paper.courses && paper.courses.length > 0
              ? { course_name: paper.courses[0].course_name }
              : null,
        }));

        setPapers(normalizedPapers);
      }

      await loadSubmissions(user.id);
      await loadNotifications(user.id);

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function loadSubmissions(studentId: string) {
    const { data, error } = await supabase
      .from("submissions")
      .select(`
        id,
        status,
        submission_time,
        uploaded_file_url,
        marks,
        comments,
        papers (
          paper_title,
          courses (
            course_name
          )
        )
      `)
      .eq("student_id", studentId)
      .order("id", { ascending: false });

    if (!error && data) {
      const normalizedSubmissions: SubmissionItem[] = (data as SubmissionRow[]).map(
        (submission) => {
          const firstPaper =
            submission.papers && submission.papers.length > 0
              ? submission.papers[0]
              : null;

          return {
            id: submission.id,
            status: submission.status,
            submission_time: submission.submission_time,
            uploaded_file_url: submission.uploaded_file_url,
            marks: submission.marks,
            comments: submission.comments,
            papers: firstPaper
              ? {
                  paper_title: firstPaper.paper_title,
                  courses:
                    firstPaper.courses && firstPaper.courses.length > 0
                      ? { course_name: firstPaper.courses[0].course_name }
                      : null,
                }
              : null,
          };
        }
      );

      setSubmissions(normalizedSubmissions);
    }
  }

  async function loadNotifications(studentId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at")
      .eq("user_id", studentId)
      .order("id", { ascending: false });

    if (!error && data) {
      setNotifications(data as NotificationItem[]);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/student-login");
  }

  async function handleUpload() {
    setMessage("");
    setMessageType("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/student-login");
      return;
    }

    if (!selectedPaperId) {
      setMessage("Please select a paper first.");
      setMessageType("error");
      return;
    }

    if (!selectedFile) {
      setMessage("Please choose a file to upload.");
      setMessageType("error");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("Only PDF, PNG, and JPG files are allowed.");
      setMessageType("error");
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024;

    if (selectedFile.size > maxSizeInBytes) {
      setMessage("File size must be 10MB or less.");
      setMessageType("error");
      return;
    }

    try {
      setUploading(true);

      const cleanFileName = selectedFile.name.replace(/\s+/g, "_");
      const filePath = `${user.id}/${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("answer-sheets")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setMessage(uploadError.message);
        setMessageType("error");
        setUploading(false);
        return;
      }

      const { error: insertError } = await supabase.from("submissions").insert({
        student_id: user.id,
        paper_id: Number(selectedPaperId),
        uploaded_file_url: filePath,
        status: "Submitted",
      });

      if (insertError) {
        setMessage(insertError.message);
        setMessageType("error");
        setUploading(false);
        return;
      }

      await loadSubmissions(user.id);
      await loadNotifications(user.id);

      setSelectedPaperId("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Answer sheet uploaded successfully.");
      setMessageType("success");
    } catch {
      setMessage("Something went wrong while uploading.");
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  }

  async function handleOpenFile(filePath: string | null) {
    if (!filePath) return;

    const { data, error } = await supabase.storage
      .from("answer-sheets")
      .createSignedUrl(filePath, 60);

    if (error || !data?.signedUrl) {
      setMessage("Could not open the uploaded file.");
      setMessageType("error");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  function formatDate(dateValue: string | null) {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleString();
  }

  function getStatusClass(status: string) {
    if (status === "Submitted") {
      return "bg-sky-100 text-sky-700 border border-sky-200";
    }
    if (status === "Under Review") {
      return "bg-amber-100 text-amber-700 border border-amber-200";
    }
    if (status === "Marked") {
      return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    }
    if (status === "Feedback Released") {
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }
    return "bg-slate-100 text-slate-700 border border-slate-200";
  }

  const feedbackReleasedCount = submissions.filter(
    (item) => item.status === "Feedback Released"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f5f8]">
        <BrandHeader />
        <div className="mx-auto max-w-[1150px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
            Loading student dashboard...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f5f8]">
      <BrandHeader />

      <PortalSubHero
        eyebrow="ANSWER SHEET PORTAL"
        title="Student Dashboard"
        description="Upload your answer sheets, track submission status, open your previous files, and view marks and lecturer comments once feedback is released."
        accent="blue"
        action={
          <button
            onClick={handleLogout}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Logout
          </button>
        }
      />

      <section className="mx-auto w-full max-w-[1150px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#2b67ff]">
              STUDENT
            </p>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {profile?.full_name}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {profile?.student_code || "-"}
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
              BATCH
            </p>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {profile?.batch || "-"}
            </p>
            <p className="mt-2 text-sm text-slate-600">Current academic intake</p>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
              SUBMISSIONS
            </p>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {submissions.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">Uploaded records</p>
          </div>

          <div className="rounded-[24px] bg-[linear-gradient(135deg,#08111d_0%,#10233a_55%,#13263e_100%)] p-6 text-white shadow-2xl shadow-slate-400/20">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#9ae22d]">
                FEEDBACK RELEASED
              </p>
              <p className="mt-3 text-2xl font-extrabold">
                {feedbackReleasedCount}
              </p>
              <p className="mt-2 text-sm text-white/70">
                Ready to review
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-8">
            <div className="rounded-[28px] bg-white p-7 shadow-lg shadow-slate-300/25 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-xl">
                  ⬆
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.18em] text-[#2b67ff]">
                    SUBMIT ANSWER SHEET
                  </p>
                  <h2 className="text-2xl font-extrabold uppercase text-slate-900">
                    Upload now
                  </h2>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select Paper
                  </label>
                  <select
                    value={selectedPaperId}
                    onChange={(e) => setSelectedPaperId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#2b67ff] focus:ring-2 focus:ring-[#dbe8ff]"
                  >
                    <option value="">-- Select a paper --</option>
                    {papers.map((paper) => (
                      <option key={paper.id} value={paper.id}>
                        {paper.paper_title}
                        {paper.courses?.course_name
                          ? ` (${paper.courses.course_name})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Choose File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#eef4ff] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#2b67ff]"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Allowed: PDF, PNG, JPG. Maximum size: 10MB.
                  </p>
                </div>

                {message ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      messageType === "success"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {message}
                  </div>
                ) : null}

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full rounded-2xl bg-[#2b67ff] px-4 py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-[#1e57ec] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {uploading ? "UPLOADING..." : "UPLOAD ANSWER SHEET"}
                </button>
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-7 shadow-lg shadow-slate-300/25 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold tracking-[0.18em] text-[#9ae22d]">
                    NOTIFICATIONS
                  </p>
                  <h2 className="text-2xl font-extrabold uppercase text-slate-900">
                    Latest updates
                  </h2>
                </div>
                <div className="rounded-full bg-[#eef8d3] px-3 py-1 text-xs font-bold text-[#516f0f]">
                  {notifications.length}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {notifications.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-bold text-slate-900">
                        {notification.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {notification.message}
                      </p>
                      <p className="mt-3 text-xs text-slate-500">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-lg shadow-slate-300/25 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-[#2b67ff]">
                  MY SUBMISSIONS
                </p>
                <h2 className="text-2xl font-extrabold uppercase text-slate-900">
                  Submission history
                </h2>
              </div>
              <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#2b67ff]">
                {submissions.length}
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {submissions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No submissions yet.
                </div>
              ) : (
                submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900">
                          {submission.papers?.paper_title || "Untitled Paper"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Course: {submission.papers?.courses?.course_name || "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Submitted: {formatDate(submission.submission_time)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 xl:items-end">
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            submission.status
                          )}`}
                        >
                          {submission.status}
                        </span>

                        <button
                          onClick={() => handleOpenFile(submission.uploaded_file_url)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold tracking-wide text-slate-700 transition hover:bg-slate-100"
                        >
                          OPEN FILE
                        </button>
                      </div>
                    </div>

                    {(submission.status === "Marked" ||
                      submission.status === "Feedback Released") && (
                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                          <p className="text-xs font-semibold tracking-[0.18em] text-indigo-800">
                            MARKS
                          </p>
                          <p className="mt-3 text-2xl font-extrabold text-indigo-700">
                            {submission.marks ?? "-"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-xs font-semibold tracking-[0.18em] text-emerald-800">
                            LECTURER COMMENT
                          </p>
                          <p className="mt-3 text-sm leading-7 text-emerald-700">
                            {submission.comments || "No comments added yet."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
