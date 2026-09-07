import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isParticipant } from "@/lib/matches";

const schema = z.object({ body: z.string().min(1).max(4000) });

export async function POST(
  request: Request,
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

  if (match.targetType === "COFOUNDER_PROFILE") {
    const nda = await prisma.ndaAcceptance.findUnique({
      where: { matchId_userId: { matchId, userId: session.user.id } },
    });
    if (!nda) {
      return NextResponse.json({ error: "NDA_REQUIRED" }, { status: 403 });
    }
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { matchId, senderId: session.user.id, body: parsed.data.body },
  });

  return NextResponse.json(message, { status: 201 });
}
