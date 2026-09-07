import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { matchSummariesForUser } from "@/lib/matches";
import AppHeader from "@/components/app/AppHeader";

const ZONE_GRADIENT = {
  JOB_SEEKER: "from-blue-500 to-indigo-600",
  COFOUNDER: "from-fuchsia-500 to-purple-600",
  FREELANCER: "from-amber-500 to-orange-600",
} as const;

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function MatchesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const matches = await matchSummariesForUser(session.user.id);

  return (
    <>
      <AppHeader active="matches" userName={session.user.name ?? ""} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Matches</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Everyone you&apos;ve mutually matched with, across all zones.
        </p>

        {matches.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 p-10 text-center">
            <p className="text-sm text-neutral-500">No matches yet.</p>
            <a href="/feed" className="mt-3 inline-block rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white">
              Start swiping
            </a>
          </div>
        )}

        <div className="mt-6 flex flex-col divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
          {matches.map((m) => (
            <a
              key={m.id}
              href={`/matches/${m.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${ZONE_GRADIENT[m.zone]}`}
              >
                {initials(m.counterpartName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-medium">{m.counterpartName}</p>
                  <span className="shrink-0 text-xs text-neutral-400">{relativeTime(m.lastMessageAt)}</span>
                </div>
                <p className="truncate text-xs font-medium text-neutral-500">{m.contextLabel}</p>
                <p className="mt-0.5 truncate text-sm text-neutral-600">
                  {m.lastMessage ?? "No messages yet — say hello"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
