import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordConsent } from "@/lib/consent";

const schema = z.object({
  skills: z.array(z.string()).min(1),
  hourlyRate: z.coerce.number().int().positive().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  availability: z.string().optional(),
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
  const isComplete = Boolean(data.skills.length && data.hourlyRate && data.portfolioUrl);

  const profile = await prisma.freelancerProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data, isComplete },
    update: { ...data, isComplete },
  });

  await recordConsent(session.user.id, "freelancer_profile");

  return NextResponse.json(profile, { status: 200 });
}
