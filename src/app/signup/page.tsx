"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ZONES = [
  { value: "JOB_SEEKER", label: "Job Seeker", blurb: "Find roles at pre-seed to Series A startups" },
  { value: "COFOUNDER", label: "Cofounder", blurb: "Find a technical or business cofounder" },
  { value: "FREELANCER", label: "Freelancer", blurb: "Find gigs, set your own rate" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zones, setZones] = useState<string[]>([]);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleZone(zone: string) {
    setZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (zones.length === 0) {
      setError("Pick at least one zone to continue.");
      return;
    }
    if (!consentAccepted) {
      setError("You need to accept the data notice to sign up.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, zones, consentAccepted }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong.");
      return;
    }

    router.push("/login?signup=success");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold">Create your buildr. account</h1>
      <p className="mt-1 text-sm text-neutral-500">
        One account, pick the zones that matter to you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            minLength={8}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Which zones are you active in?</label>
          <div className="mt-2 flex flex-col gap-2">
            {ZONES.map((zone) => (
              <label
                key={zone.value}
                className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm ${
                  zones.includes(zone.value)
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={zones.includes(zone.value)}
                  onChange={() => toggleZone(zone.value)}
                />
                <span>
                  <span className="font-medium">{zone.label}</span>
                  <span className="block text-neutral-500">{zone.blurb}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
          <p className="font-medium text-neutral-800">What we collect and why</p>
          <p className="mt-1">
            We store your profile details (skills, rate/equity expectations, resume or
            video links) to match you with relevant people and listings, and to
            improve matching over time. We do not sell your data to third parties.
            You can request deletion of your account and data at any time.
          </p>
          <label className="mt-2 flex items-center gap-2 font-medium text-neutral-800">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
            />
            I understand and agree to this data use.
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </main>
  );
}
