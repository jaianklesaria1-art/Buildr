"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SwipeDeck, { type SwipeChoice } from "@/components/ui/swipe-deck";
import AppHeader from "@/components/app/AppHeader";

type Zone = "JOB_SEEKER" | "COFOUNDER" | "FREELANCER";

type Job = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  location: string | null;
  stage: string | null;
};

type Gig = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budgetMin: number | null;
  budgetMax: number | null;
};

type Cofounder = {
  id: string;
  name: string;
  stage: string | null;
  sector: string | null;
  riskTolerance: string | null;
  skills: string[];
};

const MODES: { key: Zone; label: string; emptyProfileLabel: string; profileHref: string }[] = [
  { key: "JOB_SEEKER", label: "Jobs", emptyProfileLabel: "Complete your job seeker profile to see roles.", profileHref: "/profile/job-seeker" },
  { key: "COFOUNDER", label: "Cofounder", emptyProfileLabel: "Complete your cofounder profile to see matches.", profileHref: "/profile/cofounder" },
  { key: "FREELANCER", label: "Freelancer", emptyProfileLabel: "Complete your freelancer profile to see gigs.", profileHref: "/profile/freelancer" },
];

const ZONE_STYLE: Record<Zone, { gradient: string; accent: string }> = {
  JOB_SEEKER: { gradient: "from-blue-500 to-indigo-600", accent: "text-blue-600" },
  COFOUNDER: { gradient: "from-fuchsia-500 to-purple-600", accent: "text-fuchsia-600" },
  FREELANCER: { gradient: "from-amber-500 to-orange-600", accent: "text-amber-600" },
};

function initials(text: string) {
  return text
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function sendInteraction(
  targetType: "JOB_LISTING" | "GIG_LISTING" | "COFOUNDER_PROFILE",
  targetId: string,
  action: "INTERESTED" | "PASSED" | "APPLIED"
) {
  const res = await fetch("/api/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetType, targetId, action }),
  });
  if (!res.ok) return { matched: false, matchId: null as string | null };
  const data = await res.json();
  return { matched: Boolean(data.matched), matchId: data.matchId ?? null };
}

