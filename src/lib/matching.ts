import { prisma } from "@/lib/prisma";
import type { TargetType } from "@prisma/client";

export async function seenTargetIds(userId: string, targetType: TargetType) {
  const interactions = await prisma.interaction.findMany({
    where: { userId, targetType },
    select: { targetId: true },
  });
  return interactions.map((i) => i.targetId);
}

export async function jobFeedFor(userId: string) {
  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const seen = await seenTargetIds(userId, "JOB_LISTING");

  return prisma.jobListing.findMany({
    where: {
      id: { notIn: seen },
      skillsRequired: { hasSome: profile.skills },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function gigFeedFor(userId: string) {
  const profile = await prisma.freelancerProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const seen = await seenTargetIds(userId, "GIG_LISTING");

  return prisma.gigListing.findMany({
    where: {
      id: { notIn: seen },
      skillsRequired: { hasSome: profile.skills },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function cofounderFeedFor(userId: string) {
  const profile = await prisma.cofounderProfile.findUnique({ where: { userId } });
  if (!profile) return [];

  const seen = await seenTargetIds(userId, "COFOUNDER_PROFILE");

  return prisma.cofounderProfile.findMany({
    where: {
      id: { notIn: [...seen, profile.id] },
      userId: { not: userId },
      isComplete: true,
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
