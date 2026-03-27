"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import PortalSubHero from "@/components/PortalSubHero";
import { supabase } from "@/lib/supabase/client";

type LecturerProfile = {
  full_name: string;
  email: string;
  role: "lecturer";
};

type AssignedPaper = {
  id: number;
  paper_title: string;
  course_name: string;
};

type SubmissionItem = {
  id: number;
  student_id: string;
  paper_id: number;
  status: string;
  submission_time: string | null;
  uploaded_file_url: string | null;
  marks: number | null;
  comments: string | null;
  student: {
    full_name: string;
    email: string;
    student_code: string | null;
  } | null;
  paper: {
    paper_title: string;
    course_name: string;
  } | null;
};

const STATUS_OPTIONS = [
  "Submitted",
  "Under Review",
  "Marked",
  "Feedback Released",
];

export default function LecturerDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<LecturerProfile | null>(null);
  const [assignedPapers, setAssignedPapers] = useState<AssignedPaper[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);

  const [editStatus, setEditStatus] = useState("Submitted");
  const [editMarks, setEditMarks] = useState("");
  const [editComments, setEditComments] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/lecturer-login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      if (profileError || !profileData || profileData.role !== "lecturer") {
        await supabase.auth.signOut();
        router.replace("/lecturer-login");
        return;
      }

      setProfile(profileData as LecturerProfile);

      const { data: papersRaw, error: papersError } = await supabase
        .from("papers")
        .select("id, paper_title, course_id")
        .eq("lecturer_id", user.id)
        .order("id", { ascending: true });

      if (papersError || !papersRaw) {
        setLoading(false);
        return;
      }

      const courseIds = Array.from(
        new Set(
          papersRaw
            .map((paper) => paper.course_id)
            .filter((value): value is number => value !== null)
        )
      );

      let coursesMap = new Map<number, string>();

      if (courseIds.length > 0) {
        const { data: courseRows } = await supabase
          .from("courses")
          .select("id, course_name")
          .in("id", courseIds);

        if (courseRows) {
          coursesMap = new Map(courseRows.map((course) => [course.id, course.course_name]));
        }
      }

      const papersFormatted: AssignedPaper[] = papersRaw.map((paper) => ({
        id: paper.id,
        paper_title: paper.paper_title,
        course_name: paper.course_id ? coursesMap.get(paper.course_id) || "N/A" : "N/A",
      }));

      setAssignedPapers(papersFormatted);

      if (papersFormatted.length === 0) {
        setSubmissions([]);
        setSelectedSubmission(null);
        setLoading(false);
        return;
      }

      await loadSubmissions(papersFormatted);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function loadSubmissions(papersFormatted: AssignedPaper[]) {
    const paperMap = new Map(
      papersFormatted.map((paper) => [
        paper.id,
        {
          paper_title: paper.paper_title,
          course_name: paper.course_name,
        },
      ])
    );

    const paperIds = papersFormatted.map((paper) => paper.id);

    const { data: submissionRows, error: submissionsError } = await supabase
      .from("submissions")
      .select("id, student_id, paper_id, status, submission_time, uploaded_file_url, marks, comments")
      .in("paper_id", paperIds)
      .order("id", { ascending: false });

    if (submissionsError || !submissionRows) {
      setSubmissions([]);
      setSelectedSubmission(null);
      return;
    }

    const studentIds = Array.from(new Set(submissionRows.map((row) => row.student_id)));

    let studentMap = new Map<
      string,
      { full_name: string; email: string; student_code: string | null }
    >();

    if (studentIds.length > 0) {
      const { data: studentRows } = await supabase
        .from("profiles")
        .select("id, full_name, email, student_code")
        .in("id", studentIds);

      if (studentRows) {
        studentMap = new Map(
          studentRows.map((student) => [
            student.id,
            {
              full_name: student.full_name,
              email: student.email,
              student_code: student.student_code,
            },
          ])
        );
      }
    }

    const finalSubmissions: SubmissionItem[] = submissionRows.map((row) => ({
      id: row.id,
      student_id: row.student_id,
      paper_id: row.paper_id,
      status: row.status,
      submission_time: row.submission_time,
      uploaded_file_url: row.uploaded_file_url,
      marks: row.marks,
      comments: row.comments,
      student: studentMap.get(row.student_id) || null,
      paper: paperMap.get(row.paper_id) || null,
    }));

    setSubmissions(finalSubmissions);

    if (finalSubmissions.length > 0) {
      const currentSelectedId = selectedSubmission?.id;
      const foundSelected = finalSubmissions.find((item) => item.id === currentSelectedId);
      const target = foundSelected || finalSubmissions[0];
      selectSubmission(target);
    } else {
      setSelectedSubmission(null);
    }
  }

  function selectSubmission(submission: SubmissionItem) {
    setSelectedSubmission(submission);
    setEditStatus(submission.status || "Submitted");
    setEditMarks(submission.marks !== null ? String(submission.marks) : "");
    setEditComments(submission.comments || "");
    setMessage("");
    setMessageType("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/lecturer-login");
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

  async function handleSaveChanges() {
    if (!selectedSubmission) return;

    setSaving(true);
    setMessage("");
    setMessageType("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/lecturer-login");
      return;
    }

    const payload: {
      status: string;
      comments: string | null;
      marks: number | null;
      lecturer_id: string;
      marked_at?: string;
    } = {
      status: editStatus,
      comments: editComments.trim() ? editComments.trim() : null,
      marks: editMarks.trim() ? Number(editMarks) : null,
      lecturer_id: user.id,
    };

    if (editStatus === "Marked" || editStatus === "Feedback Released") {
      payload.marked_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("submissions")
      .update(payload)
      .eq("id", selectedSubmission.id);

    if (updateError) {
      setMessage(updateError.message);
      setMessageType("error");
      setSaving(false);
      return;
    }

    if (
      selectedSubmission.status !== "Feedback Released" &&
      editStatus === "Feedback Released"
    ) {
      await supabase.from("notifications").insert({
        user_id: selectedSubmission.student_id,
        title: "Feedback Released",
        message: `Feedback has been released for ${
          selectedSubmission.paper?.paper_title || "your paper"
        }.`,
      });
    }

    await loadSubmissions(assignedPapers);

    setMessage("Submission updated successfully.");
    setMessageType("success");
    setSaving(false);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f5f8]">
        <BrandHeader />
        <div className="mx-auto max-w-[1150px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
            Loading lecturer dashboard...
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
        title="Lecturer Dashboard"
        description="Review uploaded answer sheets, open student files, update submission status, assign marks, add comments, and release feedback through one centralized lecturer panel."
        accent="lime"
      />

      <section className="mx-auto w-full max-w-[1150px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#9ae22d]">
              LECTURER
            </p>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {profile?.full_name}
            </p>
            <p className="mt-2 text-sm text-slate-600">Review access enabled</p>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
              ASSIGNED PAPERS
            </p>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {assignedPapers.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">Available for review</p>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-lg shadow-slate-300/20">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">
              SUBMISSIONS
            </p>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">
              {submissions.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">Student uploads received</p>
          </div>

          <div className="rounded-[24px] bg-[linear-gradient(135deg,#08111d_0%,#10233a_55%,#13263e_100%)] p-6 text-white shadow-2xl shadow-slate-400/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-[#9ae22d]">
                  REVIEW AREA
                </p>
                <p className="mt-3 text-sm font-semibold text-white/80">
                  {profile?.email}
                </p>
                <p className="mt-2 text-sm text-white/70">Manage marking workflow</p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[28px] bg-white p-7 shadow-lg shadow-slate-300/25 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-[#2b67ff]">
                  SUBMISSIONS
                </p>
                <h2 className="text-2xl font-extrabold uppercase text-slate-900">
                  Select a record
                </h2>
              </div>
              <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#2b67ff]">
                {submissions.length}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {submissions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  No submissions found yet. Upload one from the student account first.
                </div>
              ) : (
                submissions.map((submission) => (
                  <button
                    key={submission.id}
                    type="button"
                    onClick={() => selectSubmission(submission)}
                    className={`w-full rounded-[22px] border p-4 text-left transition ${
                      selectedSubmission?.id === submission.id
                        ? "border-[#9ae22d] bg-[#f4fadf]"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {submission.paper?.paper_title || "Untitled Paper"}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {submission.student?.full_name || "Unknown Student"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {submission.student?.student_code || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {submission.paper?.course_name || "N/A"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          submission.status
                        )}`}
                      >
                        {submission.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-7 shadow-lg shadow-slate-300/25 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#effbd7] text-xl">
                📝
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-[#9ae22d]">
                  REVIEW PANEL
                </p>
                <h2 className="text-2xl font-extrabold uppercase text-slate-900">
                  Update submission
                </h2>
              </div>
            </div>

            {!selectedSubmission ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Select a submission to review.
              </div>
            ) : (
              <div className="mt-8 space-y-5">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-base font-bold text-slate-900">
                    {selectedSubmission.paper?.paper_title || "Untitled Paper"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Course: {selectedSubmission.paper?.course_name || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Student: {selectedSubmission.student?.full_name || "Unknown Student"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Email: {selectedSubmission.student?.email || "-"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Submitted: {formatDate(selectedSubmission.submission_time)}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleOpenFile(selectedSubmission.uploaded_file_url)}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#2b67ff] px-5 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#1e57ec]"
                  >
                    OPEN UPLOADED FILE
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#9ae22d] focus:ring-2 focus:ring-[#eef8d3]"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={editMarks}
                    onChange={(e) => setEditMarks(e.target.value)}
                    placeholder="Enter marks"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#9ae22d] focus:ring-2 focus:ring-[#eef8d3]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Comments
                  </label>
                  <textarea
                    rows={5}
                    value={editComments}
                    onChange={(e) => setEditComments(e.target.value)}
                    placeholder="Write lecturer comments here..."
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#9ae22d] focus:ring-2 focus:ring-[#eef8d3]"
                  />
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
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="w-full rounded-2xl bg-[#9ae22d] px-4 py-3.5 text-sm font-bold tracking-wide text-[#07111d] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}