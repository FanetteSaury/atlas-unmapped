"use client";

// Atlas — Post-a-project dialog (employer-side).
//
// 4 fields. On submit -> POST /api/projects -> show matched-count + WA group
// invite link. Tapping the link opens WhatsApp with the group join sheet.
//
// Why this UX: in Ghana / Bangladesh / Vietnam, employers don't browse résumés —
// they ping a WA group "who's free Friday?". Atlas inverts the model: employer
// describes the job, Atlas creates the room + populates it with matched workers.

import { useState } from "react";

interface Props {
  country: string;
  iscoOptions: { code: string; title: string }[];
  wardOptions: string[];
  onClose: () => void;
}

interface PostResult {
  project: { slug: string; matchedCount: number; title: string; iscoCode: string };
  invite: { url: string; name: string; configured: boolean };
}

export function PostProjectDialog({ country, iscoOptions, wardOptions, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [iscoCode, setIscoCode] = useState(iscoOptions[0]?.code ?? "");
  const [ward, setWard] = useState(wardOptions[0] ?? "");
  const [dayNeeded, setDayNeeded] = useState("");
  const [headcount, setHeadcount] = useState(1);
  const [notes, setNotes] = useState("");
  const [employerHandle, setEmployerHandle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PostResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          country,
          iscoCode,
          title,
          ward,
          dayNeeded,
          headcount,
          notes: notes || undefined,
          employerHandle: employerHandle || undefined,
        }),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(txt);
      }
      setResult(await r.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {!result ? (
          <>
            <div className="rounded-md bg-[#F0F4F8] px-3 py-1 text-[10px] uppercase tracking-widest text-[#006EB5]">
              Welcome — start here
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#002244]">📣 Post your first project</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Atlas matches your brief with verified workers in the area + opens a chat room with your shortlist.
              You ask <em>&ldquo;who&apos;s free Friday?&rdquo;</em>, they reply. No résumés, no calls, no app install.
            </p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <Field label="Project title">
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Phone shop opening — 3 techs"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Skill needed">
                  <select
                    value={iscoCode}
                    onChange={(e) => setIscoCode(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                  >
                    {iscoOptions.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ward">
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                  >
                    {wardOptions.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Day needed">
                  <input
                    required
                    value={dayNeeded}
                    onChange={(e) => setDayNeeded(e.target.value)}
                    placeholder="Friday Nov 28"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                  />
                </Field>
                <Field label="Headcount">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value))}
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                  />
                </Field>
              </div>
              <Field label="Your shop / handle (optional)">
                <input
                  value={employerHandle}
                  onChange={(e) => setEmployerHandle(e.target.value)}
                  placeholder="Karim's Phone Shop"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                />
              </Field>
              <Field label="Notes (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="₵180/day, full kit provided…"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-950"
                />
              </Field>
              {error && (
                <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? "Posting…" : "Post + open WA room"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold tracking-tight">✅ Project posted</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              <strong>{result.project.matchedCount}</strong> verified candidate
              {result.project.matchedCount === 1 ? "" : "s"} matched in {ward}.
            </p>
            <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div className="text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-200">
                WhatsApp room
              </div>
              <div className="mt-1 text-sm font-medium text-emerald-900 dark:text-emerald-100">
                {result.invite.name}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`/employer/squad/${result.project.slug}`}
                  className="inline-flex items-center gap-2 rounded-md bg-[#075e54] px-3 py-2 text-sm font-medium text-white hover:bg-[#054d44]"
                >
                  🎬 Preview the room
                </a>
                <a
                  href={result.invite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  💬 Open WhatsApp
                </a>
              </div>
              {!result.invite.configured && (
                <p className="mt-3 text-[11px] leading-snug text-emerald-900/80 dark:text-emerald-200/70">
                  Demo-grade link. Production: Twilio Conversations API creates a fresh room per project + invites
                  matched candidates by their hashed phone.
                </p>
              )}
            </div>
            <p className="mt-4 text-xs text-zinc-500">
              Atlas pings each matched candidate on WhatsApp with this link. They tap → join → you ask{" "}
              <em>&ldquo;who&apos;s free {dayNeeded}?&rdquo;</em> in the room.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/5"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</div>
      {children}
    </label>
  );
}
