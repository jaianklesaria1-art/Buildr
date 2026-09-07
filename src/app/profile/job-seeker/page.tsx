import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import JobSeekerForm from "./Form";

export default async function JobSeekerProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Job Seeker profile</h1>
      <p className="mt-1 text-sm text-neutral-500">
        This drives what roles show up in your feed.
      </p>
      <JobSeekerForm initial={profile} />
    </main>
  );
}
