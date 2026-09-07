import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/simulate-cofounder-match.mjs <your-email>");
  process.exit(1);
}

async function main() {
  const me = await prisma.user.findUnique({ where: { email }, include: { cofounderProfile: true } });
  if (!me) throw new Error(`No user with email ${email}`);
  if (!me.cofounderProfile?.isComplete) {
    throw new Error("Complete your cofounder profile first (via /profile/cofounder), then rerun this.");
  }

  const fakeCofounder = await prisma.cofounderProfile.findFirst({
    where: { user: { email: { endsWith: "@buildr.test" } } },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  if (!fakeCofounder) {
    throw new Error("No seeded cofounder profiles found — run `npm run seed` first.");
  }

  const match = await prisma.match.upsert({
    where: {
      initiatorId_targetType_targetId: {
        initiatorId: fakeCofounder.userId,
        targetType: "COFOUNDER_PROFILE",
        targetId: me.cofounderProfile.id,
      },
    },
    create: {
      initiatorId: fakeCofounder.userId,
      targetType: "COFOUNDER_PROFILE",
      targetId: me.cofounderProfile.id,
      status: "MUTUAL",
    },
    update: { status: "MUTUAL" },
  });

  await prisma.ndaAcceptance.upsert({
    where: { matchId_userId: { matchId: match.id, userId: fakeCofounder.userId } },
    create: { matchId: match.id, userId: fakeCofounder.userId },
    update: {},
  });

  await prisma.message.create({
    data: {
      matchId: match.id,
      senderId: fakeCofounder.userId,
      body: `Hey ${me.name.split(" ")[0]}! Excited to have matched — would love to hear more about what you're building.`,
    },
  });

  console.log(`Simulated a mutual match between ${email} and ${fakeCofounder.user.name} (${fakeCofounder.user.email}).`);
  console.log(`Open /matches to see it, or /matches/${match.id} directly.`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
