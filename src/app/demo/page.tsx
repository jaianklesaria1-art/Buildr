"use client";

import { useState } from "react";
import SwipeDeck, { type SwipeChoice } from "@/components/ui/swipe-deck";

type Zone = "JOB_SEEKER" | "COFOUNDER" | "FREELANCER";

const MODES: { key: Zone; label: string }[] = [
  { key: "JOB_SEEKER", label: "Jobs" },
  { key: "COFOUNDER", label: "Cofounder" },
  { key: "FREELANCER", label: "Freelancer" },
];

const ZONE_STYLE: Record<Zone, string> = {
  JOB_SEEKER: "from-blue-500 to-indigo-600",
  COFOUNDER: "from-fuchsia-500 to-purple-600",
  FREELANCER: "from-amber-500 to-orange-600",
};

const JOBS = [
  { id: "j1", company: "Northwind Labs", title: "Founding Frontend Engineer", stage: "Pre-seed", location: "Remote", skills: ["React", "TypeScript", "Design systems"], description: "First frontend hire at a 3-person team building developer tools." },
  { id: "j2", company: "Fernway", title: "Backend Engineer", stage: "Seed", location: "Bengaluru", skills: ["Node.js", "Postgres", "AWS"], description: "Own the payments infrastructure for a logistics marketplace." },
  { id: "j3", company: "Cursive", title: "Product Designer", stage: "Series A", location: "Remote", skills: ["Figma", "Prototyping", "User research"], description: "Design the core workflow for a 40-person B2B SaaS team." },
  { id: "j4", company: "Alto Systems", title: "Growth Marketer", stage: "Pre-seed", location: "Mumbai", skills: ["SEO", "Paid acquisition", "Analytics"], description: "First marketing hire, 0-to-1 on channel strategy." },
];

const COFOUNDERS = [
  { id: "c1", name: "Priya Menon", stage: "Idea stage", sector: "Fintech", risk: "High", skills: ["Product", "Fundraising"] },
  { id: "c2", name: "Rohan Iyer", stage: "Prototype", sector: "EdTech", risk: "Medium", skills: ["Backend", "ML"] },
  { id: "c3", name: "Ananya Desai", stage: "Pre-seed", sector: "Healthtech", risk: "Medium", skills: ["Sales", "Ops"] },
  { id: "c4", name: "Vikram Shah", stage: "Idea stage", sector: "Logistics", risk: "High", skills: ["Backend", "Supply chain"] },
];

const GIGS = [
  { id: "g1", title: "Landing page redesign", budget: "₹15,000 – ₹25,000", skills: ["Figma", "Webflow"], description: "Redesign a 5-page marketing site for a seed-stage startup." },
  { id: "g2", title: "3-part explainer video", budget: "₹20,000 – ₹40,000", skills: ["Video editing", "Motion graphics"], description: "Short-form explainer videos for a product launch." },
  { id: "g3", title: "API integration work", budget: "₹30,000 – ₹50,000", skills: ["Node.js", "REST APIs"], description: "Connect a CRM to three third-party APIs, 2-week scope." },
  { id: "g4", title: "Brand copywriting", budget: "₹10,000 – ₹18,000", skills: ["Copywriting", "Brand voice"], description: "Website copy + tagline exploration for a rebrand." },
];

function initials(text: string) {
  return text.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function CardShell({ gradient, eyebrow, title, subtitle, children }: { gradient: string; eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className={`relative flex h-[55%] items-center justify-center bg-gradient-to-br ${gradient}`}>
        <span className="text-6xl font-bold text-white/90">{initials(title)}</span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 pb-4 pt-10 text-left text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">{eyebrow}</p>
          <h3 className="text-xl font-bold">{title}</h3>
          {subtitle && <p className="text-sm text-white/90">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((tag) => (
        <span key={tag} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function DemoPage() {
  const [mode, setMode] = useState<Zone>("JOB_SEEKER");
  const [tally, setTally] = useState({ liked: 0, passed: 0 });

  function record(choice: SwipeChoice) {
    setTally((prev) => (choice === "right" ? { ...prev, liked: prev.liked + 1 } : { ...prev, passed: prev.passed + 1 }));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <a href="/" className="text-lg font-bold tracking-tight">buildr.</a>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
          Demo — no account needed
        </span>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold transition-colors ${
              mode === m.key ? `bg-gradient-to-r text-white ${ZONE_STYLE[m.key]}` : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "JOB_SEEKER" && (
        <SwipeDeck
          items={JOBS}
          itemKey={(j) => j.id}
          itemLabel={(j) => `${j.title} at ${j.company}`}
          leftLabel="Pass"
          rightLabel="Apply"
          emptyLabel="That's the whole demo deck — sign up to see real matches."
          onDecide={(_job, choice) => record(choice)}
        >
          {(job) => (
            <CardShell gradient={ZONE_STYLE.JOB_SEEKER} eyebrow={job.stage} title={job.company} subtitle={job.title}>
              <p className="text-sm text-neutral-700">{job.description}</p>
              <p className="mt-2 text-xs text-neutral-500">{job.location}</p>
              <div className="mt-3"><Tags items={job.skills} /></div>
            </CardShell>
          )}
        </SwipeDeck>
      )}

      {mode === "FREELANCER" && (
        <SwipeDeck
          items={GIGS}
          itemKey={(g) => g.id}
          itemLabel={(g) => g.title}
          leftLabel="Pass"
          rightLabel="Apply"
          emptyLabel="That's the whole demo deck — sign up to see real matches."
          onDecide={(_gig, choice) => record(choice)}
        >
          {(gig) => (
            <CardShell gradient={ZONE_STYLE.FREELANCER} eyebrow={gig.budget} title={gig.title}>
              <p className="text-sm text-neutral-700">{gig.description}</p>
              <div className="mt-3"><Tags items={gig.skills} /></div>
            </CardShell>
          )}
        </SwipeDeck>
      )}

      {mode === "COFOUNDER" && (
        <SwipeDeck
          items={COFOUNDERS}
          itemKey={(c) => c.id}
          itemLabel={(c) => c.name}
          leftLabel="Pass"
          rightLabel="Interested"
          emptyLabel="That's the whole demo deck — sign up to see real matches."
          onDecide={(_profile, choice) => record(choice)}
        >
          {(profile) => (
            <CardShell gradient={ZONE_STYLE.COFOUNDER} eyebrow={profile.stage} title={profile.name} subtitle={profile.sector}>
              <p className="text-sm text-neutral-700">
                Risk tolerance: <span className="font-medium">{profile.risk}</span>
              </p>
              <p className="mt-2 text-xs text-neutral-500">Idea details unlock after you both match.</p>
              <div className="mt-3"><Tags items={profile.skills} /></div>
            </CardShell>
          )}
        </SwipeDeck>
      )}

      <div className="mt-6 flex items-center justify-center gap-4 text-sm text-neutral-500">
        <span>{tally.liked} liked</span>
        <span>·</span>
        <span>{tally.passed} passed</span>
      </div>

      <a
        href="/signup"
        className="mt-6 rounded-full bg-neutral-900 px-6 py-3 text-center text-sm font-semibold text-white"
      >
        Like what you see? Create your account
      </a>
    </main>
  );
}
