import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ZONE_CONFIG = {
  JOB_SEEKER: { label: "Job Seeker", profileHref: "/profile/job-seeker", feedHref: "/feed" },
  COFOUNDER: { label: "Cofounder", profileHref: "/profile/cofounder", feedHref: "/feed" },
  FREELANCER: { label: "Freelancer", profileHref: "/profile/freelancer", feedHref: "/feed" },
} as const;

export default async function DashboardPage() {
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

  const profileByZone = {
    JOB_SEEKER: user.jobSeekerProfile,
    COFOUNDER: user.cofounderProfile,
    FREELANCER: user.freelancerProfile,
  } as const;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">Your zones and their status.</p>

      <div className="mt-8 flex flex-col gap-4">
        {user.zones
          .filter((zone): zone is keyof typeof ZONE_CONFIG => zone in ZONE_CONFIG)
          .map((zone) => {
          const config = ZONE_CONFIG[zone];
          const profile = profileByZone[zone];
          const isComplete = profile?.isComplete ?? false;

          return (
            <div key={zone} className="rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{config.label}</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isComplete
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isComplete ? "Profile complete" : "Profile incomplete"}
                </span>
              </div>
              <div className="mt-3 flex gap-3 text-sm">
                <a href={config.profileHref} className="font-medium underline">
                  {isComplete ? "Edit profile" : "Complete profile"}
                </a>
                {isComplete && (
                  <a href={config.feedHref} className="font-medium underline">
                    Start swiping
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
