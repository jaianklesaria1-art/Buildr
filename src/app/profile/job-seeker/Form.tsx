"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InitialData = {
  skills: string[];
  resumeUrl: string | null;
  videoUrl: string | null;
  location: string | null;
  expectedRate: number | null;
  availability: string | null;
  bio: string | null;
} | null;

export default function JobSeekerForm({ initial }: { initial: InitialData }) {
  const router = useRouter();
  const [skills, setSkills] = useState(initial?.skills.join(", ") ?? "");
  const [resumeUrl, setResumeUrl] = useState(initial?.resumeUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [expectedRate, setExpectedRate] = useState(initial?.expectedRate?.toString() ?? "");
  const [availability, setAvailability] = useState(initial?.availability ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/profile/job-seeker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        resumeUrl,
        videoUrl,
        location,
        expectedRate: expectedRate || undefined,
        availability,
        bio,
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
        <input className={inputClass} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, SQL" required />
      </Field>
      <Field label="Resume URL">
        <input className={inputClass} value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://..." />
      </Field>
      <Field label="Short video intro URL (optional)">
        <input className={inputClass} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://loom.com/..." />
      </Field>
      <Field label="Location">
        <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bengaluru, India" />
      </Field>
      <Field label="Expected monthly rate (INR)">
        <input type="number" className={inputClass} value={expectedRate} onChange={(e) => setExpectedRate(e.target.value)} />
      </Field>
      <Field label="Availability">
        <input className={inputClass} value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Immediate, 2 weeks notice, etc." />
      </Field>
      <Field label="Short bio">
        <textarea className={inputClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
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
