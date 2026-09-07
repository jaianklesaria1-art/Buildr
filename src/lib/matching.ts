import { prisma } from "@/lib/prisma";
import type { TargetType } from "@prisma/client";

export async function seenTargetIds(userId: string, targetType: TargetType) {
  const interactions = await prisma.interaction.findMany({
    where: { userId, targetType },
    select: { targetId: true },
  });
  return interactions.map((i) => i.targetId);
}

function normalize(skill: string) {
  return skill.trim().toLowerCase();
}

// Case-insensitive overlap: an exact match, or one skill containing the
// other as a substring (min length 3 so short skills like "AI" or "Go"
// don't loosely match unrelated words).
function skillsOverlap(a: string[], b: string[]): boolean {
  const normalizedA = a.map(normalize).filter(Boolean);
  const normalizedB = b.map(normalize).filter(Boolean);

  return normalizedA.some((skillA) =>
    normalizedB.some((skillB) => {
      if (skillA === skillB) return true;
      if (skillA.length >= 3 && skillB.includes(skillA)) return true;
      if (skillB.length >= 3 && skillA.includes(skillB)) return true;
      return false;
    })
  );
}

export async function jobFeedFor(userId: string) {
  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });
  const seen = await seenTargetIds(userId, "JOB_LISTING");

  const candidates = await prisma.jobListing.findMany({
    where: { id: { notIn: seen } },
    orderBy: { createdAt: "desc" },
  });

  // No skills on file yet (or no profile at all) — browse everything so
  // swiping works immediately; skills only refine the feed once set.
  if (!profile || profile.skills.length === 0) return candidates.slice(0, 20);

  return candidates.filter((job) => skillsOverlap(profile.skills, job.skillsRequired)).slice(0, 20);
}

export async function gigFeedFor(userId: string) {
  const profile = await prisma.freelancerProfile.findUnique({ where: { userId } });
  const seen = await seenTargetIds(userId, "GIG_LISTING");

  const candidates = await prisma.gigListing.findMany({
    where: { id: { notIn: seen } },
    orderBy: { createdAt: "desc" },
  });

  if (!profile || profile.skills.length === 0) return candidates.slice(0, 20);

  return candidates.filter((gig) => skillsOverlap(profile.skills, gig.skillsRequired)).slice(0, 20);
}

export async function cofounderFeedFor(userId: string) {
  const profile = await prisma.cofounderProfile.findUnique({ where: { userId } });
  const seen = await seenTargetIds(userId, "COFOUNDER_PROFILE");

  return prisma.cofounderProfile.findMany({
    where: {
      id: { notIn: profile ? [...seen, profile.id] : seen },
      userId: { not: userId },
      isComplete: true,
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
