import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobFeedFor, gigFeedFor, cofounderFeedFor } from "@/lib/matching";
import FeedApp from "./FeedApp";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      jobSeekerProfile: true,
      cofounderProfile: true,
      freelancerProfile: true,
    },
  });
  if (!user) redirect("/login");

  const [jobs, gigs, cofounders] = await Promise.all([
    jobFeedFor(user.id),
    gigFeedFor(user.id),
    cofounderFeedFor(user.id),
  ]);

  return (
    <FeedApp
      profileComplete={{
        JOB_SEEKER: user.jobSeekerProfile?.isComplete ?? false,
        COFOUNDER: user.cofounderProfile?.isComplete ?? false,
        FREELANCER: user.freelancerProfile?.isComplete ?? false,
      }}
      jobs={jobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        description: j.description,
        skills: j.skillsRequired,
        location: j.location,
        stage: j.stage,
      }))}
      gigs={gigs.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        skills: g.skillsRequired,
        budgetMin: g.budgetMin,
        budgetMax: g.budgetMax,
      }))}
      cofounders={cofounders.map((c) => ({
        id: c.id,
        name: c.user.name,
        stage: c.stage,
        sector: c.sector,
        riskTolerance: c.riskTolerance,
        skills: c.skills,
      }))}
      userName={user.name}
    />
  );
}
