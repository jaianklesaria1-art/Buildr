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

export type MatchSummary = {
  id: string;
  counterpartId: string;
  counterpartName: string;
  contextLabel: string;
  zone: "JOB_SEEKER" | "COFOUNDER" | "FREELANCER";
  lastMessage: string | null;
  lastMessageAt: Date;
};

const ZONE_BY_TARGET_TYPE = {
  JOB_LISTING: "JOB_SEEKER",
  GIG_LISTING: "FREELANCER",
  COFOUNDER_PROFILE: "COFOUNDER",
} as const;

async function contextLabelFor(match: Match): Promise<string> {
  if (match.targetType === "JOB_LISTING") {
    const listing = await prisma.jobListing.findUnique({ where: { id: match.targetId } });
    return listing ? `${listing.title} at ${listing.company}` : "Job application";
  }
  if (match.targetType === "GIG_LISTING") {
    const listing = await prisma.gigListing.findUnique({ where: { id: match.targetId } });
    return listing ? listing.title : "Gig application";
  }
  return "Cofounder match";
}

export async function matchSummariesForUser(userId: string): Promise<MatchSummary[]> {
  const [jobListings, gigListings, cofounderProfile] = await Promise.all([
    prisma.jobListing.findMany({ where: { postedByUserId: userId }, select: { id: true } }),
    prisma.gigListing.findMany({ where: { postedByUserId: userId }, select: { id: true } }),
    prisma.cofounderProfile.findUnique({ where: { userId }, select: { id: true } }),
  ]);

  const matches = await prisma.match.findMany({
    where: {
      status: "MUTUAL",
      OR: [
        { initiatorId: userId },
        { targetType: "JOB_LISTING", targetId: { in: jobListings.map((j) => j.id) } },
        { targetType: "GIG_LISTING", targetId: { in: gigListings.map((g) => g.id) } },
        ...(cofounderProfile
          ? [{ targetType: "COFOUNDER_PROFILE" as const, targetId: cofounderProfile.id }]
          : []),
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  const summaries = await Promise.all(
    matches.map(async (match) => {
      const counterpartId =
        match.initiatorId === userId ? await counterpartUserId(match) : match.initiatorId;
      if (!counterpartId) return null;

      const [counterpart, lastMessage, contextLabel] = await Promise.all([
        prisma.user.findUnique({ where: { id: counterpartId }, select: { name: true } }),
        prisma.message.findFirst({ where: { matchId: match.id }, orderBy: { createdAt: "desc" } }),
        contextLabelFor(match),
      ]);
      if (!counterpart) return null;

      const summary: MatchSummary = {
        id: match.id,
        counterpartId,
        counterpartName: counterpart.name,
        contextLabel,
        zone: ZONE_BY_TARGET_TYPE[match.targetType],
        lastMessage: lastMessage?.body ?? null,
        lastMessageAt: lastMessage?.createdAt ?? match.updatedAt,
      };
      return summary;
    })
  );

  return summaries
    .filter((s): s is MatchSummary => s !== null)
    .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
}
