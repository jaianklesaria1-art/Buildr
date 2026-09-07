"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/listings/job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        company,
        description,
        skillsRequired: skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        location,
        stage,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Couldn't post the listing. Check the fields and try again.");
      return;
    }

    router.push("/dashboard");
  }

  const inputClass = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm";

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Post a job</h1>
      <p className="mt-1 text-sm text-neutral-500">Shown to matching job seekers in their feed.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Company</label>
          <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Skills required (comma separated)</label>
          <input className={inputClass} value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Company stage</label>
          <input className={inputClass} value={stage} onChange={(e) => setStage(e.target.value)} placeholder="Pre-seed, Seed, Series A" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {submitting ? "Posting..." : "Post job"}
        </button>
      </form>
    </main>
  );
}