export default function FeedApp({
  profileComplete,
  jobs,
  gigs,
  cofounders,
  userName,
}: {
  profileComplete: Record<Zone, boolean>;
  jobs: Job[];
  gigs: Gig[];
  cofounders: Cofounder[];
  userName: string;
}) {
  const [mode, setMode] = useState<Zone>("JOB_SEEKER");
  const [match, setMatch] = useState<{ matchId: string; title: string; zone: Zone } | null>(null);

  const activeMode = MODES.find((m) => m.key === mode)!;
  const isComplete = profileComplete[mode];

  return (
    <>
    <AppHeader active="feed" userName={userName} />
    <main className="mx-auto flex max-w-md flex-col px-4 py-8">
      <div className="mb-6 flex justify-center gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              mode === m.key
                ? `bg-gradient-to-r text-white ${ZONE_STYLE[m.key].gradient}`
                : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!isComplete && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-600">
          <span>Add a profile to unlock skill-matched results and apply for real.</span>
          <a
            href={activeMode.profileHref}
            className="shrink-0 rounded-full bg-neutral-900 px-3 py-1.5 font-medium text-white"
          >
            Complete
          </a>
        </div>
      )}

      {mode === "JOB_SEEKER" && (
        <SwipeDeck
          items={jobs}
          itemKey={(j) => j.id}
          itemLabel={(j) => `${j.title} at ${j.company}`}
          leftLabel="Pass"
          rightLabel="Apply"
          emptyLabel="No more jobs right now — check back soon."
          onDecide={async (job, choice: SwipeChoice) => {
            const { matched, matchId } = await sendInteraction(
              "JOB_LISTING",
              job.id,
              choice === "right" ? "APPLIED" : "PASSED"
            );
            if (matched && matchId) setMatch({ matchId, title: `${job.title} at ${job.company}`, zone: "JOB_SEEKER" });
          }}
        >
          {(job) => <JobCard job={job} />}
        </SwipeDeck>
      )}

      {mode === "FREELANCER" && (
        <SwipeDeck
          items={gigs}
          itemKey={(g) => g.id}
          itemLabel={(g) => g.title}
          leftLabel="Pass"
          rightLabel="Apply"
          emptyLabel="No more gigs right now — check back soon."
          onDecide={async (gig, choice: SwipeChoice) => {
            const { matched, matchId } = await sendInteraction(
              "GIG_LISTING",
              gig.id,
              choice === "right" ? "APPLIED" : "PASSED"
            );
            if (matched && matchId) setMatch({ matchId, title: gig.title, zone: "FREELANCER" });
          }}
        >
          {(gig) => <GigCard gig={gig} />}
        </SwipeDeck>
      )}

      {mode === "COFOUNDER" && (
        <SwipeDeck
          items={cofounders}
          itemKey={(c) => c.id}
          itemLabel={(c) => c.name}
          leftLabel="Pass"
          rightLabel="Interested"
          emptyLabel="No more cofounders right now — check back soon."
          onDecide={async (profile, choice: SwipeChoice) => {
            const { matched, matchId } = await sendInteraction(
              "COFOUNDER_PROFILE",
              profile.id,
              choice === "right" ? "INTERESTED" : "PASSED"
            );
            if (matched && matchId) setMatch({ matchId, title: profile.name, zone: "COFOUNDER" });
          }}
        >
          {(profile) => <CofounderCard profile={profile} />}
        </SwipeDeck>
      )}

      <AnimatePresence>
        {match && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-90 ${ZONE_STYLE[match.zone].gradient}`} />
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                className={`relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-lg ring-4 ring-white ${ZONE_STYLE[match.zone].gradient}`}
              >
                {initials(match.title)}
              </motion.div>
              <p className="relative mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                It&apos;s a match
              </p>
              <h2 className="relative mt-1 text-2xl font-bold">{match.title}</h2>
              <p className="relative mt-1 text-sm text-neutral-500">You both said yes — start the conversation.</p>
              <div className="relative mt-6 flex flex-col gap-2">
                <a
                  href={`/matches/${match.matchId}`}
                  className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                >
                  Send a message
                </a>
                <button
                  onClick={() => setMatch(null)}
                  className="rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
                >
                  Keep swiping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </>
  );
}

function CardShell({
  gradient,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  gradient: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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

function JobCard({ job }: { job: Job }) {
  return (
    <CardShell
      gradient={ZONE_STYLE.JOB_SEEKER.gradient}
      eyebrow={job.stage ?? "Startup"}
      title={job.company}
      subtitle={job.title}
    >
      <p className="text-sm text-neutral-700">{job.description}</p>
      {job.location && <p className="mt-2 text-xs text-neutral-500">{job.location}</p>}
      <div className="mt-3">
        <Tags items={job.skills} />
      </div>
    </CardShell>
  );
}

function GigCard({ gig }: { gig: Gig }) {
  return (
    <CardShell
      gradient={ZONE_STYLE.FREELANCER.gradient}
      eyebrow={
        gig.budgetMin || gig.budgetMax
          ? `₹${gig.budgetMin ?? "?"} – ₹${gig.budgetMax ?? "?"}`
          : "Gig"
      }
      title={gig.title}
    >
      <p className="text-sm text-neutral-700">{gig.description}</p>
      <div className="mt-3">
        <Tags items={gig.skills} />
      </div>
    </CardShell>
  );
}

function CofounderCard({ profile }: { profile: Cofounder }) {
  return (
    <CardShell
      gradient={ZONE_STYLE.COFOUNDER.gradient}
      eyebrow={profile.stage ?? "Founder"}
      title={profile.name}
      subtitle={profile.sector ?? undefined}
    >
      <p className="text-sm text-neutral-700">
        Risk tolerance: <span className="font-medium">{profile.riskTolerance ?? "Not specified"}</span>
      </p>
      <p className="mt-2 text-xs text-neutral-500">Idea details unlock after you both match.</p>
      <div className="mt-3">
        <Tags items={profile.skills} />
      </div>
    </CardShell>
  );
}
