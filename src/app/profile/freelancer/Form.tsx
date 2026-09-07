"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InitialData = {
  skills: string[];
  hourlyRate: number | null;
  portfolioUrl: string | null;
  videoUrl: string | null;
  location: string | null;
  availability: string | null;
} | null;

export default function FreelancerForm({ initial }: { initial: InitialData }) {
  const router = useRouter();
  const [skills, setSkills] = useState(initial?.skills.join(", ") ?? "");
  const [hourlyRate, setHourlyRate] = useState(initial?.hourlyRate?.toString() ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(initial?.portfolioUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [availability, setAvailability] = useState(initial?.availability ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/profile/freelancer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        hourlyRate: hourlyRate || undefined,
        portfolioUrl,
        videoUrl,
        location,
        availability,
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
      <Field label="Skills (comma separated)">
        <input className={inputClass} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Figma, Copywriting, Video editing" required />
      </Field>
      <Field label="Hourly rate (INR)">
        <input type="number" className={inputClass} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
      </Field>
      <Field label="Portfolio URL">
        <input className={inputClass} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." required />
      </Field>
      <Field label="Short video intro URL (optional)">
        <input className={inputClass} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://loom.com/..." />
      </Field>
      <Field label="Location">
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / Bengaluru, India" />
      </Field>
      <Field label="Availability">
        <input className={inputClass} value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="10 hrs/week, full-time, etc." />
      </Field>

      <p className="text-xs text-neutral-500">
        Your rate is shown as-is — no platform fee is deducted.
      </p>

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
