import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isParticipant, counterpartUserId } from "@/lib/matches";
import Chat from "./Chat";

const ZONE_GRADIENT = {
  JOB_LISTING: "from-blue-500 to-indigo-600",
  GIG_LISTING: "from-amber-500 to-orange-600",
  COFOUNDER_PROFILE: "from-fuchsia-500 to-purple-600",
} as const;

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { matchId } = await params;
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) notFound();
  if (!(await isParticipant(match, session.user.id))) notFound();

  if (match.status !== "MUTUAL") {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <p className="text-sm text-neutral-500">This match isn&apos;t confirmed from both sides yet.</p>
      </main>
    );
  }

  const [messages, nda, counterpartId] = await Promise.all([
    prisma.message.findMany({ where: { matchId }, orderBy: { createdAt: "asc" } }),
    prisma.ndaAcceptance.findUnique({
      where: { matchId_userId: { matchId, userId: session.user.id } },
    }),
    counterpartUserId(match),
  ]);

  const counterpart = counterpartId
    ? await prisma.user.findUnique({ where: { id: counterpartId }, select: { name: true } })
    : null;

  let contextLabel = "Match";
  if (match.targetType === "JOB_LISTING") {
    const listing = await prisma.jobListing.findUnique({ where: { id: match.targetId } });
    contextLabel = listing ? `${listing.title} at ${listing.company}` : "Job application";
  } else if (match.targetType === "GIG_LISTING") {
    const listing = await prisma.gigListing.findUnique({ where: { id: match.targetId } });
    contextLabel = listing ? listing.title : "Gig application";
  } else {
    contextLabel = "Cofounder match";
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <header className="flex shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <a
          href="/matches"
          aria-label="Back to matches"
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </a>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${ZONE_GRADIENT[match.targetType]}`}
        >
          {(counterpart?.name ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold leading-tight">
            {counterpart?.name ?? "Your match"}
          </h1>
          <p className="truncate text-xs text-neutral-500">{contextLabel}</p>
        </div>
      </header>

      <Chat
        matchId={matchId}
        currentUserId={session.user.id}
        counterpartName={counterpart?.name ?? "your match"}
        initialMessages={messages}
        requiresNda={match.targetType === "COFOUNDER_PROFILE"}
        ndaAccepted={Boolean(nda)}
      />
    </div>
  );
}
