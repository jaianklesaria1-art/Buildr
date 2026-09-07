"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/listings/gig", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        skillsRequired: skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
        budgetMin: budgetMin || undefined,
        budgetMax: budgetMax || undefined,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Couldn't post the gig. Check the fields and try again.");
      return;
    }

    router.push("/dashboard");
  }

  const inputClass = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm";

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Post a gig</h1>
      <p className="mt-1 text-sm text-neutral-500">Shown to matching freelancers in their feed.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Skills required (comma separated)</label>
          <input className={inputClass} value={skillsRequired} onChange={(e) => setSkillsRequired(e.target.value)} required />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium">Budget min (INR)</label>
            <input type="number" className={inputClass} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Budget max (INR)</label>
            <input type="number" className={inputClass} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {submitting ? "Posting..." : "Post gig"}
        </button>
      </form>
    </main>
  );
}
