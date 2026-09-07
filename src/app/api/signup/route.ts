import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CONSENT_NOTICE_VERSION } from "@/lib/consent";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  zones: z
    .array(z.enum(["JOB_SEEKER", "COFOUNDER", "FREELANCER"]))
    .min(1, "Select at least one zone"),
  consentAccepted: z.literal(true, {
    message: "You must accept the data notice to sign up",
  }),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password, zones, consentAccepted } = parsed.data;
  void consentAccepted;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      zones,
      consents: {
        create: {
          context: "signup",
          noticeVersion: CONSENT_NOTICE_VERSION,
        },
      },
    },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
