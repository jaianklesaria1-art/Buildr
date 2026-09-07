import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsent } from "@/lib/consent";

const schema = z.object({
  skills: z.array(z.string()).min(1),
  stage: z.string().optional(),
  sector: z.string().optional(),
  riskTolerance: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  equityExpectation: z.string().optional(),
  ideaSummary: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const isComplete = Boolean(
    data.skills.length && data.stage && data.riskTolerance && data.ideaSummary
  );

  const profile = await prisma.cofounderProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data, isComplete },
    update: { ...data, isComplete },
  });

  await recordConsent(session.user.id, "cofounder_profile");

  return NextResponse.json(profile, { status: 200 });
}
