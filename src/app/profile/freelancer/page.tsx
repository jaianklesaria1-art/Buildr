import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FreelancerForm from "./Form";

export default async function FreelancerProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Freelancer profile</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Set your own rate. No lock-in, no hidden fees.
      </p>
      <FreelancerForm initial={profile} />
    </main>
  );
}
