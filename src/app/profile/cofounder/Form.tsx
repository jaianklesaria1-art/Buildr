"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InitialData = {
  skills: string[];
  stage: string | null;
  sector: string | null;
  riskTolerance: string | null;
  equityExpectation: string | null;
  ideaSummary: string | null;
  videoUrl: string | null;
  location: string | null;
} | null;

export default function CofounderForm({ initial }: { initial: InitialData }) {
  const router = useRouter();
  const [skills, setSkills] = useState(initial?.skills.join(", ") ?? "");
  const [stage, setStage] = useState(initial?.stage ?? "");
  const [sector, setSector] = useState(initial?.sector ?? "");
  const [riskTolerance, setRiskTolerance] = useState(initial?.riskTolerance ?? "MEDIUM");
  const [equityExpectation, setEquityExpectation] = useState(initial?.equityExpectation ?? "");
  const [ideaSummary, setIdeaSummary] = useState(initial?.ideaSummary ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/profile/cofounder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        stage,
        sector,
        riskTolerance,
        equityExpectation,
        ideaSummary,
        videoUrl,
        location,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError("Couldn't save your profile. Check the fields and try again.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <Field label="Skills you bring (comma separated)">
        <input className={inputClass} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Product, Fundraising, Backend" required />
      </Field>
      <Field label="Stage">
        <select className={inputClass} value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">Select...</option>
          <option value="IDEA">Idea stage</option>
          <option value="PROTOTYPE">Prototype</option>
          <option value="PRE_SEED">Pre-seed</option>
          <option value="SEED">Seed</option>
        </select>
      </Field>
      <Field label="Sector">
        <input className={inputClass} value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Fintech, EdTech, etc." />
      </Field>
      <Field label="Risk tolerance">
        <select className={inputClass} value={riskTolerance} onChange={(e) => setRiskTolerance(e.target.value)}>
          <option value="LOW">Low — need income stability</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High — full-time, no salary yet</option>
        </select>
      </Field>
      <Field label="Equity expectation">
        <input className={inputClass} value={equityExpectation} onChange={(e) => setEquityExpectation(e.target.value)} placeholder="e.g. 15-25%" />
      </Field>
      <Field label="Idea summary (kept behind soft NDA once matched)">
        <textarea className={inputClass} rows={3} value={ideaSummary} onChange={(e) => setIdeaSummary(e.target.value)} required />
      </Field>
      <Field label="Short video intro URL (optional)">
        <input className={inputClass} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://loom.com/..." />
      </Field>
      <Field label="Location">
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bengaluru, India" />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {submitting ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

const inputClass = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
