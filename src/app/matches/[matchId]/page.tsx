import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isParticipant, counterpartUserId } from "@/lib/matches";
import Chat from "./Chat";

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

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-16">
      <h1 className="text-2xl font-semibold">Chat with {counterpart?.name ?? "your match"}</h1>
      <Chat
        matchId={matchId}
        currentUserId={session.user.id}
        initialMessages={messages}
        requiresNda={match.targetType === "COFOUNDER_PROFILE"}
        ndaAccepted={Boolean(nda)}
      />
    </main>
  );
}
