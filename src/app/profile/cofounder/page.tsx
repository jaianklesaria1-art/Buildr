import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CofounderForm from "./Form";

export default async function CofounderProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.cofounderProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Cofounder profile</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Your idea summary stays behind a soft NDA once you match with someone.
      </p>
      <CofounderForm initial={profile} />
    </main>
  );
}
