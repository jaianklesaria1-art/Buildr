import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/promote-admin.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

const user = await prisma.user.update({
  where: { email },
  data: { isAdmin: true },
});

console.log(`${user.email} is now an admin.`);
await prisma.$disconnect();
