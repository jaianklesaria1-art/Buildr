import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

const TABLES = {
  users: () =>
    prisma.user.findMany({
      select: { id: true, name: true, email: true, zones: true, createdAt: true },
    }),
  "job-seeker-profiles": () => prisma.jobSeekerProfile.findMany(),
  "cofounder-profiles": () => prisma.cofounderProfile.findMany(),
  "freelancer-profiles": () => prisma.freelancerProfile.findMany(),
  interactions: () => prisma.interaction.findMany(),
  matches: () => prisma.match.findMany(),
  messages: () => prisma.message.findMany(),
  consents: () => prisma.consentRecord.findMany(),
} as const;

type TableName = keyof typeof TABLES;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { table } = await params;
  if (!(table in TABLES)) {
    return NextResponse.json({ error: "Unknown table" }, { status: 404 });
  }

  const rows = await TABLES[table as TableName]();
  const csv = toCsv(rows as unknown as Record<string, unknown>[]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${table}.csv"`,
    },
  });
}
