import { prisma } from "@/lib/prisma";
import type { Match } from "@prisma/client";

export async function counterpartUserId(match: Match): Promise<string | null> {
  if (match.targetType === "JOB_LISTING") {
    const listing = await prisma.jobListing.findUnique({ where: { id: match.targetId } });
    return listing?.postedByUserId ?? null;
  }
  if (match.targetType === "GIG_LISTING") {
    const listing = await prisma.gigListing.findUnique({ where: { id: match.targetId } });
    return listing?.postedByUserId ?? null;
  }
  const profile = await prisma.cofounderProfile.findUnique({ where: { id: match.targetId } });
  return profile?.userId ?? null;
}

export async function isParticipant(match: Match, userId: string): Promise<boolean> {
  if (match.initiatorId === userId) return true;
  const counterpart = await counterpartUserId(match);
  return counterpart === userId;
}
