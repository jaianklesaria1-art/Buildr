import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  targetType: z.enum(["JOB_LISTING", "GIG_LISTING", "COFOUNDER_PROFILE"]),
  targetId: z.string(),
  action: z.enum(["VIEWED", "INTERESTED", "PASSED", "APPLIED"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { targetType, targetId, action } = parsed.data;

  await prisma.interaction.create({
    data: { userId, targetType, targetId, action },
  });

  if (action === "PASSED" || action === "VIEWED") {
    return NextResponse.json({ matched: false });
  }

  if (action === "APPLIED" && (targetType === "JOB_LISTING" || targetType === "GIG_LISTING")) {
    const match = await prisma.match.upsert({
      where: {
        initiatorId_targetType_targetId: { initiatorId: userId, targetType, targetId },
      },
      create: { initiatorId: userId, targetType, targetId, status: "MUTUAL" },
      update: { status: "MUTUAL" },
    });
    return NextResponse.json({ matched: true, matchId: match.id });
  }

  if (action === "INTERESTED" && targetType === "COFOUNDER_PROFILE") {
    const [myProfile, theirProfile] = await Promise.all([
      prisma.cofounderProfile.findUnique({ where: { userId } }),
      prisma.cofounderProfile.findUnique({ where: { id: targetId } }),
    ]);
    if (!theirProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    // Browsing without a cofounder profile yet: the interest is recorded
    // above, but there's nothing of theirs to reciprocate against, so no
    // match can form until this user completes their own profile.
    if (!myProfile) {
      return NextResponse.json({ matched: false });
    }

    // A mutual pair should share exactly one chat thread. If they already
    // expressed interest in me, that existing Match row becomes the thread
    // for both of us instead of creating a second, duplicate one.
    const reciprocal = await prisma.match.findUnique({
      where: {
        initiatorId_targetType_targetId: {
          initiatorId: theirProfile.userId,
          targetType: "COFOUNDER_PROFILE",
          targetId: myProfile.id,
        },
      },
    });

    if (reciprocal) {
      const updated = await prisma.match.update({
        where: { id: reciprocal.id },
        data: { status: "MUTUAL" },
      });
      return NextResponse.json({ matched: true, matchId: updated.id });
    }

    const myMatch = await prisma.match.upsert({
      where: {
        initiatorId_targetType_targetId: {
          initiatorId: userId,
          targetType: "COFOUNDER_PROFILE",
          targetId,
        },
      },
      create: {
        initiatorId: userId,
        targetType: "COFOUNDER_PROFILE",
        targetId,
        status: "PENDING",
      },
      update: {},
    });

    return NextResponse.json({ matched: false, matchId: myMatch.id });
  }

  return NextResponse.json({ matched: false });
}
