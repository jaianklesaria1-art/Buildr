import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isParticipant } from "@/lib/matches";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId } = await params;
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.status !== "MUTUAL") {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (!(await isParticipant(match, session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const acceptance = await prisma.ndaAcceptance.upsert({
    where: { matchId_userId: { matchId, userId: session.user.id } },
    create: { matchId, userId: session.user.id },
    update: {},
  });

  return NextResponse.json(acceptance, { status: 200 });
}
